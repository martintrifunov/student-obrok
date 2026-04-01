import { describe, it, expect } from "vitest";
import {
  buildBilingualRegex,
  buildBilingualTokenRegexes,
} from "./bilingualRegex.js";

describe("buildBilingualRegex", () => {
  it("returns null for empty input", () => {
    expect(buildBilingualRegex("")).toBe(null);
    expect(buildBilingualRegex(null)).toBe(null);
    expect(buildBilingualRegex(undefined)).toBe(null);
  });

  it("returns regex pattern with latin and cyrillic alternatives", () => {
    const result = buildBilingualRegex("mleko");
    expect(result).toContain("mleko");
    expect(result).toContain("млеко");
    expect(result).toContain("|");
  });

  it("handles multi-char transliterations (sh, ch, etc.)", () => {
    const result = buildBilingualRegex("sheker");
    expect(result).toContain("шекер");
  });

  it("escapes regex special characters", () => {
    const result = buildBilingualRegex("test (1)");
    expect(result).toContain("\\(");
    expect(result).toContain("\\)");
  });

  it("handles Cyrillic input as-is", () => {
    const result = buildBilingualRegex("леб");
    expect(result).toContain("леб");
  });

  it("splits multi-word input into token regexes", () => {
    const result = buildBilingualTokenRegexes("monster jagoda");
    expect(result).toEqual(["monster|монстер", "jagoda|јагода"]);
  });

  it("ignores repeated whitespace when building token regexes", () => {
    const result = buildBilingualTokenRegexes("  monster   jagoda  ");
    expect(result).toHaveLength(2);
  });
});
