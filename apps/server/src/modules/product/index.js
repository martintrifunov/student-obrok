import { ProductRepository } from "./product.repository.js";
import { ProductService } from "./product.service.js";
import { ProductController } from "./product.controller.js";
import { VendorRepository } from "../vendor/vendor.repository.js";
import { ImageRepository } from "../image/image.repository.js";

const productRepository = new ProductRepository();
const vendorRepository = new VendorRepository();
const imageRepository = new ImageRepository();
const productService = new ProductService(
  productRepository,
  vendorRepository,
  imageRepository,
);

export const productController = new ProductController(productService);
