import { BaseScraper } from "./base.scraper.js";

const INDEX_URL = "https://ramstore.com.mk/marketi/";
const MAX_PRICE = 840;
const NAV_TIMEOUT_MS = Number.parseInt(
  process.env.SCRAPER_NAV_TIMEOUT_MS ?? "90000",
  10,
);
const PAGINATION_WAIT_TIMEOUT_MS = Number.parseInt(
  process.env.SCRAPER_PAGINATION_WAIT_TIMEOUT_MS ?? "15000",
  10,
);
const UPDATE_TEXT_WAIT_TIMEOUT_MS = Number.parseInt(
  process.env.SCRAPER_UPDATE_TEXT_WAIT_TIMEOUT_MS ?? "12000",
  10,
);

export class RamstoreScraper extends BaseScraper {
  get vendorName() {
    return "Ramstore";
  }

  get placeholderImageFilename() {
    return process.env.VENDOR_IMAGE_RAMSTORE || "ramstore_market.png";
  }

  get geocodeSuffix() {
    return "Македонија";
  }

  async fetchMarkets(page) {
    await page.goto(INDEX_URL, { waitUntil: "domcontentloaded" });

    const entries = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button")).filter(
        (btn) => btn.getAttribute("onclick")?.includes("location.href="),
      );

