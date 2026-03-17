import { AuthRepository } from "./modules/auth/auth.repository.js";
import { ImageRepository } from "./modules/image/image.repository.js";
import { VendorRepository } from "./modules/vendor/vendor.repository.js";
import { ProductRepository } from "./modules/product/product.repository.js";
import { VendorProductRepository } from "./modules/product/vendor-product.repository.js";

import { TokenService } from "./modules/auth/token.service.js";
import { FileService } from "./modules/image/file.service.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { ImageService } from "./modules/image/image.service.js";
import { VendorService } from "./modules/vendor/vendor.service.js";
import { ProductService } from "./modules/product/product.service.js";
import { GeocoderService } from "./modules/scraper/geocoder.service.js";
import { ScraperService } from "./modules/scraper/scraper.service.js";

import { AuthController } from "./modules/auth/auth.controller.js";
import { ImageController } from "./modules/image/image.controller.js";
import { VendorController } from "./modules/vendor/vendor.controller.js";
import { ProductController } from "./modules/product/product.controller.js";

const authRepository = new AuthRepository();
const imageRepository = new ImageRepository();
const vendorRepository = new VendorRepository();
const productRepository = new ProductRepository();
const vendorProductRepository = new VendorProductRepository();

const tokenService = new TokenService();
const fileService = new FileService();
const authService = new AuthService(authRepository, tokenService);
const imageService = new ImageService(imageRepository, fileService);

const vendorService = new VendorService(
  vendorRepository,
  imageRepository,
  vendorProductRepository,
);

const productService = new ProductService(
  productRepository,
  vendorRepository,
  imageRepository,
  vendorProductRepository,
);

const geocoderService = new GeocoderService();

export const scraperService = new ScraperService(
  vendorRepository,
  productRepository,
  vendorProductRepository,
  imageRepository,
  geocoderService,
);

export const authController = new AuthController(authService, tokenService);
export const imageController = new ImageController(imageService);
export const vendorController = new VendorController(vendorService);
export const productController = new ProductController(productService);
