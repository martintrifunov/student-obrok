import { VendorModel } from "./vendor.model.js";

export class VendorRepository {
  #populate() {
    return {
      vendorProducts: {
        path: "vendorProducts",
        populate: {
          path: "product",
          populate: { path: "image", select: "title url mimeType" },
        },
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
    const { vendorProducts, image } = this.#populate();
    const query = this.#buildQuery(filter);

    if (limit === 0) {
      const docs = await VendorModel.find(query)
        .populate(vendorProducts)
        .populate(image)
        .exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      VendorModel.find(query)
        .populate(vendorProducts)
        .populate(image)
        .skip(skip)
        .limit(limit)
        .exec(),
      VendorModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }

  async findById(id) {
    const { vendorProducts, image } = this.#populate();
    return VendorModel.findById(id)
      .populate(vendorProducts)
      .populate(image)
      .exec();
  }

  async findByName(name) {
    return VendorModel.findOne({ name }).exec();
  }

  async findAllForReport() {
    return VendorModel.find()
      .populate({
        path: "vendorProducts",
        populate: { path: "product" },
      })
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
}
