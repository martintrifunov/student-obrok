export class VendorController {
  constructor(vendorService) {
    this.vendorService = vendorService;
  }

  getAll = async (req, res) => {
    const result = await this.vendorService.getAllVendors(req.query);
    res.status(200).json(result);
  };

  getById = async (req, res) => {
    const vendor = await this.vendorService.getVendorById(req.params.id);
    res.status(200).json(vendor);
  };

  create = async (req, res) => {
    const vendor = await this.vendorService.createVendor(req.body);
    res.status(201).json(vendor);
  };

  update = async (req, res) => {
    const vendor = await this.vendorService.updateVendor(req.body.id, req.body);
    res.status(200).json(vendor);
  };

  delete = async (req, res) => {
    await this.vendorService.deleteVendor(req.body.id);
    res.status(200).json({ message: "Vendor deleted." });
  };

  generateReport = async (req, res) => {
    const csv = await this.vendorService.generateReport();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=VendorsReport.csv",
    );
    res.status(200).end(csv);
  };
}
