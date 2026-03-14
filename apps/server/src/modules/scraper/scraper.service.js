import puppeteer from "puppeteer";

const CONCURRENT_TABS = 4;

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
    const startTime = performance.now();
    console.log(`\n[ScraperService] 🚀 Starting ${scraper.constructor.name}`);

    const placeholderImage = await this.imageRepository.findByFilename(
      scraper.placeholderImageFilename,
    );
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });

    try {
      const setupPage = await browser.newPage();
      const vendors = await scraper.fetchVendors(setupPage);
      await setupPage.close();

      // Phase 1: Sequential Vendor Setup
      const readyVendors = [];
      for (const v of vendors) {
        const vendorDoc = await this.#ensureVendorExists(
          v.name,
          v.address,
          scraper,
          placeholderImage,
        );
        readyVendors.push({ ...v, vendorDoc });
      }

      // Phase 2: Multithreaded Scrape
      for (let i = 0; i < readyVendors.length; i += CONCURRENT_TABS) {
        const batch = readyVendors.slice(i, i + CONCURRENT_TABS);
        await Promise.all(
          batch.map((v) => this.#scrapeAndSaveStore(v, scraper, browser)),
        );
      }
    } finally {
      await browser.close();
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(
        `\n[ScraperService] ✅ Finished ${scraper.constructor.name} in ${duration}s`,
      );
    }
  }

  async #ensureVendorExists(name, address, scraper, placeholderImage) {
    let vendor = await this.vendorRepository.findByName(name);
    if (vendor) return vendor;

    const location = await this.geocoderService.geocode(
      name,
      scraper.geocodeSuffix,
      address,
    );
    return this.vendorRepository.create({
      name,
      location,
      image: placeholderImage._id,
    });
  }

  async #scrapeAndSaveStore(vendorData, scraper, browser) {
    const { name, pricelistUrl, vendorDoc } = vendorData;
    const tabStartTime = performance.now();
    const page = await browser.newPage();

    try {
      const rawProducts = await scraper.fetchProducts(page, pricelistUrl);
      if (!rawProducts.length) return;

      const productIdMap =
        await this.productRepository.bulkUpsertProducts(rawProducts);
      const vendorProducts = rawProducts.map((p) => ({
        vendor: vendorDoc._id,
        product: productIdMap.get(p.title),
        price: p.price,
      }));

      await this.vendorProductRepository.bulkUpsert(vendorProducts);
      const tabDuration = ((performance.now() - tabStartTime) / 1000).toFixed(
        2,
      );
      console.log(
        `[Scraper] [${name}] Done: ${rawProducts.length} items in ${tabDuration}s`,
      );
    } finally {
      await page.close();
    }
  }
}
