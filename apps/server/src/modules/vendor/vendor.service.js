import { Parser } from "json2csv";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { buildPaginationMeta } from "../../shared/utils/buildPaginationMeta.js";

export class VendorService {
  constructor(vendorRepository, imageRepository) {
    this.vendorRepository = vendorRepository;
    this.imageRepository = imageRepository;
  }

  async getAllVendors({ page, limit }) {
    const { docs, total } = await this.vendorRepository.findAll({
      page,
      limit,
    });
    return {
      data: docs,
      pagination: buildPaginationMeta({ total, page, limit }),
    };
  }

  async getVendorById(id) {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError(`No vendor matches ID ${id}.`);
    return vendor;
  }

  async createVendor({ name, location, image }) {
    const imageExists = await this.imageRepository.findById(image);
    if (!imageExists) throw new NotFoundError("Selected image not found.");
    return this.vendorRepository.create({ name, location, image });
  }

  async updateVendor(id, { name, location, image }) {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError(`No vendor matches ID ${id}.`);

    if (name) vendor.name = name;
    if (location) vendor.location = location;

    if (image) {
      const imageExists = await this.imageRepository.findById(image);
      if (!imageExists) throw new NotFoundError("Selected image not found.");
      vendor.image = image;
    }

    return this.vendorRepository.save(vendor);
  }

  async deleteVendor(id) {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError(`No vendor matches ID ${id}.`);
    await this.vendorRepository.deleteProductsByVendor(id);
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
