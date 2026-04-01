export class SmartSearchController {
  constructor(smartSearchService) {
    this.smartSearchService = smartSearchService;
  }

  search = async (req, res) => {
    const result = await this.smartSearchService.search(req.query);
    res.status(200).json(result);
  };
}
