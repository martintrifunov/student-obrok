import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";
import { ProductModel } from "../modules/product/product.model.js";
import { ProductEmbeddingModel } from "../modules/search/product-embedding.model.js";
import { EmbeddingService } from "../modules/search/embedding.service.js";

const BATCH_SIZE = 50;

const textHash = (text) => crypto.createHash("md5").update(text).digest("hex");

const buildEmbeddingText = (product) => {
  const parts = [product.title];
  if (product.category) parts.push(product.category);
  return parts.join(" ");
};

const main = async () => {
  const force = process.argv.includes("--force");
  const dbUri = process.env.MONGO_URI_LOCAL || process.env.DATABASE_URI;

  if (!dbUri) {
    console.error("Set DATABASE_URI or MONGO_URI_LOCAL in .env");
    process.exit(1);
  }

  const embeddingService = new EmbeddingService();
  if (!embeddingService.isAvailable()) {
    console.error("Set GEMINI_API_KEY in .env");
    process.exit(1);
  }

  await mongoose.connect(dbUri);
  console.log("[Embeddings] Connected to MongoDB");

  const products = await ProductModel.find().lean().exec();
  console.log(`[Embeddings] Found ${products.length} products`);

  const existingMap = new Map();
  if (!force) {
    const existing = await ProductEmbeddingModel.find()
      .select("product textHash")
      .lean()
      .exec();
    for (const e of existing) existingMap.set(e.product.toString(), e.textHash);
  }

  const toEmbed = [];
  for (const product of products) {
    const text = buildEmbeddingText(product);
    const hash = textHash(text);
    if (!force && existingMap.get(product._id.toString()) === hash) continue;
    toEmbed.push({ product, text, hash });
  }

  console.log(
    `[Embeddings] ${toEmbed.length} products need embeddings (${products.length - toEmbed.length} skipped)`,
  );

  if (toEmbed.length === 0) {
    await mongoose.disconnect();
    return;
  }

  let processed = 0;
  for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
    const batch = toEmbed.slice(i, i + BATCH_SIZE);
    const texts = batch.map((b) => b.text);

    const embeddings = await embeddingService.generateBatchEmbeddings(texts);

    const entries = batch.map((b, idx) => ({
      productId: b.product._id,
      embedding: embeddings[idx],
      textHash: b.hash,
    }));

    const ops = entries.map(({ productId, embedding, textHash }) => ({
      updateOne: {
        filter: { product: productId },
        update: { $set: { embedding, textHash } },
        upsert: true,
      },
    }));
    await ProductEmbeddingModel.bulkWrite(ops, { ordered: false });

    processed += batch.length;
    console.log(`[Embeddings] ${processed}/${toEmbed.length} processed`);
  }

  console.log(`[Embeddings] Done. ${processed} embeddings generated.`);
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
