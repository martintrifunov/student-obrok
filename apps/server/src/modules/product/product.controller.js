export class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  getAll = async (req, res, next) => {
    try {
      const result = await this.productService.getAllProducts(req.query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const product = await this.productService.updateProduct(
        req.body.id,
        req.body,
      );
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.productService.deleteProduct(req.body.id);
      res.status(200).json({ message: "Product deleted." });
    } catch (err) {
      next(err);
    }
  };
}
