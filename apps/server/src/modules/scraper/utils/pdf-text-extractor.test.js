import { describe, it, expect } from "vitest";
import { extractPdfTextItems } from "./pdf-text-extractor.js";

describe("extractPdfTextItems", () => {
  it("returns empty array for empty buffer", () => {
    const result = extractPdfTextItems(Buffer.alloc(0));
    expect(result).toEqual([]);
  });

  it("returns empty array for non-PDF buffer", () => {
    const result = extractPdfTextItems(Buffer.from("not a pdf file"));
    expect(result).toEqual([]);
  });

  it("returns empty array for buffer with no FlateDecode streams", () => {
    const fakePdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF",
    );
    const result = extractPdfTextItems(fakePdf);
    expect(result).toEqual([]);
  });

  it("returns array type", () => {
    const result = extractPdfTextItems(Buffer.from("%PDF-1.4"));
    expect(Array.isArray(result)).toBe(true);
  });
});
