import { ProductModel } from "../../models/Product.model.js";

export class ProductRepository {
  #populate() {
    return {
      vendor: { path: "vendor" },
      image: { path: "image", select: "title url mimeType" },
    };
  }

  async findAll() {
    const { vendor, image } = this.#populate();
    return ProductModel.find().populate(vendor).populate(image).exec();
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
