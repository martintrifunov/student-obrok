import { VendorModel } from "./vendor.model.js";

export class VendorRepository {
  #populate() {
    return {
      image: { path: "image", select: "title url mimeType" },
      markets: { path: "markets" },
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
    const { image, markets } = this.#populate();
    const query = this.#buildQuery(filter);

    if (limit === 0) {
      const docs = await VendorModel.find(query)
        .populate(image)
        .populate(markets)
        .exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      VendorModel.find(query)
        .populate(image)
        .populate(markets)
        .skip(skip)
        .limit(limit)
        .exec(),
      VendorModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }

  async findById(id) {
    const { image, markets } = this.#populate();
    return VendorModel.findById(id).populate(image).populate(markets).exec();
  }

  async findByName(name) {
    return VendorModel.findOne({ name }).exec();
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
}
