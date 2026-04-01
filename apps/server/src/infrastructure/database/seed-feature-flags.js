import { FeatureFlagModel } from "../../modules/feature-flag/feature-flag.model.js";

const DEFAULT_FLAGS = [
  { key: "ai-search", enabled: false, description: "Enable AI-powered hybrid search (vector + keyword)" },
  { key: "smart-search", enabled: false, description: "Enable AI smart search with recipe decomposition and market routing" },
];

export const seedFeatureFlags = async () => {
  for (const { key, enabled, description } of DEFAULT_FLAGS) {
    const existing = await FeatureFlagModel.findOne({ key }).exec();
    if (!existing) {
      await FeatureFlagModel.create({ key, enabled, description });
      console.log(`[SeedFeatureFlags] Seeded flag "${key}" = ${enabled}`);
    }
  }
};
