export class SearchController {
  constructor(searchService) {
    this.searchService = searchService;
  }

  search = async (req, res) => {
    const result = await this.searchService.search(req.query);
    res.status(200).json(result);
  };
}
