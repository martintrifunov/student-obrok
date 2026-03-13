import puppeteer from "puppeteer";

export class ScraperService {
  constructor(
    vendorRepository,
    productRepository,
    imageRepository,
    geocoderService,
  ) {
    this.vendorRepository = vendorRepository;
    this.productRepository = productRepository;
    this.imageRepository = imageRepository;
    this.geocoderService = geocoderService;
  }

  /**
   * Runs the full scrape pipeline for a given market scraper.
   * - Resolves the placeholder image for that market.
   * - Fetches all store locations from the market's index page.
   * - For each store: creates the vendor if it doesn't exist (with geocoding),
   *   then bulk-upserts its products.
   *
   * @param {import('./markets/base.scraper.js').BaseScraper} scraper
   */
  async runForMarket(scraper) {
    console.log(
      `[ScraperService] Starting run for ${scraper.constructor.name}`,
    );

    const placeholderImage = await this.imageRepository.findByFilename(
      scraper.placeholderImageFilename,
    );
    if (!placeholderImage) {
      throw new Error(
        `Placeholder image "${scraper.placeholderImageFilename}" not found in DB. ` +
          `Please upload it before running the scraper.`,
      );
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(30_000);

      const vendors = await scraper.fetchVendors(page);
      console.log(
        `[ScraperService] Found ${vendors.length} stores for ${scraper.constructor.name}`,
      );

      for (const { name, pricelistUrl } of vendors) {
        await this.#processVendor({
          name,
          pricelistUrl,
          page,
          scraper,
          placeholderImage,
        });
      }
    } finally {
      await browser.close();
      console.log(
        `[ScraperService] Finished run for ${scraper.constructor.name}`,
      );
    }
  }

  async #processVendor({
    name,
    pricelistUrl,
    page,
    scraper,
    placeholderImage,
  }) {
    try {
      let vendor = await this.vendorRepository.findByName(name);

      if (!vendor) {
        console.log(
          `[ScraperService] New vendor found: "${name}". Geocoding...`,
        );

        const location = await this.geocoderService.geocode(
          name,
          scraper.geocodeSuffix,
        );

        vendor = await this.vendorRepository.create({
          name,
          location,
          image: placeholderImage._id,
        });

        console.log(
          `[ScraperService] Created vendor "${name}" at [${location}]`,
        );
      } else {
        console.log(
          `[ScraperService] Vendor "${name}" already exists. Skipping geocoding.`,
        );
      }

      const rawProducts = await scraper.fetchProducts(page, pricelistUrl);
      console.log(
        `[ScraperService] Scraped ${rawProducts.length} products for "${name}"`,
      );

      if (!rawProducts.length) return;

      const products = rawProducts.map((p) => ({
        ...p,
        vendor: vendor._id,
      }));

      const result = await this.productRepository.bulkUpsert(products);
      console.log(
        `[ScraperService] Upsert result for "${name}": ` +
          `${result.upsertedCount} inserted, ${result.modifiedCount} updated`,
      );
    } catch (err) {
      console.error(
        `[ScraperService] Error processing vendor "${name}":`,
        err.message,
      );
    }
  }
}
