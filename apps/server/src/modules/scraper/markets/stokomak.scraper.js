import { BaseScraper } from "./base.scraper.js";

const INDEX_URL = "https://stokomak.proverkanaceni.mk/";
const MAX_PRICE = 3000;

export class StokomakScraper extends BaseScraper {
  get chainName() {
    return "Stokomak";
  }

  get placeholderImageFilename() {
    return process.env.VENDOR_IMAGE_STOKOMAK || "stokomak_market.png";
  }

  get geocodeSuffix() {
    return "Македонија";
  }

  async fetchMarkets(page) {
    await page.goto(INDEX_URL, { waitUntil: "domcontentloaded" });

    const entries = await page.evaluate((baseUrl) => {
      const selects = Array.from(document.querySelectorAll("select"));
      const storeSelect = selects.find(
        (s) => s.name === "org" || s.options.length > 5,
      );

      if (!storeSelect) return [];

      return Array.from(storeSelect.options)
        .map((opt) => {
          const val = opt.value;
          if (!val || val.trim() === "") return null;

          let rawName = opt.textContent.trim();

          // Ensure it has the brand name for the Geocoder
          const name = rawName.toUpperCase().includes("СТОКОМАК")
            ? rawName
            : `СТОКОМАК ${rawName}`;

          return {
            name: name,
            address: rawName,
            pricelistUrl: `${baseUrl}?org=${val}&search=&perPage=100`,
          };
        })
        .filter(Boolean);
    }, INDEX_URL);

    const seen = new Map();
    for (const entry of entries) {
      if (!seen.has(entry.name)) seen.set(entry.name, entry);
    }

    return Array.from(seen.values());
  }

  async fetchProducts(page, storeUrl, previousUpdateString) {
    const allProducts = [];
    let currentUrl = storeUrl;
    let pageUpdateString = null;
    let isFirstPage = true;

    while (currentUrl) {
      await page.goto(currentUrl, { waitUntil: "domcontentloaded" });

      if (isFirstPage) {
        pageUpdateString = await page.evaluate(() => {
          const match = document.body.innerText.match(
            /Датум и време на последно ажурирање[^:]*:\s*([^\n]+)/i,
          );
          return match ? match[1].trim() : null;
        });

        const pageUpdateDate = this.parseUpdateDate(pageUpdateString);
        if (previousUpdateString && pageUpdateDate && previousUpdateString.getTime() === pageUpdateDate.getTime()) {
          return { upToDate: true };
        }
        isFirstPage = false;
      }

      const pageProducts = await page.evaluate((maxPrice) => {
        const table = document.querySelector("table");
        if (!table) return [];

        const headerRow = table.querySelector("thead tr, tr:first-child");
        if (!headerRow) return [];

        const headers = Array.from(headerRow.querySelectorAll("th, td")).map(
          (th) => th.textContent.toLowerCase().replace(/\n/g, " ").trim(),
        );

        const indexOf = (keywords) =>
          headers.findIndex((h) => keywords.some((k) => h.includes(k)));

        const colTitle = indexOf(["назив"]);
        const colPrice = indexOf(["продажна цена", "цена"]);
        const colCategory = indexOf(["опис на стока", "категорија"]);
        const colAvailable = indexOf(["достапност"]);

        if (colTitle === -1 || colPrice === -1) return [];

        const allRows = Array.from(
          table.querySelectorAll("tbody tr, tr"),
        ).slice(1);

        return allRows.reduce((acc, row) => {
          const cells = Array.from(row.querySelectorAll("td"));
          if (cells.length < 2) return acc;

          if (
            colAvailable !== -1 &&
            cells[colAvailable]?.textContent.trim().toUpperCase() === "НЕ"
          )
            return acc;

          const rawPrice = cells[colPrice]?.textContent
            .replace(",", ".")
            .replace(/[^\d.]/g, "");
          const price = parseFloat(rawPrice);
          if (isNaN(price) || price > maxPrice) return acc;

          const title = cells[colTitle]?.textContent.trim();
          if (!title) return acc;

          const category =
            colCategory !== -1
              ? cells[colCategory]?.textContent.trim()
              : "Општо";

          acc.push({ title, price, category });
          return acc;
        }, []);
      }, MAX_PRICE);

      allProducts.push(...pageProducts);

      const nextUrl = await page.evaluate(() => {
        const nextLinks = Array.from(document.querySelectorAll("a")).filter(
          (a) =>
            a.textContent.trim() === "»" ||
            a.textContent.toLowerCase().includes("следно"),
        );
        return nextLinks.length > 0 ? nextLinks[0].href : null;
      });

      currentUrl = nextUrl;
    }

    return {
      upToDate: false,
      products: allProducts,
      newUpdateDate: this.parseUpdateDate(pageUpdateString),
    };
  }
}
