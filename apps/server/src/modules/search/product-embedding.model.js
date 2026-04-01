import mongoose from "mongoose";

const ProductEmbeddingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    embedding: { type: [Number], required: true },
    textHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProductEmbeddingModel = mongoose.model(
  "ProductEmbedding",
  ProductEmbeddingSchema,
);
