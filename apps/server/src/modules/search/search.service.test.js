import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Mongoose models before importing SearchService
vi.mock("../product/product.model.js", () => ({
  ProductModel: {
    find: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
  },
}));

vi.mock("../product/market-product.model.js", () => ({
  MarketProductModel: {
    find: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    aggregate: vi.fn().mockResolvedValue([]),
  },
}));

const { SearchService } = await import("./search.service.js");

describe("SearchService", () => {
  let embeddingService;
  let productEmbeddingRepository;
  let featureFlagService;
  let service;

  beforeEach(() => {
    embeddingService = {
      isAvailable: vi.fn().mockReturnValue(true),
      generateEmbedding: vi.fn(),
      generateBatchEmbeddings: vi.fn(),
    };
    productEmbeddingRepository = {
      findAll: vi.fn().mockResolvedValue([]),
      findByProducts: vi.fn().mockResolvedValue([]),
    };
    featureFlagService = {
      isEnabled: vi.fn(),
    };
    service = new SearchService(
      embeddingService,
      productEmbeddingRepository,
      featureFlagService,
    );
  });

  it("returns empty results when ai-search flag is disabled", async () => {
    featureFlagService.isEnabled.mockResolvedValue(false);

    const result = await service.search({ q: "test", page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(embeddingService.generateEmbedding).not.toHaveBeenCalled();
  });

  it("calls vector search with RETRIEVAL_QUERY task type", async () => {
    featureFlagService.isEnabled.mockResolvedValue(true);
    embeddingService.generateEmbedding.mockResolvedValue(new Array(768).fill(0));

    await service.search({ q: "леб", page: 1, limit: 10 });

    expect(embeddingService.generateEmbedding).toHaveBeenCalledWith(
      "леб",
      "RETRIEVAL_QUERY",
    );
  });

  it("falls back to keyword-only when embeddings unavailable", async () => {
    featureFlagService.isEnabled.mockResolvedValue(true);
    embeddingService.isAvailable.mockReturnValue(false);

    const result = await service.search({ q: "test", page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(embeddingService.generateEmbedding).not.toHaveBeenCalled();
  });
});
