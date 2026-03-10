import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { buildPaginationMeta } from "../../shared/utils/buildPaginationMeta.js";

export class ProductService {
  constructor(productRepository, vendorRepository, imageRepository) {
    this.productRepository = productRepository;
    this.vendorRepository = vendorRepository;
    this.imageRepository = imageRepository;
  }

  async getAllProducts({ page, limit }) {
    const { docs, total } = await this.productRepository.findAll({
      page,
      limit,
    });
    return {
      data: docs,
      pagination: buildPaginationMeta({ total, page, limit }),
    };
  }

  async getProductById(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`No product matches ID ${id}.`);
    return product;
  }

  async createProduct({ title, description, price, vendor, image }) {
    const foundVendor = await this.vendorRepository.findById(vendor);
    if (!foundVendor) throw new NotFoundError("Vendor not found.");

    if (image) {
      const imageExists = await this.imageRepository.findById(image);
      if (!imageExists) throw new NotFoundError("Selected image not found.");
    }

    return this.productRepository.create({
      title,
      description,
      price,
      vendor,
      image: image || null,
    });
  }

  async updateProduct(id, { title, description, price, image }) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`No product matches ID ${id}.`);

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;

    if (image) {
      const imageExists = await this.imageRepository.findById(image);
      if (!imageExists) throw new NotFoundError("Selected image not found.");
      product.image = image;
    }

    return this.productRepository.save(product);
  }

  async deleteProduct(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`No product matches ID ${id}.`);
    await this.productRepository.delete(product);
  }
}
