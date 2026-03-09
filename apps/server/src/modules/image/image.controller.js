export class ImageController {
  constructor(imageService) {
    this.imageService = imageService;
  }

  getAll = async (req, res) => {
    const result = await this.imageService.getAllImages(req.query);
    res.status(200).json(result);
  };

  getById = async (req, res) => {
    const image = await this.imageService.getImageById(req.params.id);
    res.status(200).json(image);
  };

  upload = async (req, res) => {
    const image = await this.imageService.uploadImage(req.file);
    res.status(201).json(image);
  };

  delete = async (req, res) => {
    await this.imageService.deleteImage(req.body.id);
    res.status(200).json({ message: "Image deleted." });
  };
}
