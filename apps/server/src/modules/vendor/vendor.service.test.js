import { describe, it, expect, vi, beforeEach } from "vitest";
import { VendorService } from "./vendor.service.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

const mockVendorRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockImageRepository = {
  findById: vi.fn(),
};

const mockMarketRepository = {
  findByVendor: vi.fn(),
  findAllForReport: vi.fn(),
  delete: vi.fn(),
};

const mockMarketProductRepository = {
  deleteByMarket: vi.fn(),
};

const makeSut = () =>
  new VendorService(
    mockVendorRepository,
    mockImageRepository,
    mockMarketRepository,
    mockMarketProductRepository,
  );

beforeEach(() => vi.clearAllMocks());

describe("VendorService", () => {
  describe("getAllVendors", () => {
    it("returns paginated data", async () => {
      mockVendorRepository.findAll.mockResolvedValue({
        docs: [{ name: "Vendor A" }],
        total: 1,
      });
      const sut = makeSut();
      const result = await sut.getAllVendors({ page: 1, limit: 10 });
      expect(result.data).toEqual([{ name: "Vendor A" }]);
      expect(result.pagination).toMatchObject({ total: 1, page: 1, limit: 10 });
    });

    it("returns null pagination when limit is 0", async () => {
      mockVendorRepository.findAll.mockResolvedValue({
        docs: [{ name: "Vendor A" }],
        total: null,
      });
      const sut = makeSut();
      const result = await sut.getAllVendors({ page: 1, limit: 0 });
      expect(result.pagination).toBeNull();
    });
  });

  describe("getVendorById", () => {
    it("returns vendor if found", async () => {
      const vendor = { _id: "abc123", name: "Vendor A" };
      mockVendorRepository.findById.mockResolvedValue(vendor);
      const sut = makeSut();
      const result = await sut.getVendorById("abc123");
      expect(result).toEqual(vendor);
    });

    it("throws NotFoundError if vendor does not exist", async () => {
      mockVendorRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.getVendorById("abc123")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createVendor", () => {
    it("throws NotFoundError if image does not exist", async () => {
      mockImageRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(
        sut.createVendor({
          name: "Vendor A",
          image: "imgId",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("creates and returns vendor if image exists", async () => {
      mockImageRepository.findById.mockResolvedValue({ _id: "imgId" });
      const created = { _id: "v1", name: "Vendor A" };
      mockVendorRepository.create.mockResolvedValue(created);
      const sut = makeSut();
      const result = await sut.createVendor({
        name: "Vendor A",
        image: "imgId",
      });
      expect(result).toEqual(created);
      expect(mockVendorRepository.create).toHaveBeenCalledWith({
        name: "Vendor A",
        image: "imgId",
      });
    });
  });

  describe("updateVendor", () => {
    it("throws NotFoundError if vendor does not exist", async () => {
      mockVendorRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(
        sut.updateVendor("v1", { name: "New Name" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("updates fields and saves", async () => {
      const vendor = {
        _id: "v1",
        name: "Old",
        save: vi.fn(),
      };
      mockVendorRepository.findById.mockResolvedValue(vendor);
      mockVendorRepository.save.mockResolvedValue({ ...vendor, name: "New" });
      const sut = makeSut();
      await sut.updateVendor("v1", { name: "New" });
      expect(vendor.name).toBe("New");
      expect(mockVendorRepository.save).toHaveBeenCalledWith(vendor);
    });

    it("throws NotFoundError if new image does not exist", async () => {
      const vendor = { _id: "v1", name: "Old" };
      mockVendorRepository.findById.mockResolvedValue(vendor);
      mockImageRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(
        sut.updateVendor("v1", { image: "badImgId" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteVendor", () => {
    it("throws NotFoundError if vendor does not exist", async () => {
      mockVendorRepository.findById.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.deleteVendor("v1")).rejects.toThrow(NotFoundError);
    });

    it("deletes markets, market products, and vendor", async () => {
      const vendor = { _id: "v1", name: "Vendor A" };
      const markets = [
        { _id: "m1", name: "Market 1" },
        { _id: "m2", name: "Market 2" },
      ];
      mockVendorRepository.findById.mockResolvedValue(vendor);
      mockMarketRepository.findByVendor.mockResolvedValue(markets);
      mockMarketProductRepository.deleteByMarket.mockResolvedValue(null);
      mockMarketRepository.delete.mockResolvedValue(null);
      mockVendorRepository.delete.mockResolvedValue(null);
      const sut = makeSut();
      await sut.deleteVendor("v1");
      expect(mockMarketRepository.findByVendor).toHaveBeenCalledWith("v1");
      expect(mockMarketProductRepository.deleteByMarket).toHaveBeenCalledTimes(2);
      expect(mockMarketRepository.delete).toHaveBeenCalledTimes(2);
      expect(mockVendorRepository.delete).toHaveBeenCalledWith(vendor);
    });
  });
});
