import mongoose from "mongoose";

const MarketProductSchema = new mongoose.Schema({
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Market",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  price: { type: Number, required: true },
});

MarketProductSchema.index({ market: 1, product: 1 }, { unique: true });

export const MarketProductModel = mongoose.model(
  "MarketProduct",
  MarketProductSchema,
);
