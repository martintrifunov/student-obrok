import { FeatureFlagModel } from "./feature-flag.model.js";

export class FeatureFlagRepository {
  async findAll() {
    return FeatureFlagModel.find().lean().exec();
  }

  async findByKey(key) {
    return FeatureFlagModel.findOne({ key }).lean().exec();
  }

  async upsert(key, { enabled, description }) {
    return FeatureFlagModel.findOneAndUpdate(
      { key },
      { $set: { enabled, ...(description !== undefined && { description }) } },
      { upsert: true, returnDocument: "after", lean: true },
    ).exec();
  }
}
