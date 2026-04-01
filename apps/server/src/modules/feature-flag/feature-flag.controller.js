export class FeatureFlagController {
  constructor(featureFlagService) {
    this.featureFlagService = featureFlagService;
  }

  getAll = async (req, res) => {
    const flags = await this.featureFlagService.getFlags();
    res.status(200).json(flags);
  };

  update = async (req, res) => {
    const { key, enabled, description } = req.body;
    const flag = await this.featureFlagService.setFlag(key, enabled, description);
    res.status(200).json(flag);
  };
}
