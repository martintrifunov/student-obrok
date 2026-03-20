import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { buildPaginationMeta } from "../../shared/utils/buildPaginationMeta.js";

export class MarketService {
  constructor(marketRepository, vendorRepository, marketProductRepository) {
    this.marketRepository = marketRepository;
    this.vendorRepository = vendorRepository;
    this.marketProductRepository = marketProductRepository;
  }

  async getAllMarkets({ page, limit, name, vendorId }) {
    const filter = {};
    if (name) filter.name = name;
    if (vendorId) filter.vendor = vendorId;

    const { docs, total } = await this.marketRepository.findAll({
      page,
      limit,
      filter,
    });
    return {
      data: docs,
      pagination: buildPaginationMeta({ total, page, limit }),
    };
  }

  async getMarketById(id) {
    const market = await this.marketRepository.findById(id);
    if (!market) throw new NotFoundError(`No market matches ID ${id}.`);
    return market;
  }

  async createMarket({ name, location, vendor }) {
    const vendorExists = await this.vendorRepository.findById(vendor);
    if (!vendorExists) throw new NotFoundError("Vendor not found.");
    return this.marketRepository.create({ name, location, vendor });
  }

  async updateMarket(id, { name, location, vendor }) {
    const market = await this.marketRepository.findById(id);
    if (!market) throw new NotFoundError(`No market matches ID ${id}.`);

    if (name) market.name = name;
    if (location) market.location = location;

    if (vendor) {
      const vendorExists = await this.vendorRepository.findById(vendor);
      if (!vendorExists) throw new NotFoundError("Vendor not found.");
      market.vendor = vendor;
    }

    return this.marketRepository.save(market);
  }

  async deleteMarket(id) {
    const market = await this.marketRepository.findById(id);
    if (!market) throw new NotFoundError(`No market matches ID ${id}.`);
    await this.marketProductRepository.deleteByMarket(id);
    await this.marketRepository.delete(market);
  }
}
