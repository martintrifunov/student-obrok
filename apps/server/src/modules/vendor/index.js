import { VendorRepository } from "./vendor.repository.js";
import { VendorService } from "./vendor.service.js";
import { VendorController } from "./vendor.controller.js";
import { ImageRepository } from "../image/image.repository.js";

const vendorRepository = new VendorRepository();
const imageRepository = new ImageRepository();
const vendorService = new VendorService(vendorRepository, imageRepository);

export const vendorController = new VendorController(vendorService);
