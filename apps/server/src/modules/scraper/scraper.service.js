import puppeteer from "puppeteer";

export class ScraperService {
  constructor(
    vendorRepository,
    productRepository,
    vendorProductRepository,
    imageRepository,
    geocoderService,
  ) {
    this.vendorRepository = vendorRepository;
    this.productRepository = productRepository;
    this.vendorProductRepository = vendorProductRepository;
    this.imageRepository = imageRepository;
    this.geocoderService = geocoderService;
  }

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

      for (const { name, address, pricelistUrl } of vendors) {
        await this.#processVendor({
          name,
          address,
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
    address,
    pricelistUrl,
    page,
    scraper,
    placeholderImage,
  }) {
    try {
      let vendor = await this.vendorRepository.findByName(name);

      if (!vendor) {
        console.log(
          `[ScraperService] New vendor "${name}". Geocoding via: "${address}"...`,
        );

        const location = await this.geocoderService.geocode(
          name,
          scraper.geocodeSuffix,
          address,
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

      const productsData = rawProducts.map(({ title, category }) => ({
        title,
        category,
      }));
      const productIdMap =
        await this.productRepository.bulkUpsertProducts(productsData);

      const vendorProducts = rawProducts
        .filter(({ title }) => productIdMap.has(title))
        .map(({ title, price }) => ({
          vendor: vendor._id,
          product: productIdMap.get(title),
          price,
        }));

      const result =
        await this.vendorProductRepository.bulkUpsert(vendorProducts);

      console.log(
        `[ScraperService] Upsert for "${name}": ` +
          `${result.upsertedCount} new links, ${result.modifiedCount} price updates. ` +
          `(${productIdMap.size} unique products)`,
      );
    } catch (err) {
      console.error(
        `[ScraperService] Error processing vendor "${name}":`,
        err.message,
      );
    }
  }
}
