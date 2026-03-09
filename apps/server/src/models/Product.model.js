import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    required: false,
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
});

export const ProductModel = mongoose.model("Product", ProductSchema);
