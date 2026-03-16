import { ProductModel } from "./product.model.js";

export class ProductRepository {
  #populate() {
    return {
      image: { path: "image", select: "title url mimeType" },
      vendorProducts: {
        path: "vendorProducts",
        populate: {
          path: "vendor",
          populate: { path: "image", select: "title url mimeType" },
        },
      },
    };
  }

  #buildQuery(filter = {}) {
    const query = {};
    if (filter.title) {
      query.title = { $regex: filter.title, $options: "i" };
    }
    if (filter.category) {
      query.category = { $regex: filter.category, $options: "i" };
    }
    return query;
  }

  async findAll({ page, limit, filter = {} }) {
    const { image } = this.#populate();
    const query = this.#buildQuery(filter);

    const vendorProductsPopulate = { path: "vendorProducts", select: "price" };

    if (limit === 0) {
      const docs = await ProductModel.find(query)
        .populate(image)
        .populate(vendorProductsPopulate)
        .exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ProductModel.find(query)
        .populate(image)
        .populate(vendorProductsPopulate)
        .skip(skip)
        .limit(limit)
        .exec(),
      ProductModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }
  async findById(id) {
    const { image, vendorProducts } = this.#populate();
    return ProductModel.findById(id)
      .populate(vendorProducts)
      .populate(image)
      .exec();
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

  async bulkUpsertProducts(products) {
    if (!products.length) return new Map();

    const uniqueByTitle = new Map();
    for (const p of products) {
      uniqueByTitle.set(p.title, p);
    }
    const unique = Array.from(uniqueByTitle.values());

    const ops = unique.map(({ title, category }) => ({
      updateOne: {
        filter: { title },
        update: { $set: { title, ...(category && { category }) } },
        upsert: true,
      },
    }));

    await ProductModel.bulkWrite(ops, { ordered: false });

    const titles = unique.map((p) => p.title);
    const docs = await ProductModel.find({ title: { $in: titles } })
      .select("_id title")
      .lean();

    return new Map(docs.map((d) => [d.title, d._id]));
  }
}
