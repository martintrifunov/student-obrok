import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: [{ type: Number, required: true }],
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    lastScrapedUpdate: { type: String, default: null },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

VendorSchema.virtual("vendorProducts", {
  ref: "VendorProduct",
  localField: "_id",
  foreignField: "vendor",
});

export const VendorModel = mongoose.model("Vendor", VendorSchema);
