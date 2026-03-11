import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "./product.service.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

const mockProductRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockVendorRepository = {
  findById: vi.fn(),
};

const mockImageRepository = {
  findById: vi.fn(),
};

const makeSut = () =>
  new ProductService(
    mockProductRepository,
    mockVendorRepository,
    mockImageRepository,
  );

beforeEach(() => vi.clearAllMocks());

describe("ProductService", () => {
  describe("getAllProducts", () => {
    it("returns paginated data", async () => {
      mockProductRepository.findAll.mockResolvedValue({
        docs: [{ title: "Pizza" }],
        total: 1,
      });
      const sut = makeSut();
      const result = await sut.getAllProducts({ page: 1, limit: 10 });
      expect(result.data).toEqual([{ title: "Pizza" }]);
      expect(result.pagination).toMatchObject({ total: 1, page: 1, limit: 10 });
    });

    it("returns null pagination when limit is 0", async () => {
      mockProductRepository.findAll.mockResolvedValue({
        docs: [],
        total: null,
      });
      const sut = makeSut();
      const result = await sut.getAllProducts({ page: 1, limit: 0 });
      expect(result.pagination).toBeNull();
    });

    it("passes filter parameters correctly to the repository", async () => {
      mockProductRepository.findAll.mockResolvedValue({ docs: [], total: 0 });
      const sut = makeSut();
      await sut.getAllProducts({
        page: 1,
        limit: 10,
        title: "Pizza",
        minPrice: 50,
      });

      expect(mockProductRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        filter: { title: "Pizza", minPrice: 50 },
      });
    });
  });

  describe("getProductById", () => {
    it("returns product if found", async () => {
      const product = { _id: "p1", title: "Pizza" };
      mockProductRepository.findById.mockResolvedValue(product);
      const sut = makeSut();
      const result = await sut.getProductById("p1");
      expect(result).toEqual(product);
    });

    it("throws NotFoundError if product does not exist", async () => {
      mockProductRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.getProductById("p1")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createProduct", () => {
    it("throws NotFoundError if vendor does not exist", async () => {
      mockVendorRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(
        sut.createProduct({ title: "Pizza", vendor: "v1" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError if image does not exist", async () => {
      mockVendorRepository.findById.mockResolvedValue({ _id: "v1" });
      mockImageRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(
        sut.createProduct({ title: "Pizza", vendor: "v1", image: "badImg" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("creates product without image", async () => {
      mockVendorRepository.findById.mockResolvedValue({ _id: "v1" });
      const created = { _id: "p1", title: "Pizza" };
      mockProductRepository.create.mockResolvedValue(created);
      const sut = makeSut();
      const result = await sut.createProduct({
        title: "Pizza",
        description: "Desc",
        price: 100,
        vendor: "v1",
      });
      expect(result).toEqual(created);
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        title: "Pizza",
        description: "Desc",
        price: 100,
        vendor: "v1",
        image: null,
      });
    });

    it("creates product with image", async () => {
      mockVendorRepository.findById.mockResolvedValue({ _id: "v1" });
      mockImageRepository.findById.mockResolvedValue({ _id: "img1" });
      const created = { _id: "p1", title: "Pizza" };
      mockProductRepository.create.mockResolvedValue(created);
      const sut = makeSut();
      const result = await sut.createProduct({
        title: "Pizza",
        description: "Desc",
        price: 100,
        vendor: "v1",
        image: "img1",
      });
      expect(result).toEqual(created);
    });
  });

  describe("updateProduct", () => {
    it("throws NotFoundError if product does not exist", async () => {
      mockProductRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.updateProduct("p1", { title: "New" })).rejects.toThrow(
        NotFoundError,
      );
    });

    it("updates fields and saves", async () => {
      const product = {
        _id: "p1",
        title: "Old",
        description: "Desc",
        price: 100,
      };
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue({
        ...product,
        title: "New",
      });
      const sut = makeSut();
      await sut.updateProduct("p1", { title: "New" });
      expect(product.title).toBe("New");
      expect(mockProductRepository.save).toHaveBeenCalledWith(product);
    });

    it("throws NotFoundError if new image does not exist", async () => {
      const product = { _id: "p1", title: "Old" };
      mockProductRepository.findById.mockResolvedValue(product);
      mockImageRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(
        sut.updateProduct("p1", { image: "badImg" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteProduct", () => {
    it("throws NotFoundError if product does not exist", async () => {
      mockProductRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.deleteProduct("p1")).rejects.toThrow(NotFoundError);
    });

    it("deletes product", async () => {
      const product = { _id: "p1", title: "Pizza" };
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.delete.mockResolvedValue(null);
      const sut = makeSut();
      await sut.deleteProduct("p1");
      expect(mockProductRepository.delete).toHaveBeenCalledWith(product);
    });
  });
});
