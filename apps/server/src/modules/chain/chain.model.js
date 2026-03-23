import mongoose from "mongoose";

const ChainSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

ChainSchema.virtual("markets", {
  ref: "Market",
  localField: "_id",
  foreignField: "chain",
});

export const ChainModel = mongoose.model("Chain", ChainSchema);
