import { ImageRepository } from "./image.repository.js";
import { ImageService } from "./image.service.js";
import { ImageController } from "./image.controller.js";
import { FileService } from "./file.service.js";

const imageRepository = new ImageRepository();
const fileService = new FileService();
const imageService = new ImageService(imageRepository, fileService);

export const imageController = new ImageController(imageService);
