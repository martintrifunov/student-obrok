import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { ValidationError } from "../../shared/errors/ValidationError.js";

export class ImageService {
  constructor(imageRepository, fileService) {
    this.imageRepository = imageRepository;
    this.fileService = fileService;
  }

  async getAllImages() {
    return this.imageRepository.findAll();
  }

  async getImageById(id) {
    const image = await this.imageRepository.findById(id);
    if (!image) throw new NotFoundError(`No image matches ID ${id}.`);
    return image;
  }

  async uploadImage(file) {
    if (!file) throw new ValidationError("Image file is required.");

    try {
      return await this.imageRepository.create({
        title: file.originalname,
        filename: file.filename,
        url: this.fileService.buildUrl(file.filename),
        mimeType: file.mimetype,
        size: file.size,
      });
    } catch (err) {
      this.fileService.delete(file.filename);
      throw err;
    }
  }

  async deleteImage(id) {
    const image = await this.imageRepository.findById(id);
    if (!image) throw new NotFoundError(`No image matches ID ${id}.`);

    this.fileService.delete(image.filename);
    await this.imageRepository.delete(image);
  }
}