import { ProductModel } from "../../models/Product.model.js";

export class ProductRepository {
  #populate() {
    return {
      vendor: { path: "vendor" },
      image: { path: "image", select: "title url mimeType" },
    };
  }

  async findAll({ page, limit }) {
    const { vendor, image } = this.#populate();
    if (limit === 0) {
      const docs = await ProductModel.find()
        .populate(vendor)
        .populate(image)
        .exec();
      return { docs, total: null };
    }
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ProductModel.find()
        .populate(vendor)
        .populate(image)
        .skip(skip)
        .limit(limit)
        .exec(),
      ProductModel.countDocuments().exec(),
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
