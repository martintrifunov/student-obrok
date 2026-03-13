import { BaseScraper } from "./base.scraper.js";

const INDEX_URL = "https://pricelist.vero.com.mk/";
const MAX_PRICE = 840;

export class VeroScraper extends BaseScraper {
  get placeholderImageFilename() {
    return "vero_market.png";
  }

  /**
   * Scrapes the Vero index page for all store names and their pricelist URLs.
   * Deduplicates by store name — keeps the last URL per name (most recent).
   */
  async fetchVendors(page) {
    await page.goto(INDEX_URL, { waitUntil: "networkidle2" });

    const entries = await page.evaluate(() => {
      // Links to individual store pages follow the pattern /digits_digits.html
      const storePattern = /\/\d+_\d+\.html$/;
      return Array.from(document.querySelectorAll("a[href]"))
        .filter((a) => storePattern.test(a.getAttribute("href")))
        .map((a) => ({
          name: a.textContent.trim(),
          pricelistUrl: a.href,
        }))
        .filter((e) => e.name.length > 0);
    });

    // Deduplicate by name, keeping the last entry (latest snapshot URL)
    const seen = new Map();
    for (const entry of entries) {
      seen.set(entry.name, entry);
    }

    return Array.from(seen.values());
  }

  /**
   * Scrapes a single store's pricelist table.
   * - Resolves column positions from table headers dynamically.
   * - Filters out unavailable rows (Достапност = "Не").
   * - Filters out rows with price > 840.
   */
  async fetchProducts(page, storeUrl) {
    await page.goto(storeUrl, { waitUntil: "networkidle2" });

    const products = await page.evaluate((maxPrice) => {
      const table = document.querySelector("table");
      if (!table) return [];

      // --- Resolve column indices from headers ---
      const headers = Array.from(
        table.querySelectorAll("thead th, thead td, tr:first-child th"),
      ).map((th) => th.textContent.trim());

      const indexOf = (keyword) =>
        headers.findIndex((h) => h.includes(keyword));

      const colTitle = indexOf("Назив");
      const colPrice = indexOf("Продажна цена");
      const colCategory = indexOf("Опис на стока");
      const colAvailable = indexOf("Достапност");

      // Guard: if we can't find critical columns, bail out
      if (colTitle === -1 || colPrice === -1 || colAvailable === -1) {
        console.warn("[VeroScraper] Could not resolve table columns", headers);
        return [];
      }

      // --- Parse data rows ---
      const rows = Array.from(table.querySelectorAll("tbody tr"));

      return rows.reduce((acc, row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length === 0) return acc;

        const available = cells[colAvailable]?.textContent.trim();
        if (available === "Не") return acc; // skip unavailable

        const rawPrice = cells[colPrice]?.textContent
          .trim()
          .replace(",", ".") // handle Macedonian decimal format
          .replace(/[^\d.]/g, ""); // strip currency symbols

        const price = parseFloat(rawPrice);
        if (isNaN(price) || price > maxPrice) return acc;

        const title = cells[colTitle]?.textContent.trim();
        const category =
          colCategory !== -1
            ? cells[colCategory]?.textContent.trim()
            : undefined;

        if (!title) return acc;

        acc.push({ title, price, category });
        return acc;
      }, []);
    }, MAX_PRICE);

    return products;
  }
}
