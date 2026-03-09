import { ValidationError } from "../../shared/errors/ValidationError.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { isValidObjectId } from "../../shared/utils/isValidObjectId.js";

export class ProductService {
  constructor(productRepository, vendorRepository, imageRepository) {
    this.productRepository = productRepository;
    this.vendorRepository = vendorRepository;
    this.imageRepository = imageRepository;
  }

  async getAllProducts() {
    return this.productRepository.findAll();
  }

  async getProductById(id) {
    if (!isValidObjectId(id)) throw new ValidationError("Invalid ID format.");

    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`No product matches ID ${id}.`);

    return product;
  }

  async createProduct({ title, description, price, vendor, image }) {
    if (!title) throw new ValidationError("Title is required.");
    if (!description) throw new ValidationError("Description is required.");
    if (!price) throw new ValidationError("Price is required.");
    if (!vendor) throw new ValidationError("Vendor is required.");

    if (!isValidObjectId(vendor))
      throw new ValidationError("Invalid vendor ID format.");

    const foundVendor = await this.vendorRepository.findById(vendor);
    if (!foundVendor) throw new NotFoundError("Vendor not found.");

    if (image) {
      if (!isValidObjectId(image))
        throw new ValidationError("Invalid image ID format.");

      const imageExists = await this.imageRepository.findById(image);
      if (!imageExists) throw new NotFoundError("Selected image not found.");
    }

    const product = await this.productRepository.create({
      title,
      description,
      price,
      vendor,
      image: image || null,
    });

    await this.vendorRepository.addProduct(foundVendor, product._id);

    return product;
  }

  async updateProduct(id, { title, description, price, image, vendor }) {
    if (!id) throw new ValidationError("ID is required.");
    if (!isValidObjectId(id)) throw new ValidationError("Invalid ID format.");

    if (vendor) throw new ValidationError("Vendor can't be changed.");

    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`No product matches ID ${id}.`);

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;

    if (image) {
      if (!isValidObjectId(image))
        throw new ValidationError("Invalid image ID format.");

      const imageExists = await this.imageRepository.findById(image);
      if (!imageExists) throw new NotFoundError("Selected image not found.");

      product.image = image;
    }

    return this.productRepository.save(product);
  }

  async deleteProduct(id) {
    if (!id) throw new ValidationError("ID is required.");
    if (!isValidObjectId(id)) throw new ValidationError("Invalid ID format.");

    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError(`No product matches ID ${id}.`);

    const vendor = await this.vendorRepository.findById(
      product.vendor._id ?? product.vendor,
    );

    if (vendor) {
      await this.vendorRepository.removeProduct(vendor, id);
    }

    await this.productRepository.delete(product);
  }
}
