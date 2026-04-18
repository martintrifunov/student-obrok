import { ProductEmbeddingModel } from "./product-embedding.model.js";

export class ProductEmbeddingRepository {
  async findByProduct(productId) {
    return ProductEmbeddingModel.findOne({ product: productId }).lean().exec();
  }

  async findByProducts(productIds) {
    return ProductEmbeddingModel.find({ product: { $in: productIds } })
      .lean()
      .exec();
  }

  async findAll() {
    return ProductEmbeddingModel.find().lean().exec();
  }

  async findAllHashes() {
    return ProductEmbeddingModel.find()
      .select("product textHash")
      .lean()
      .exec();
  }

  async upsert(productId, embedding, textHash) {
    return ProductEmbeddingModel.findOneAndUpdate(
      { product: productId },
      { $set: { embedding, textHash } },
      { upsert: true, returnDocument: "after" },
    ).exec();
  }

  async bulkUpsert(entries) {
    if (!entries.length) return;
    const ops = entries.map(({ productId, embedding, textHash }) => ({
      updateOne: {
        filter: { product: productId },
        update: { $set: { embedding, textHash } },
        upsert: true,
      },
    }));
    return ProductEmbeddingModel.bulkWrite(ops, { ordered: false });
  }

  async deleteByProduct(productId) {
    return ProductEmbeddingModel.deleteOne({ product: productId }).exec();
  }

  async count() {
    return ProductEmbeddingModel.countDocuments().exec();
  }
}
