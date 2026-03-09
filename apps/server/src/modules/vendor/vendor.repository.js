import { VendorModel } from "../../models/Vendor.model.js";
import { ProductModel } from "../../models/Product.model.js";

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

  async findAll({ page, limit }) {
    const { productsWithImage, image } = this.#populate();
    if (limit === 0) {
      const docs = await VendorModel.find()
        .populate(productsWithImage)
        .populate(image)
        .exec();
      return { docs, total: null };
    }
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      VendorModel.find()
        .populate(productsWithImage)
        .populate(image)
        .skip(skip)
        .limit(limit)
        .exec(),
      VendorModel.countDocuments().exec(),
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

  async findAllForReport() {
    return VendorModel.find()
      .populate("products")
      .populate("image", "title filename")
      .exec();
  }

  async create(data) {
    return VendorModel.create({ ...data, products: null });
  }

  async save(vendor) {
    return vendor.save();
  }

  async delete(vendor) {
    return vendor.deleteOne();
  }

  async deleteProductsOfVendor(productIds) {
    return ProductModel.deleteMany({ _id: { $in: productIds } }).exec();
  }

  async addProduct(vendor, productId) {
    if (!vendor.products) vendor.products = [];
    vendor.products.push(productId);
    return vendor.save();
  }

  async removeProduct(vendor, productId) {
    vendor.products = (vendor.products || []).filter(
      (pid) => pid.toString() !== productId.toString(),
    );
    if (vendor.products.length === 0) vendor.products = null;
    return vendor.save();
  }
}
