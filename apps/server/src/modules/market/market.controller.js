export class MarketController {
  constructor(marketService) {
    this.marketService = marketService;
  }

  getAll = async (req, res) => {
    const result = await this.marketService.getAllMarkets(req.query);
    res.status(200).json(result);
  };

  getById = async (req, res) => {
    const market = await this.marketService.getMarketById(req.params.id);
    res.status(200).json(market);
  };

  create = async (req, res) => {
    const market = await this.marketService.createMarket(req.body);
    res.status(201).json(market);
  };

  update = async (req, res) => {
    const market = await this.marketService.updateMarket(
      req.body.id,
      req.body,
    );
    res.status(200).json(market);
  };

  delete = async (req, res) => {
    await this.marketService.deleteMarket(req.body.id);
    res.status(200).json({ message: "Market deleted." });
  };
}