      return buttons
        .map((btn) => {
          const hrefMatch = btn
            .getAttribute("onclick")
            .match(/location\.href='([^']+)'/);
          if (!hrefMatch) return null;

          const pricelistUrl = hrefMatch[1];
          let parent = btn.parentElement;
          let name = "UNKNOWN";
          let address = "";

          for (let i = 0; i < 5; i++) {
            if (!parent) break;

            const heading = parent.querySelector("h2, h3, h4");
            if (
              heading &&
              heading.textContent.toLowerCase().includes("рамстор")
            ) {
              name = heading.textContent
                .replace(/РАМСТОРЕ/gi, "РАМСТОР")
                .trim();

              const p = Array.from(
                parent.querySelectorAll("p, span, div"),
              ).find((el) => el.textContent.includes("Адреса:"));

              if (p) {
                address = p.textContent
                  .replace(/Адреса:/i, "")
                  .replace(/\n/g, " ")
                  .trim();
              }
              break;
            }
            parent = parent.parentElement;
          }

          return { name, address, pricelistUrl };
        })
        .filter((e) => e && e.name !== "UNKNOWN");
    });

    const seen = new Map();
    for (const entry of entries) {
      if (!seen.has(entry.name)) seen.set(entry.name, entry);
    }

    return Array.from(seen.values());
  }

  async fetchProducts(page, storeUrl, previousUpdateString) {
    const allProducts = [];

    try {
      await page.goto(storeUrl, {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT_MS,
      });
    } catch (err) {
      console.warn(
        `[RamstoreScraper] Slow navigation for ${storeUrl}, retrying with domcontentloaded: ${err.message}`,
      );
      await page.goto(storeUrl, {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT_MS,
      });
    }

    // Wait for the table first — the page needs JS to render both the table
    // and the update text, so by the time the table is ready the update string
    // is usually present too. Use the full nav timeout here because heavy
    // markets (e.g. СИТИ МОЛ) need a long time for JS to build the table
    // after domcontentloaded.
    await page.waitForSelector("table.dataTable, table", {
      timeout: NAV_TIMEOUT_MS,
    });

    let pageUpdateString = await this.#readUpdateString(page);

    if (!pageUpdateString) {
      try {
        await page.waitForFunction(
          () =>
            /Датум и време на последно ажурирање на цените:\s*([^\n]+)/i.test(
              document.body.innerText,
            ),
          { timeout: UPDATE_TEXT_WAIT_TIMEOUT_MS },
        );
        pageUpdateString = await this.#readUpdateString(page);
      } catch {
      }
    }

    const pageUpdateDate = this.parseUpdateDate(pageUpdateString);
    if (previousUpdateString && pageUpdateDate && previousUpdateString.getTime() === pageUpdateDate.getTime()) {
      return { upToDate: true };
    }

    // Fast path: read DataTables data directly instead of clicking through pages.
    const fastPath = await page.evaluate((maxPrice) => {
      const table = document.querySelector("table.dataTable, table");
      if (!table) return { supported: false, products: [] };

      const hasJQuery = typeof window.jQuery !== "undefined";
      const hasDataTable = hasJQuery && !!window.jQuery.fn?.DataTable;
      if (!hasDataTable) return { supported: false, products: [] };

      const dt = window.jQuery(table).DataTable();
      if (!dt) return { supported: false, products: [] };

      const headerRow = table.querySelector("thead tr, tr:first-child");
      if (!headerRow) return { supported: false, products: [] };

      const headers = Array.from(headerRow.querySelectorAll("th, td")).map(
        (th) => th.textContent.toLowerCase().replace(/\n/g, " ").trim(),
      );

      const indexOf = (keywords) =>
        headers.findIndex((h) => keywords.some((k) => h.includes(k)));
      const colTitle = indexOf(["назив"]);
      const colPrice = indexOf(["продажна цена"]);
      const colCategory = indexOf(["опис на производ", "опис на стока"]);
      const colAvailable = indexOf(["достапност"]);

      if (colTitle === -1 || colPrice === -1) {
        return { supported: false, products: [] };
      }

      const asText = (value) => {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") {
          const div = document.createElement("div");
          div.innerHTML = value;
          return (div.textContent || "").trim();
        }
        return String(value).trim();
      };

      const rows = dt.rows({ search: "applied" }).data().toArray();
      const products = [];

      for (const row of rows) {
        const cells = Array.isArray(row) ? row : Object.values(row || {});
        if (!cells.length) continue;

        if (
          colAvailable !== -1 &&
          asText(cells[colAvailable]).toUpperCase() === "НЕ"
        ) {
          continue;
        }

        const rawPrice = asText(cells[colPrice])
          .replace(",", ".")
          .replace(/[^\d.]/g, "");
        const price = Number.parseFloat(rawPrice);
        if (Number.isNaN(price) || price > maxPrice) continue;

        const title = asText(cells[colTitle]);
        if (!title) continue;

        const category =
          colCategory !== -1 ? asText(cells[colCategory]) || "Општо" : "Општо";

        products.push({ title, price, category });
      }

      return { supported: true, products };
    }, MAX_PRICE);

    if (fastPath.supported) {
      // Keep the latest seen price per title to avoid unnecessary duplicate writes.
      const latestByTitle = new Map();
      for (const p of fastPath.products) {
        latestByTitle.set(p.title, p);
      }
      allProducts.push(...latestByTitle.values());

      return {
        upToDate: false,
        products: allProducts,
        newUpdateDate: pageUpdateDate,
      };
    }

    await page.evaluate(() => {
      const select = document.querySelector('select[name$="_length"]');
      if (select) {
        select.value = "100";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    await new Promise((r) => setTimeout(r, 1000));

    let hasNextPage = true;
    let pageCount = 1;

    while (hasNextPage) {
      const pageData = await page.evaluate((maxPrice) => {
        const productTable = document.querySelector("table.dataTable, table");
        if (!productTable) return { products: [], hasNextBtn: false, info: "" };

        const headerRow = productTable.querySelector(
          "thead tr, tr:first-child",
        );
        const headers = Array.from(headerRow.querySelectorAll("th, td")).map(
          (th) => th.textContent.toLowerCase().replace(/\n/g, " ").trim(),
        );

        const indexOf = (keywords) =>
          headers.findIndex((h) => keywords.some((k) => h.includes(k)));
        const colTitle = indexOf(["назив"]);
        const colPrice = indexOf(["продажна цена"]);
        const colCategory = indexOf(["опис на производ", "опис на стока"]);
        const colAvailable = indexOf(["достапност"]);

        if (colTitle === -1 || colPrice === -1)
          return { products: [], hasNextBtn: false, info: "" };

        const dataRows = Array.from(productTable.querySelectorAll("tbody tr"));
        const products = dataRows.reduce((acc, row) => {
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

        const nextBtn = document.querySelector(".paginate_button.next");
        const hasNextBtn = nextBtn && !nextBtn.classList.contains("disabled");
        const info =
          document.querySelector(".dataTables_info")?.innerText || "";

        return { products, hasNextBtn, info };
      }, MAX_PRICE);

      allProducts.push(...pageData.products);
      hasNextPage = pageData.hasNextBtn;

      if (hasNextPage) {
        await page.evaluate((oldInfo, maxWaitMs) => {
          return new Promise((resolve) => {
            document.querySelector(".paginate_button.next").click();
            const startedAt = Date.now();
            const check = setInterval(() => {
              const newInfo =
                document.querySelector(".dataTables_info")?.innerText || "";
              if (newInfo !== oldInfo || Date.now() - startedAt > maxWaitMs) {
                clearInterval(check);
                resolve();
              }
            }, 50);
          });
        }, pageData.info, PAGINATION_WAIT_TIMEOUT_MS);

        pageCount++;
        if (pageCount % 10 === 0)
          console.log(`[RamstoreScraper] Reached page ${pageCount}...`);
      }
    }

    // Fallback path can also produce duplicate titles from repeated pages.
    // Keep latest seen price per title before persisting.
    const latestByTitle = new Map();
    for (const p of allProducts) {
      latestByTitle.set(p.title, p);
    }

    return {
      upToDate: false,
      products: Array.from(latestByTitle.values()),
      newUpdateDate: pageUpdateDate,
    };
  }

  async #readUpdateString(page) {
    return page.evaluate(() => {
      const match = document.body.innerText.match(
        /Датум и време на последно ажурирање на цените:\s*([^\n]+)/i,
      );
      return match ? match[1].trim() : null;
    });
  }
}
