import mongoose from "mongoose";

const VendorProductSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  price: { type: Number, required: true },
});

VendorProductSchema.index({ vendor: 1, product: 1 }, { unique: true });

export const VendorProductModel = mongoose.model(
  "VendorProduct",
  VendorProductSchema,
);
