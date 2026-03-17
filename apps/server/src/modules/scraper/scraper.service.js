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
    if (!placeholderImage) {
      throw new Error(`Placeholder image not found in DB.`);
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    try {
      const setupPage = await browser.newPage();
      await this.#optimizePage(setupPage);
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

  async #optimizePage(page) {
    await page.setDefaultNavigationTimeout(60_000);
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });
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
    await this.#optimizePage(page);

    try {
      const result = await scraper.fetchProducts(
        page,
        pricelistUrl,
        vendorDoc.lastScrapedUpdate,
      );

      if (result.upToDate) {
        const tabDuration = ((performance.now() - tabStartTime) / 1000).toFixed(
          2,
        );
        console.log(
          `[Scraper] ⚡ [${name}] No changes detected. Skipped in ${tabDuration}s.`,
        );
        return;
      }

      const rawProducts = result.products;
      if (!rawProducts || !rawProducts.length) return;

      const productsData = rawProducts.map(({ title, category }) => ({
        title,
        category,
      }));

      const productIdMap = await this.#safeProductUpsert(productsData);

      const vendorProducts = rawProducts
        .filter(({ title }) => productIdMap.has(title))
        .map(({ title, price }) => ({
          vendor: vendorDoc._id,
          product: productIdMap.get(title),
          price,
        }));

      await this.vendorProductRepository.bulkUpsert(vendorProducts);

      if (result.newUpdateString) {
        vendorDoc.lastScrapedUpdate = result.newUpdateString;
        await this.vendorRepository.save(vendorDoc);
      }

      const tabDuration = ((performance.now() - tabStartTime) / 1000).toFixed(
        2,
      );
      console.log(
        `[Scraper] ✅ [${name}] Scraped ${rawProducts.length} items in ${tabDuration}s`,
      );
    } catch (err) {
      console.error(`[ScraperService] Error in [${name}]:`, err.message);
    } finally {
      await page.close();
    }
  }

  async #safeProductUpsert(productsData, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.productRepository.bulkUpsertProducts(productsData);
      } catch (err) {
        if (err.code === 11000 && attempt < retries) {
          await new Promise((res) => setTimeout(res, 500 * attempt));
          continue;
        }
        throw err;
      }
    }
  }
}
