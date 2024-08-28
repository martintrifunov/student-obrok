import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  imageTitle: { type: String },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendor" },
});

export const DealModel = mongoose.model("deals", DealSchema);
