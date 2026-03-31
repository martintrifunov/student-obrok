import { describe, it, expect } from "vitest";
import { normalizeMarketName } from "./normalize-market-name.js";

describe("normalizeMarketName", () => {
  it("uppercases the name", () => {
    expect(normalizeMarketName("вeро")).toBe("ВEРО");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeMarketName("ВЕРО   1")).toBe("ВЕРО 1");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeMarketName("  ВЕРО 1  ")).toBe("ВЕРО 1");
  });

  it("normalizes РАМСТОРЕ → РАМСТОР", () => {
    expect(normalizeMarketName("РАМСТОРЕ ВАРДАР")).toBe("РАМСТОР ВАРДАР");
    expect(normalizeMarketName("рамсторе вардар")).toBe("РАМСТОР ВАРДАР");
  });

  it("does not alter names without РАМСТОРЕ", () => {
    expect(normalizeMarketName("СТОКОМАК ЦЕНТАР")).toBe("СТОКОМАК ЦЕНТАР");
  });

  it("handles names with mixed spacing and brand variant", () => {
    expect(normalizeMarketName("  РАМСТОРЕ   СИТИ МОЛ  ")).toBe(
      "РАМСТОР СИТИ МОЛ",
    );
  });

  it("returns empty string for empty input after trim", () => {
    expect(normalizeMarketName("   ")).toBe("");
  });
});
