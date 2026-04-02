export class SearchController {
  constructor(searchService) {
    this.searchService = searchService;
  }

  search = async (req, res) => {
    const result = await this.searchService.search({
      ...req.query,
      analytics: {
        visitorId: req.visitorId,
        userId: req.user || null,
        path: req.originalUrl,
      },
    });
    res.status(200).json(result);
  };
}
