/**
 * Abstract base class for all market scrapers.
 *
 * To add a new market, extend this class and implement:
 *   - get chainName()
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
   * The canonical chain name (e.g. "Vero", "Ramstore", "Stokomak").
   * Used by ScraperService to auto-create the Chain document.
   * @returns {string}
   */
  get chainName() {
    throw new Error(
      `${this.constructor.name} must implement chainName`,
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

  parseUpdateDate(raw) {
    if (!raw) return null;
    const m = raw.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!m) return null;
    let [, day, month, year, hours, minutes, ampm] = m;
    hours = Number(hours);
    if (ampm?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return new Date(Number(year), Number(month) - 1, Number(day), hours, Number(minutes));
  }
}
