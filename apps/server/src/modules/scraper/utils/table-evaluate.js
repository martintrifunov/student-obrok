/**
 * Shared product-table extraction logic for Puppeteer page.evaluate().
 *
 * These functions are serialized and run in the browser context —
 * they must be self-contained (no imports, no closures over Node variables).
 */

/**
 * Extract products from an HTML table inside a Puppeteer page.
 *
 * @param {number} maxPrice - Maximum allowed price
 * @param {Object} opts
 * @param {string} [opts.tableSelector] - CSS selector for the table (default: auto-detect by "Назив" header)
 * @param {string} [opts.defaultCategory="Општо"] - Fallback category value
 * @returns {Array<{title: string, price: number, category: string}>}
 */
export const extractProductsFromTable = (maxPrice, opts = {}) => {
  const { tableSelector, defaultCategory = "Општо" } = opts;

  let productTable;
  if (tableSelector) {
    productTable = document.querySelector(tableSelector);
  } else {
    productTable = Array.from(document.querySelectorAll("table")).find((t) =>
      Array.from(t.querySelectorAll("th")).some((th) =>
        th.textContent.includes("Назив"),
      ),
    );
  }

  if (!productTable) return [];

  const headerRow = productTable.querySelector("thead tr, tr:first-child");
  if (!headerRow) return [];

  const headers = Array.from(headerRow.querySelectorAll("th, td")).map((th) =>
    th.textContent.toLowerCase().replace(/\n/g, " ").trim(),
  );

  const indexOf = (keywords) =>
    headers.findIndex((h) => keywords.some((k) => h.includes(k)));

  const colTitle = indexOf(["назив"]);
  const colPrice = indexOf(["продажна цена", "цена"]);
  const colCategory = indexOf(["опис на стока", "опис на производ", "категорија"]);
  const colAvailable = indexOf(["достапност"]);

  if (colTitle === -1 || colPrice === -1) return [];

  const dataRows = Array.from(
    productTable.querySelectorAll("tbody tr, tr"),
  ).slice(1);

  return dataRows.reduce((acc, row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    if (cells.length < 2) return acc;

    if (
      colAvailable !== -1 &&
      cells[colAvailable]?.textContent.trim().toUpperCase() === "НЕ"
    ) return acc;

    const rawPrice = cells[colPrice]?.textContent
      .replace(",", ".")
      .replace(/[^\d.]/g, "");
    const price = parseFloat(rawPrice);
    if (isNaN(price) || price > maxPrice) return acc;

    const title = cells[colTitle]?.textContent.trim();
    if (!title) return acc;

    const category = colCategory !== -1
      ? cells[colCategory]?.textContent.trim() || defaultCategory
      : defaultCategory;

    acc.push({ title, price, category });
    return acc;
  }, []);
};
