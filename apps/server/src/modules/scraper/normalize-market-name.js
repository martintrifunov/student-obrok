/**
 * Normalize a market name for use as a stable lookup key.
 * Uppercases, collapses whitespace, trims, and normalizes
 * common brand-name variations (e.g. РАМСТОРЕ → РАМСТОР).
 */
export const normalizeMarketName = (name) =>
  name
    .toUpperCase()
    .replace(/РАМСТОРЕ/g, "РАМСТОР")
    .replace(/\s+/g, " ")
    .trim();
