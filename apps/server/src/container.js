import { AuthRepository } from "./modules/auth/auth.repository.js";
import { ImageRepository } from "./modules/image/image.repository.js";
import { ChainRepository } from "./modules/chain/chain.repository.js";
import { ProductRepository } from "./modules/product/product.repository.js";
import { MarketProductRepository } from "./modules/product/market-product.repository.js";
import { MarketRepository } from "./modules/market/market.repository.js";

import { TokenService } from "./modules/auth/token.service.js";
import { FileService } from "./modules/image/file.service.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { ImageService } from "./modules/image/image.service.js";
import { ChainService } from "./modules/chain/chain.service.js";
import { ProductService } from "./modules/product/product.service.js";
import { MarketService } from "./modules/market/market.service.js";
import { GeocoderService } from "./modules/scraper/geocoder.service.js";
import { ScraperService } from "./modules/scraper/scraper.service.js";

import { AuthController } from "./modules/auth/auth.controller.js";
import { ImageController } from "./modules/image/image.controller.js";
import { ChainController } from "./modules/chain/chain.controller.js";
import { ProductController } from "./modules/product/product.controller.js";
import { MarketController } from "./modules/market/market.controller.js";

const authRepository = new AuthRepository();
const imageRepository = new ImageRepository();
const chainRepository = new ChainRepository();
const productRepository = new ProductRepository();
const marketProductRepository = new MarketProductRepository();
const marketRepository = new MarketRepository();

const tokenService = new TokenService();
const fileService = new FileService();
const authService = new AuthService(authRepository, tokenService);
const imageService = new ImageService(imageRepository, fileService);

const chainService = new ChainService(
  chainRepository,
  imageRepository,
  marketRepository,
  marketProductRepository,
);

const productService = new ProductService(
  productRepository,
  marketRepository,
  imageRepository,
  marketProductRepository,
);

const marketService = new MarketService(
  marketRepository,
  chainRepository,
  marketProductRepository,
);

const geocoderService = new GeocoderService();

export const scraperService = new ScraperService(
  chainRepository,
  marketRepository,
  productRepository,
  marketProductRepository,
  imageRepository,
  geocoderService,
);

export const authController = new AuthController(authService, tokenService);
export const imageController = new ImageController(imageService);
export const chainController = new ChainController(chainService);
export const productController = new ProductController(productService);
export const marketController = new MarketController(marketService);
