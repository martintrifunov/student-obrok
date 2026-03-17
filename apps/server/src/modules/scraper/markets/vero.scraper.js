import { BaseScraper } from "./base.scraper.js";

const INDEX_URL = "https://pricelist.vero.com.mk/";
const MAX_PRICE = 840;

export class VeroScraper extends BaseScraper {
  get placeholderImageFilename() {
    return process.env.VENDOR_IMAGE_VERO || "vero_market.png";
  }

  get geocodeSuffix() {
    return "Македонија";
  }

  async fetchVendors(page) {
    await page.goto(INDEX_URL, { waitUntil: "domcontentloaded" });

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

    const seen = new Map();
    for (const entry of entries) {
      if (!seen.has(entry.name)) {
        seen.set(entry.name, entry);
      }
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
            /Последно ажурирање:\s*([^\n]+)/,
          );
          return match ? match[1].trim() : null;
        });

        if (previousUpdateString && pageUpdateString === previousUpdateString) {
          return { upToDate: true };
        }
        isFirstPage = false;
      }

      const pageProducts = await page.evaluate((maxPrice) => {
        const tables = Array.from(document.querySelectorAll("table"));
        const productTable = tables.find((t) => {
          const ths = t.querySelectorAll("th");
          return Array.from(ths).some((th) => th.textContent.includes("Назив"));
        });

        if (!productTable) return [];

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

        const allRows = Array.from(productTable.querySelectorAll("tr"));
        const dataRows = allRows.slice(1);

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

      const nextUrl = await page.evaluate((current) => {
        const match = current.match(/(\d+)_(\d+)\.html$/);
        if (!match) return null;

        const storeId = match[1];
        const nextPage = parseInt(match[2], 10) + 1;
        const nextHref = `${storeId}_${nextPage}.html`;

        const link = Array.from(document.querySelectorAll("a[href]")).find(
          (a) => a.getAttribute("href") === nextHref,
        );

        return link ? link.href : null;
      }, currentUrl);

      currentUrl = nextUrl;
    }

    return {
      upToDate: false,
      products: allProducts,
      newUpdateString: pageUpdateString,
    };
  }
}
