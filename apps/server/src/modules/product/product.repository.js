import { ProductModel } from "./product.model.js";

const latToCyrMap = {
  dzh: "џ",
  nj: "њ",
  lj: "љ",
  dz: "ѕ",
  zh: "ж",
  sh: "ш",
  ch: "ч",
  gj: "ѓ",
  kj: "ќ",
  a: "а",
  b: "б",
  c: "ц",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "х",
  i: "и",
  j: "ј",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "к",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в",
  x: "кс",
  y: "и",
  z: "з",
};

function buildBilingualRegex(text) {
  if (!text) return null;
  let cyrStr = text.toLowerCase();
  for (const [lat, cyr] of Object.entries(latToCyrMap))
    cyrStr = cyrStr.split(lat).join(cyr);
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `${escapeRegExp(text)}|${escapeRegExp(cyrStr)}`;
}

export class ProductRepository {
  #populate() {
    return {
      image: { path: "image", select: "title url mimeType" },
    };
  }

  #buildQuery(filter = {}) {
    const query = {};
    if (filter.title) {
      query.title = {
        $regex: buildBilingualRegex(filter.title),
        $options: "i",
      };
    }
    if (filter.category) {
      query.category = {
        $regex: buildBilingualRegex(filter.category),
        $options: "i",
      };
    }
    return query;
  }

  async findAll({ page, limit, filter = {} }) {
    const { image } = this.#populate();
    const query = this.#buildQuery(filter);

    const marketProductsPopulate = { path: "marketProducts", select: "price" };

    if (limit === 0) {
      const docs = await ProductModel.find(query)
        .populate(image)
        .populate(marketProductsPopulate)
        .exec();
      return { docs, total: null };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ProductModel.find(query)
        .populate(image)
        .populate(marketProductsPopulate)
        .skip(skip)
        .limit(limit)
        .exec(),
      ProductModel.countDocuments(query).exec(),
    ]);
    return { docs, total };
  }
  async findById(id) {
    const { image } = this.#populate();
    return ProductModel.findById(id)
      .populate({
        path: "marketProducts",
        populate: {
          path: "market",
          populate: {
            path: "vendor",
            populate: { path: "image", select: "title url mimeType" },
          },
        },
      })
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

  async getUniqueCategories() {
    return ProductModel.distinct("category", {
      category: { $ne: null },
    }).exec();
  }
}
