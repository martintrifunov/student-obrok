export class FeatureFlagService {
  constructor(featureFlagRepository) {
    this.featureFlagRepository = featureFlagRepository;
  }

  async getFlags() {
    const flags = await this.featureFlagRepository.findAll();
    return Object.fromEntries(flags.map((f) => [f.key, f.enabled]));
  }

  async isEnabled(key) {
    const flag = await this.featureFlagRepository.findByKey(key);
    return flag?.enabled ?? false;
  }

  async setFlag(key, enabled, description) {
    return this.featureFlagRepository.upsert(key, { enabled, description });
  }
}
