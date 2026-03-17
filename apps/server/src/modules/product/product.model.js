import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    category: { type: String, required: false },
    description: { type: String, required: false },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

ProductSchema.virtual("marketProducts", {
  ref: "MarketProduct",
  localField: "_id",
  foreignField: "product",
});

export const ProductModel = mongoose.model("Product", ProductSchema);
