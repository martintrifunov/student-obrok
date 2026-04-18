import { ChainModel } from "./chain.model.js";
import { escapeRegExp } from "../../shared/utils/bilingualRegex.js";

export class ChainRepository {
  #populate() {
    return {
      image: { path: "image", select: "title url mimeType" },
      markets: { path: "markets" },
    };
  }

  #buildQuery(filter = {}) {
    const query = {};
    if (filter.name) {
      query.name = { $regex: escapeRegExp(filter.name), $options: "i" };
    }
    return query;
  }

  async findAll({ page, limit, filter = {} }) {
    const { image, markets } = this.#populate();
    const query = this.#buildQuery(filter);

    if (limit === 0) {
      const docs = await ChainModel.find(query)
        .populate(image)
        .populate(markets)
        .exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ChainModel.find(query)
        .populate(image)
        .populate(markets)
        .skip(skip)
        .limit(limit)
        .exec(),
      ChainModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }

  async findById(id) {
    const { image, markets } = this.#populate();
    return ChainModel.findById(id).populate(image).populate(markets).exec();
  }

  async findByName(name) {
    return ChainModel.findOne({ name }).exec();
  }

  async create(data) {
    return ChainModel.create(data);
  }

  async save(chain) {
    return chain.save();
  }

  async delete(chain, options = {}) {
    return chain.deleteOne(options);
  }
}
