import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  locationName: { type: String, required: true },
  location: [{ type: Number, required: true }],
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  imageTitle: { type: String, required: true },
});

export const DealModel = mongoose.model("deals", DealSchema);
