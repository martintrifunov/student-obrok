import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeatureFlagService } from "./feature-flag.service.js";

describe("FeatureFlagService", () => {
  let repo;
  let service;

  beforeEach(() => {
    repo = {
      findAll: vi.fn(),
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
    service = new FeatureFlagService(repo);
  });

  describe("getFlags", () => {
    it("returns flags as key-value map", async () => {
      repo.findAll.mockResolvedValue([
        { key: "ai-search", enabled: true },
        { key: "dark-mode", enabled: false },
      ]);

      const result = await service.getFlags();
      expect(result).toEqual({ "ai-search": true, "dark-mode": false });
    });

    it("returns empty object when no flags", async () => {
      repo.findAll.mockResolvedValue([]);
      const result = await service.getFlags();
      expect(result).toEqual({});
    });
  });

  describe("isEnabled", () => {
    it("returns true when flag is enabled", async () => {
      repo.findByKey.mockResolvedValue({ key: "ai-search", enabled: true });
      expect(await service.isEnabled("ai-search")).toBe(true);
    });

    it("returns false when flag is disabled", async () => {
      repo.findByKey.mockResolvedValue({ key: "ai-search", enabled: false });
      expect(await service.isEnabled("ai-search")).toBe(false);
    });

    it("returns false when flag does not exist", async () => {
      repo.findByKey.mockResolvedValue(null);
      expect(await service.isEnabled("nonexistent")).toBe(false);
    });
  });

  describe("setFlag", () => {
    it("calls upsert with correct arguments", async () => {
      const flag = { key: "ai-search", enabled: true, description: "test" };
      repo.upsert.mockResolvedValue(flag);

      const result = await service.setFlag("ai-search", true, "test");
      expect(repo.upsert).toHaveBeenCalledWith("ai-search", {
        enabled: true,
        description: "test",
      });
      expect(result).toEqual(flag);
    });
  });
});
