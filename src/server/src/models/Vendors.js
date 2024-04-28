import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: [{ type: Number, required: true }],
  image: { type: String, required: true },
  imageTitle: { type: String, required: true },
  deals: [{ type: mongoose.Schema.Types.ObjectId, ref: "deals" }],
});

export const VendorModel = mongoose.model("vendor", VendorSchema);
