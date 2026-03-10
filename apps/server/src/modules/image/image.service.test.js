import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageService } from "./image.service.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { ValidationError } from "../../shared/errors/ValidationError.js";

const mockImageRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const mockFileService = {
  buildUrl: vi.fn((filename) => `http://localhost/uploads/${filename}`),
  delete: vi.fn(),
};

const makeSut = () => new ImageService(mockImageRepository, mockFileService);

beforeEach(() => vi.clearAllMocks());

describe("ImageService", () => {
  describe("getAllImages", () => {
    it("returns paginated data", async () => {
      mockImageRepository.findAll.mockResolvedValue({
        docs: [{ title: "img.jpg" }],
        total: 1,
      });
      const sut = makeSut();
      const result = await sut.getAllImages({ page: 1, limit: 10 });
      expect(result.data).toEqual([{ title: "img.jpg" }]);
      expect(result.pagination).toMatchObject({ total: 1, page: 1, limit: 10 });
    });

    it("returns null pagination when limit is 0", async () => {
      mockImageRepository.findAll.mockResolvedValue({ docs: [], total: null });
      const sut = makeSut();
      const result = await sut.getAllImages({ page: 1, limit: 0 });
      expect(result.pagination).toBeNull();
    });
  });

  describe("getImageById", () => {
    it("returns image if found", async () => {
      const image = { _id: "img1", title: "photo.jpg" };
      mockImageRepository.findById.mockResolvedValue(image);
      const sut = makeSut();
      const result = await sut.getImageById("img1");
      expect(result).toEqual(image);
    });

    it("throws NotFoundError if image does not exist", async () => {
      mockImageRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.getImageById("img1")).rejects.toThrow(NotFoundError);
    });
  });

  describe("uploadImage", () => {
    it("throws ValidationError if no file provided", async () => {
      const sut = makeSut();
      await expect(sut.uploadImage(null)).rejects.toThrow(ValidationError);
    });

    it("creates and returns image record", async () => {
      const file = {
        originalname: "photo.jpg",
        filename: "photo-123.jpg",
        mimetype: "image/jpeg",
        size: 1024,
      };
      const created = { _id: "img1", title: "photo.jpg" };
      mockImageRepository.create.mockResolvedValue(created);
      const sut = makeSut();
      const result = await sut.uploadImage(file);
      expect(result).toEqual(created);
      expect(mockImageRepository.create).toHaveBeenCalledWith({
        title: "photo.jpg",
        filename: "photo-123.jpg",
        url: "http://localhost/uploads/photo-123.jpg",
        mimeType: "image/jpeg",
        size: 1024,
      });
    });

    it("deletes file and rethrows if repository create fails", async () => {
      const file = {
        originalname: "photo.jpg",
        filename: "photo-123.jpg",
        mimetype: "image/jpeg",
        size: 1024,
      };
      mockImageRepository.create.mockRejectedValue(new Error("DB error"));
      const sut = makeSut();
      await expect(sut.uploadImage(file)).rejects.toThrow("DB error");
      expect(mockFileService.delete).toHaveBeenCalledWith("photo-123.jpg");
    });
  });

  describe("deleteImage", () => {
    it("throws NotFoundError if image does not exist", async () => {
      mockImageRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.deleteImage("img1")).rejects.toThrow(NotFoundError);
    });

    it("deletes file and image record", async () => {
      const image = { _id: "img1", filename: "photo-123.jpg" };
      mockImageRepository.findById.mockResolvedValue(image);
      mockImageRepository.delete.mockResolvedValue(null);
      const sut = makeSut();
      await sut.deleteImage("img1");
      expect(mockFileService.delete).toHaveBeenCalledWith("photo-123.jpg");
      expect(mockImageRepository.delete).toHaveBeenCalledWith(image);
    });
  });
});
