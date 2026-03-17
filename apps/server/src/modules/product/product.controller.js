export class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  getAll = async (req, res) => {
    const result = await this.productService.getAllProducts(req.query);
    res.status(200).json(result);
  };

  getById = async (req, res) => {
    const product = await this.productService.getProductById(req.params.id);
    res.status(200).json(product);
  };

  create = async (req, res) => {
    const product = await this.productService.createProduct(req.body);
    res.status(201).json(product);
  };

  update = async (req, res) => {
    const product = await this.productService.updateProduct(
      req.body.id,
      req.body,
    );
    res.status(200).json(product);
  };

  delete = async (req, res) => {
    await this.productService.deleteProduct(req.body.id);
    res.status(200).json({ message: "Product deleted." });
  };

  getCategories = async (req, res) => {
    const categories = await this.productService.getCategories(
      req.query.vendorId,
    );
    res.status(200).json(categories);
  };
}
