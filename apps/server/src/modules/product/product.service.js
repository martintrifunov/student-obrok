import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { buildPaginationMeta } from "../../shared/utils/buildPaginationMeta.js";

export class ProductService {
  constructor(
    productRepository,
    vendorRepository,
    imageRepository,
    vendorProductRepository,
  ) {
    this.productRepository = productRepository;
    this.vendorRepository = vendorRepository;
    this.imageRepository = imageRepository;
    this.vendorProductRepository = vendorProductRepository;
  }

  async getAllProducts({
    page = 1,
    limit = 10,
    title,
    category,
    vendorId,
    minPrice,
    maxPrice,
  }) {
    if (vendorId) {
      const filter = {};
      if (title) filter.title = title;
      if (category) filter.category = category;
      if (minPrice !== undefined) filter.minPrice = minPrice;
      if (maxPrice !== undefined) filter.maxPrice = maxPrice;

      const { docs, total } = await this.vendorProductRepository.findByVendor({
        vendorId,
        page,
        limit,
        filter,
      });

      return {
        data: docs,
        pagination: buildPaginationMeta({ total, page, limit }),
      };
    }

    const filter = {};
    if (title) filter.title = title;
    if (category) filter.category = category;

    const { docs, total } = await this.productRepository.findAll({
      page,
      limit,
      filter,
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

  async createProduct({ title, description, category, vendor, price, image }) {
    if (vendor) {
      const foundVendor = await this.vendorRepository.findById(vendor);
      if (!foundVendor) throw new NotFoundError("Vendor not found.");
    }

    if (image) {
      const imageExists = await this.imageRepository.findById(image);
      if (!imageExists) throw new NotFoundError("Selected image not found.");
    }

    const product = await this.productRepository.create({
      title,
      description,
      category,
      image: image || null,
    });

    if (vendor && price !== undefined) {
      await this.vendorProductRepository.create({
        vendor,
        product: product._id,
        price,
      });
    }

    return product;
  }

  async updateProduct(id, { title, description, category, image }) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`No product matches ID ${id}.`);

    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;

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
    await this.vendorProductRepository.deleteByProduct(id);
    await this.productRepository.delete(product);
  }
}
