import mongoose from "mongoose";
import { VendorProductModel } from "./vendor-product.model.js";

export class VendorProductRepository {
  async findByVendor({ vendorId, page, limit, filter = {} }) {
    const matchStage = { vendor: new mongoose.Types.ObjectId(vendorId) };

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      matchStage.price = {};
      if (filter.minPrice !== undefined) {
        matchStage.price.$gte = filter.minPrice;
      }
      if (filter.maxPrice !== undefined) {
        matchStage.price.$lte = filter.maxPrice;
      }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ];

    if (filter.title) {
      pipeline.push({
        $match: { "product.title": { $regex: filter.title, $options: "i" } },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "images",
          localField: "product.image",
          foreignField: "_id",
          pipeline: [{ $project: { title: 1, url: 1, mimeType: 1 } }],
          as: "product.image",
        },
      },
      {
        $unwind: {
          path: "$product.image",
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    if (limit === 0) {
      const docs = await VendorProductModel.aggregate(pipeline);
      return { docs, total: null };
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const [countResult] = await VendorProductModel.aggregate(countPipeline);
    const total = countResult?.total || 0;

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    const docs = await VendorProductModel.aggregate(pipeline);
    return { docs, total };
  }

  async findByProduct(productId) {
    return VendorProductModel.find({ product: productId })
      .populate({
        path: "vendor",
        populate: { path: "image", select: "title url mimeType" },
      })
      .exec();
  }

  async bulkUpsert(entries) {
    if (!entries.length) return null;

    const ops = entries.map(({ vendor, product, price }) => ({
      updateOne: {
        filter: { vendor, product },
        update: { $set: { vendor, product, price } },
        upsert: true,
      },
    }));

    return VendorProductModel.bulkWrite(ops, { ordered: false });
  }

  async create(data) {
    return VendorProductModel.create(data);
  }

  async deleteByVendor(vendorId) {
    return VendorProductModel.deleteMany({ vendor: vendorId }).exec();
  }

  async deleteByProduct(productId) {
    return VendorProductModel.deleteMany({ product: productId }).exec();
  }
}
