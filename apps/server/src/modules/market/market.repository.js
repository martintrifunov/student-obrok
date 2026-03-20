import { MarketModel } from "./market.model.js";

export class MarketRepository {
  #populate() {
    return {
      vendor: {
        path: "vendor",
        populate: { path: "image", select: "title url mimeType" },
      },
    };
  }

  #buildQuery(filter = {}) {
    const query = {};
    if (filter.name) {
      query.name = { $regex: filter.name, $options: "i" };
    }
    if (filter.vendor) {
      query.vendor = filter.vendor;
    }
    return query;
  }

  async findAll({ page, limit, filter = {} }) {
    const { vendor } = this.#populate();
    const query = this.#buildQuery(filter);

    if (limit === 0) {
      const docs = await MarketModel.find(query).populate(vendor).exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      MarketModel.find(query).populate(vendor).skip(skip).limit(limit).exec(),
      MarketModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }

  async findById(id) {
    const { vendor } = this.#populate();
    return MarketModel.findById(id).populate(vendor).exec();
  }

  async findByName(name) {
    return MarketModel.findOne({ name }).exec();
  }

  async findByVendor(vendorId) {
    return MarketModel.find({ vendor: vendorId }).exec();
  }

  async findAllForReport() {
    return MarketModel.find()
      .populate({
        path: "vendor",
        populate: { path: "image", select: "title filename" },
      })
      .populate({
        path: "marketProducts",
        populate: { path: "product" },
      })
      .exec();
  }

  async create(data) {
    return MarketModel.create(data);
  }

  async save(market) {
    return market.save();
  }

  async delete(market) {
    return market.deleteOne();
  }
}
