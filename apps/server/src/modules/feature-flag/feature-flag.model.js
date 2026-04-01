import mongoose from "mongoose";

const FeatureFlagSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, required: true, default: false },
    description: { type: String, required: false },
  },
  { timestamps: true },
);

export const FeatureFlagModel = mongoose.model("FeatureFlag", FeatureFlagSchema, "feature_flags");
