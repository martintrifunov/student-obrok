import mongoose from "mongoose";

const MarketSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: [{ type: Number, required: true }],
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    lastScrapedUpdate: { type: Date, default: null },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

MarketSchema.virtual("marketProducts", {
  ref: "MarketProduct",
  localField: "_id",
  foreignField: "market",
});

export const MarketModel = mongoose.model("Market", MarketSchema);
