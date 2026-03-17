/**
 * Abstract base class for all market scrapers.
 *
 * To add a new market, extend this class and implement:
 *   - get vendorName()
 *   - get placeholderImageFilename()
 *   - get geocodeSuffix()        (optional override)
 *   - async fetchMarkets(page)
 *   - async fetchProducts(page, storeUrl)
 *
 * ScraperService drives the orchestration — the scraper only
 * knows how to navigate and parse its own market's HTML.
 */
export class BaseScraper {
  /**
   * The canonical vendor/chain name (e.g. "Vero", "Ramstore", "Stokomak").
   * Used by ScraperService to auto-create the Vendor document.
   * @returns {string}
   */
  get vendorName() {
    throw new Error(
      `${this.constructor.name} must implement vendorName`,
    );
  }

  /**
   * The filename of the pre-uploaded placeholder image for this market.
   * e.g. "vero_market.png"
   * @returns {string}
   */
  get placeholderImageFilename() {
    throw new Error(
      `${this.constructor.name} must implement placeholderImageFilename`,
    );
  }

  /**
   * Appended to the store name when building the Nominatim geocode query.
   * Override if the market operates in a different city/country.
   * @returns {string}
   */
  get geocodeSuffix() {
    return "Скопје, Македонија";
  }

  /**
   * Scrape the market's index page and return all store locations.
   *
   * @param {import('puppeteer').Page} page - A Puppeteer page instance.
   * @returns {Promise<Array<{ name: string, pricelistUrl: string }>>}
   */
  async fetchMarkets(page) {
    throw new Error(`${this.constructor.name} must implement fetchMarkets()`);
  }

  /**
   * Scrape a single store's pricelist page.
   * Must filter out unavailable products (Достапност = "Не")
   * and products with price > 840.
   *
   * @param {import('puppeteer').Page} page - A Puppeteer page instance.
   * @param {string} storeUrl - The URL of the store's pricelist.
   * @returns {Promise<Array<{ title: string, price: number, category: string }>>}
   */
  async fetchProducts(page, storeUrl) {
    throw new Error(`${this.constructor.name} must implement fetchProducts()`);
  }
}
