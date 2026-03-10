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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

VendorSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "vendor",
});

export const VendorModel = mongoose.model("Vendor", VendorSchema);
