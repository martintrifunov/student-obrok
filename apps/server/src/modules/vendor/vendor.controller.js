export class VendorController {
  constructor(vendorService) {
    this.vendorService = vendorService;
  }

  getAll = async (req, res, next) => {
    try {
      const result = await this.vendorService.getAllVendors(req.query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const vendor = await this.vendorService.getVendorById(req.params.id);
      res.status(200).json(vendor);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const vendor = await this.vendorService.createVendor(req.body);
      res.status(201).json(vendor);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const vendor = await this.vendorService.updateVendor(
        req.body.id,
        req.body,
      );
      res.status(200).json(vendor);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.vendorService.deleteVendor(req.body.id);
      res.status(200).json({ message: "Vendor deleted." });
    } catch (err) {
      next(err);
    }
  };

  generateReport = async (req, res, next) => {
    try {
      const csv = await this.vendorService.generateReport();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=VendorsReport.csv",
      );
      res.status(200).end(csv);
    } catch (err) {
      next(err);
    }
  };
}
