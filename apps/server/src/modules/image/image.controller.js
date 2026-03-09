export class ImageController {
  constructor(imageService) {
    this.imageService = imageService;
  }

  getAll = async (req, res, next) => {
    try {
      const images = await this.imageService.getAllImages();
      res.status(200).json(images);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const image = await this.imageService.getImageById(req.params.id);
      res.status(200).json(image);
    } catch (err) {
      next(err);
    }
  };

  upload = async (req, res, next) => {
    try {
      const image = await this.imageService.uploadImage(req.file);
      res.status(201).json(image);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.imageService.deleteImage(req.body.id);
      res.status(200).json({ message: "Image deleted." });
    } catch (err) {
      next(err);
    }
  };
}
