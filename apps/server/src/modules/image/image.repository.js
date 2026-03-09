import { ImageModel } from "../../models/Image.model.js";

export class ImageRepository {
  async findById(id) {
    return ImageModel.findById(id).exec();
  }

  async findAll() {
    return ImageModel.find(
      {},
      "title filename url mimeType size createdAt",
    ).exec();
  }

  async create(data) {
    return ImageModel.create(data);
  }

  async delete(image) {
    return image.deleteOne();
  }
}
