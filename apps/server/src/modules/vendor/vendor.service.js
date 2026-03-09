import { Parser } from "json2csv";
import { ValidationError } from "../../shared/errors/ValidationError.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { isValidObjectId } from "../../shared/utils/isValidObjectId.js";

export class VendorService {
  constructor(vendorRepository, imageRepository) {
    this.vendorRepository = vendorRepository;
    this.imageRepository = imageRepository;
  }

  async getAllVendors() {
    return this.vendorRepository.findAll();
  }

  async getVendorById(id) {
    if (!isValidObjectId(id)) throw new ValidationError("Invalid ID format.");

    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError(`No vendor matches ID ${id}.`);

    return vendor;
  }

  async createVendor({ name, location, image, products }) {
    if (!name) throw new ValidationError("Name is required.");
    if (!location?.[0] || !location?.[1])
      throw new ValidationError("Location coordinates are required.");
    if (!image) throw new ValidationError("Cover image is required.");
    if (!isValidObjectId(image))
      throw new ValidationError("Invalid image ID format.");
    if (products)
      throw new ValidationError(
        "Can't attach products when creating a vendor.",
      );

    const imageExists = await this.imageRepository.findById(image);
    if (!imageExists) throw new NotFoundError("Selected image not found.");

    return this.vendorRepository.create({ name, location, image });
  }

  async updateVendor(id, { name, location, image }) {
    if (!id) throw new ValidationError("ID is required.");
    if (!isValidObjectId(id)) throw new ValidationError("Invalid ID format.");

    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError(`No vendor matches ID ${id}.`);

    if (name) vendor.name = name;
    if (location) vendor.location = location;

    if (image) {
      if (!isValidObjectId(image))
        throw new ValidationError("Invalid image ID format.");

      const imageExists = await this.imageRepository.findById(image);
      if (!imageExists) throw new NotFoundError("Selected image not found.");

      vendor.image = image;
    }

    return this.vendorRepository.save(vendor);
  }

  async deleteVendor(id) {
    if (!id) throw new ValidationError("ID is required.");
    if (!isValidObjectId(id)) throw new ValidationError("Invalid ID format.");

    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError(`No vendor matches ID ${id}.`);

    if (vendor.products?.length > 0) {
      await this.vendorRepository.deleteProductsOfVendor(vendor.products);
    }

    await this.vendorRepository.delete(vendor);
  }

  async generateReport() {
    const vendorsData = await this.vendorRepository.findAllForReport();

    const rows = vendorsData.map(({ name, location, products, image }) => {
      const productsData = products?.length
        ? products.map((p) => `${p.title}, ${p.price} ден`).join("\n")
        : "";

      return {
        name,
        location,
        image: image
          ? `${process.env.SERVER_ORIGIN}/uploads/${image.filename}`
          : "",
        products: productsData,
      };
    });

    const parser = new Parser({
      fields: ["name", "location", "image", "products"],
    });

    return parser.parse(rows);
  }
}
