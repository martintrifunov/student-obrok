import { BaseScraper } from "./base.scraper.js";

const INDEX_URL = "https://pricelist.vero.com.mk/";
const MAX_PRICE = 840;

export class VeroScraper extends BaseScraper {
  get placeholderImageFilename() {
    return "1773443943027-b83de0eee914.png";
  }

  get geocodeSuffix() {
    return "Македонија";
  }

  async fetchVendors(page) {
    await page.goto(INDEX_URL, { waitUntil: "networkidle2" });

    const entries = await page.evaluate((baseUrl) => {
      const storePattern = /^\d+_\d+\.html$/;

      return Array.from(document.querySelectorAll("a[href]"))
        .filter((a) => storePattern.test(a.getAttribute("href")))
        .map((a) => {
          const name = a.textContent.trim();

          const td = a.closest("td");
          const rawAddress = td
            ? td.innerText.replace(name, "").replace(/\n/g, " ").trim()
            : "";

          // Keep city after "–" — it's needed for geocoding
          // "Бул. Јане Сандански бр.111 – Аеродром" → "Бул. Јане Сандански бр.111, Аеродром"
          const address = rawAddress
            .split("–")
            .map((s) => s.trim())
            .join(", ");

          return {
            name,
            address,
            pricelistUrl: baseUrl + a.getAttribute("href"),
          };
        })
        .filter((e) => e.name.length > 0);
    }, INDEX_URL);

    // Deduplicate by name — keep the FIRST URL (page 1 of each store)
    const seen = new Map();
    for (const entry of entries) {
      if (!seen.has(entry.name)) {
        seen.set(entry.name, entry);
      }
    }

    return Array.from(seen.values());
  }

  async fetchProducts(page, storeUrl) {
    const allProducts = [];
    let currentUrl = storeUrl;

    // Follow pagination until no "next page" link is found
    while (currentUrl) {
      await page.goto(currentUrl, { waitUntil: "networkidle2" });

      const pageProducts = await page.evaluate((maxPrice) => {
        // Find the product table — the one containing a <th> with "Назив"
        const tables = Array.from(document.querySelectorAll("table"));
        const productTable = tables.find((t) => {
          const ths = t.querySelectorAll("th");
          return Array.from(ths).some((th) => th.textContent.includes("Назив"));
        });

        if (!productTable) return [];

        // Headers are <th> in the first <tr> (no <thead> on this site)
        const headerRow = productTable.querySelector("tr");
        const headers = Array.from(headerRow.querySelectorAll("th")).map((th) =>
          th.textContent.replace(/\n/g, " ").trim(),
        );

        const indexOf = (keyword) =>
          headers.findIndex((h) => h.includes(keyword));

        const colTitle = indexOf("Назив");
        const colPrice = indexOf("Продажна цена");
        const colCategory = indexOf("Опис на стока");
        const colAvailable = indexOf("Достапност");

        if (colTitle === -1 || colPrice === -1 || colAvailable === -1) {
          return [];
        }

        // Data rows are all <tr> after the header row
        const allRows = Array.from(productTable.querySelectorAll("tr"));
        const dataRows = allRows.slice(1); // skip header row

        return dataRows.reduce((acc, row) => {
          const cells = Array.from(row.querySelectorAll("td"));
          if (!cells.length) return acc;

          const available = cells[colAvailable]?.textContent.trim();
          if (available === "Не") return acc;

          const rawPrice = cells[colPrice]?.textContent
            .trim()
            .replace(",", ".")
            .replace(/[^\d.]/g, "");

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

      allProducts.push(...pageProducts);

      // Check for next page link
      // Current URL pattern: /89_1.html → next would be /89_2.html
      const nextUrl = await page.evaluate((current) => {
        // Extract store ID and page number from current URL
        const match = current.match(/(\d+)_(\d+)\.html$/);
        if (!match) return null;

        const storeId = match[1];
        const nextPage = parseInt(match[2], 10) + 1;
        const nextHref = `${storeId}_${nextPage}.html`;

        // Check if a link to the next page exists on this page
        const link = Array.from(document.querySelectorAll("a[href]")).find(
          (a) => a.getAttribute("href") === nextHref,
        );

        return link ? link.href : null;
      }, currentUrl);

      currentUrl = nextUrl;

      if (nextUrl) {
        console.log(`[VeroScraper] Following pagination → ${nextUrl}`);
      }
    }

    return allProducts;
  }
}
