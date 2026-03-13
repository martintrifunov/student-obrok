import { VendorModel } from "./vendor.model.js";
import { ProductModel } from "../product/product.model.js";

export class VendorRepository {
  #populate() {
    return {
      productsWithImage: {
        path: "products",
        populate: { path: "image", select: "title url mimeType" },
      },
      image: { path: "image", select: "title url mimeType" },
    };
  }

  #buildQuery(filter = {}) {
    const query = {};
    if (filter.name) {
      query.name = { $regex: filter.name, $options: "i" };
    }
    return query;
  }

  async findAll({ page, limit, filter = {} }) {
    const { productsWithImage, image } = this.#populate();
    const query = this.#buildQuery(filter);

    if (limit === 0) {
      const docs = await VendorModel.find(query)
        .populate(productsWithImage)
        .populate(image)
        .exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      VendorModel.find(query)
        .populate(productsWithImage)
        .populate(image)
        .skip(skip)
        .limit(limit)
        .exec(),
      VendorModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }

  async findById(id) {
    const { productsWithImage, image } = this.#populate();
    return VendorModel.findById(id)
      .populate(productsWithImage)
      .populate(image)
      .exec();
  }

  async findByName(name) {
    return VendorModel.findOne({ name }).exec();
  }

  async findAllForReport() {
    return VendorModel.find()
      .populate("products")
      .populate("image", "title filename")
      .exec();
  }

  async create(data) {
    return VendorModel.create(data);
  }

  async save(vendor) {
    return vendor.save();
  }

  async delete(vendor) {
    return vendor.deleteOne();
  }

  async deleteProductsByVendor(vendorId) {
    return ProductModel.deleteMany({ vendor: vendorId }).exec();
  }
}
