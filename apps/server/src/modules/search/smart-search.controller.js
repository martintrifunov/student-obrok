export class SmartSearchController {
  constructor(smartSearchService) {
    this.smartSearchService = smartSearchService;
  }

  getBudget = async (req, res) => {
    const result = await this.smartSearchService.getBudget(req.query);
    res.status(200).json(result);
  };

  search = async (req, res) => {
    const result = await this.smartSearchService.search(req.query);
    res.status(200).json(result);
  };
}
