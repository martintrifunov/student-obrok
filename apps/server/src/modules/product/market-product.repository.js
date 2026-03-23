import mongoose from "mongoose";
import { MarketProductModel } from "./market-product.model.js";

const latToCyrMap = {
  dzh: "џ",
  nj: "њ",
  lj: "љ",
  dz: "ѕ",
  zh: "ж",
  sh: "ш",
  ch: "ч",
  gj: "ѓ",
  kj: "ќ",
  a: "а",
  b: "б",
  c: "ц",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "х",
  i: "и",
  j: "ј",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "к",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в",
  x: "кс",
  y: "и",
  z: "з",
};

function buildBilingualRegex(text) {
  if (!text) return null;
  let cyrStr = text.toLowerCase();
  for (const [lat, cyr] of Object.entries(latToCyrMap)) {
    cyrStr = cyrStr.split(lat).join(cyr);
  }
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `${escapeRegExp(text)}|${escapeRegExp(cyrStr)}`;
}

export class MarketProductRepository {
  async findByMarket({ marketId, page, limit, filter = {} }) {
    const matchStage = { market: new mongoose.Types.ObjectId(marketId) };

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      matchStage.price = {};
      if (filter.minPrice !== undefined)
        matchStage.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined)
        matchStage.price.$lte = filter.maxPrice;
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
      const regexPattern = buildBilingualRegex(filter.title);
      pipeline.push({
        $match: { "product.title": { $regex: regexPattern, $options: "i" } },
      });
    }

    if (filter.category) {
      const regexPattern = buildBilingualRegex(filter.category);
      pipeline.push({
        $match: { "product.category": { $regex: regexPattern, $options: "i" } },
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
      { $unwind: { path: "$product.image", preserveNullAndEmptyArrays: true } },
    );

    if (limit === 0) {
      const docs = await MarketProductModel.aggregate(pipeline);
      return { docs, total: null };
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const [countResult] = await MarketProductModel.aggregate(countPipeline);
    const total = countResult?.total || 0;

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    const docs = await MarketProductModel.aggregate(pipeline);
    return { docs, total };
  }

  async getUniqueCategories(marketId) {
    const pipeline = [
      { $match: { market: new mongoose.Types.ObjectId(marketId) } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $group: { _id: "$product.category" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
    ];
    const results = await MarketProductModel.aggregate(pipeline);
    return results.map((r) => r._id);
  }

  async findByProduct(productId) {
    return MarketProductModel.find({ product: productId })
      .populate({
        path: "market",
        populate: {
          path: "chain",
          populate: { path: "image", select: "title url mimeType" },
        },
      })
      .exec();
  }

  async bulkUpsert(entries) {
    if (!entries.length) return null;
    const ops = entries.map(({ market, product, price }) => ({
      updateOne: {
        filter: { market, product },
        update: { $set: { market, product, price } },
        upsert: true,
      },
    }));
    return MarketProductModel.bulkWrite(ops, { ordered: false });
  }

  async create(data) {
    return MarketProductModel.create(data);
  }

  async deleteByMarket(marketId) {
    return MarketProductModel.deleteMany({ market: marketId }).exec();
  }

  async deleteByProduct(productId) {
    return MarketProductModel.deleteMany({ product: productId }).exec();
  }
}
