import { BaseScraper } from "./base.scraper.js";

const INDEX_URL = "https://ramstore.com.mk/marketi/";
const MAX_PRICE = 840;

export class RamstoreScraper extends BaseScraper {
  get placeholderImageFilename() {
    return process.env.VENDOR_IMAGE_RAMSTORE || "ramstore_market.png";
  }

  get geocodeSuffix() {
    return "Македонија";
  }

  async fetchVendors(page) {
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

    await page.goto(storeUrl, { waitUntil: "networkidle0" });

    const pageUpdateString = await page.evaluate(() => {
      const match = document.body.innerText.match(
        /Датум и време на последно ажурирање на цените:\s*([^\n]+)/i,
      );
      return match ? match[1].trim() : null;
    });

    if (previousUpdateString && pageUpdateString === previousUpdateString) {
      return { upToDate: true };
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
        await page.evaluate((oldInfo) => {
          return new Promise((resolve) => {
            document.querySelector(".paginate_button.next").click();
            const check = setInterval(() => {
              const newInfo =
                document.querySelector(".dataTables_info")?.innerText || "";
              if (newInfo !== oldInfo) {
                clearInterval(check);
                resolve();
              }
            }, 50);
          });
        }, pageData.info);

        pageCount++;
        if (pageCount % 10 === 0)
          console.log(`[RamstoreScraper] Reached page ${pageCount}...`);
      }
    }

    return {
      upToDate: false,
      products: allProducts,
      newUpdateString:
        pageUpdateString || new Date().toISOString().split("T")[0],
    };
  }
}
