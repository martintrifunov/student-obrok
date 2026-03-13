import { ProductModel } from "./product.model.js";

export class ProductRepository {
  #populate() {
    return {
      vendor: { path: "vendor" },
      image: { path: "image", select: "title url mimeType" },
    };
  }

  #buildQuery(filter = {}) {
    const query = {};
    if (filter.title) {
      query.title = { $regex: filter.title, $options: "i" };
    }
    if (filter.vendorId) {
      query.vendor = filter.vendorId;
    }
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
    }
    return query;
  }

  async findAll({ page, limit, filter = {} }) {
    const { vendor, image } = this.#populate();
    const query = this.#buildQuery(filter);

    if (limit === 0) {
      const docs = await ProductModel.find(query)
        .populate(vendor)
        .populate(image)
        .exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ProductModel.find(query)
        .populate(vendor)
        .populate(image)
        .skip(skip)
        .limit(limit)
        .exec(),
      ProductModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }

  async findById(id) {
    const { vendor, image } = this.#populate();
    return ProductModel.findById(id).populate(vendor).populate(image).exec();
  }

  async create(data) {
    return ProductModel.create(data);
  }

  async save(product) {
    return product.save();
  }

  async delete(product) {
    return product.deleteOne();
  }
}
