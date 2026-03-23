export class ChainController {
  constructor(chainService) {
    this.chainService = chainService;
  }

  getAll = async (req, res) => {
    const result = await this.chainService.getAllChains(req.query);
    res.status(200).json(result);
  };

  getById = async (req, res) => {
    const chain = await this.chainService.getChainById(req.params.id);
    res.status(200).json(chain);
  };

  create = async (req, res) => {
    const chain = await this.chainService.createChain(req.body);
    res.status(201).json(chain);
  };

  update = async (req, res) => {
    const chain = await this.chainService.updateChain(req.body.id, req.body);
    res.status(200).json(chain);
  };

  delete = async (req, res) => {
    await this.chainService.deleteChain(req.body.id);
    res.status(200).json({ message: "Chain deleted." });
  };

  generateReport = async (req, res) => {
    const csv = await this.chainService.generateReport();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ChainsReport.csv",
    );
    res.status(200).end(csv);
  };
}
