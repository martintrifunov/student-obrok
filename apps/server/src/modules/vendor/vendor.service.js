import { Parser } from "@json2csv/plainjs";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { buildPaginationMeta } from "../../shared/utils/buildPaginationMeta.js";

export class VendorService {
  constructor(
    vendorRepository,
    imageRepository,
    marketRepository,
    marketProductRepository,
  ) {
    this.vendorRepository = vendorRepository;
    this.imageRepository = imageRepository;
    this.marketRepository = marketRepository;
    this.marketProductRepository = marketProductRepository;
  }

  async getAllVendors({ page, limit, name }) {
    const filter = {};
    if (name) filter.name = name;

    const { docs, total } = await this.vendorRepository.findAll({
      page,
      limit,
      filter,
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

  async createVendor({ name, image }) {
    const imageExists = await this.imageRepository.findById(image);
    if (!imageExists) throw new NotFoundError("Selected image not found.");
    return this.vendorRepository.create({ name, image });
  }

  async updateVendor(id, { name, image }) {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError(`No vendor matches ID ${id}.`);

    if (name) vendor.name = name;

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

    const markets = await this.marketRepository.findByVendor(id);
    for (const market of markets) {
      await this.marketProductRepository.deleteByMarket(market._id);
      await this.marketRepository.delete(market);
    }

    await this.vendorRepository.delete(vendor);
  }

  async generateReport() {
    const marketsData = await this.marketRepository.findAllForReport();

    const rows = marketsData.map(
      ({ name, location, vendor, marketProducts }) => {
        const productsData = marketProducts?.length
          ? marketProducts
              .map((mp) => `${mp.product.title}, ${mp.price} ден`)
              .join("\n")
          : "";
        return {
          market: name,
          vendor: vendor?.name || "",
          location: location.join(", "),
          image: vendor?.image
            ? `${process.env.SERVER_ORIGIN}/uploads/${vendor.image.filename}`
            : "",
          products: productsData,
        };
      },
    );

    const parser = new Parser({
      fields: ["market", "vendor", "location", "image", "products"],
    });

    return parser.parse(rows);
  }
}
