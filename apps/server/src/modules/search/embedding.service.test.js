import { describe, it, expect } from "vitest";
import { EmbeddingService } from "./embedding.service.js";

describe("EmbeddingService", () => {
  it("reports unavailable when no API key is set", () => {
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const service = new EmbeddingService();
    expect(service.isAvailable()).toBe(false);

    if (original) process.env.GEMINI_API_KEY = original;
  });

  it("throws when calling generateEmbedding without API key", async () => {
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const service = new EmbeddingService();
    await expect(service.generateEmbedding("test")).rejects.toThrow(
      "GEMINI_API_KEY not configured",
    );

    if (original) process.env.GEMINI_API_KEY = original;
  });

  it("throws when calling generateBatchEmbeddings without API key", async () => {
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const service = new EmbeddingService();
    await expect(service.generateBatchEmbeddings(["test"])).rejects.toThrow(
      "GEMINI_API_KEY not configured",
    );

    if (original) process.env.GEMINI_API_KEY = original;
  });
});
