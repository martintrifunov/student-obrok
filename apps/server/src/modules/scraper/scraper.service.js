import puppeteer from "puppeteer";

const CONCURRENT_TABS = 4;

export class ScraperService {
  constructor(
    vendorRepository,
    marketRepository,
    productRepository,
    marketProductRepository,
    imageRepository,
    geocoderService,
  ) {
    this.vendorRepository = vendorRepository;
    this.marketRepository = marketRepository;
    this.productRepository = productRepository;
    this.marketProductRepository = marketProductRepository;
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

    const vendorDoc = await this.#ensureVendorExists(
      scraper.vendorName,
      placeholderImage,
    );

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
      const markets = await scraper.fetchMarkets(setupPage);
      await setupPage.close();

      // Phase 1: Sequential Market Setup
      const readyMarkets = [];
      for (const m of markets) {
        const marketDoc = await this.#ensureMarketExists(
          m.name,
          m.address,
          scraper,
          vendorDoc,
        );
        if (marketDoc) {
          readyMarkets.push({ ...m, marketDoc });
        }
      }

      // Phase 2: Multithreaded Scrape
      for (let i = 0; i < readyMarkets.length; i += CONCURRENT_TABS) {
        const batch = readyMarkets.slice(i, i + CONCURRENT_TABS);
        await Promise.all(
          batch.map((m) => this.#scrapeAndSaveStore(m, scraper, browser)),
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

  async #ensureVendorExists(vendorName, placeholderImage) {
    let vendor = await this.vendorRepository.findByName(vendorName);
    if (vendor) return vendor;

    return this.vendorRepository.create({
      name: vendorName,
      image: placeholderImage._id,
    });
  }

  async #ensureMarketExists(name, address, scraper, vendorDoc) {
    let market = await this.marketRepository.findByName(name);
    if (market) return market;

    const location = await this.geocoderService.geocode(
      name,
      scraper.geocodeSuffix,
      address,
    );

    if (!location) {
      console.warn(
        `[ScraperService] ⚠️  Skipping market "${name}" — no coordinates available.`,
      );
      return null;
    }

    return this.marketRepository.create({
      name,
      location,
      vendor: vendorDoc._id,
    });
  }

  async #scrapeAndSaveStore(marketData, scraper, browser) {
    const { name, pricelistUrl, marketDoc } = marketData;
    const tabStartTime = performance.now();
    const page = await browser.newPage();
    await this.#optimizePage(page);

    try {
      const result = await scraper.fetchProducts(
        page,
        pricelistUrl,
        marketDoc.lastScrapedUpdate,
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

      const marketProducts = rawProducts
        .filter(({ title }) => productIdMap.has(title))
        .map(({ title, price }) => ({
          market: marketDoc._id,
          product: productIdMap.get(title),
          price,
        }));

      await this.marketProductRepository.bulkUpsert(marketProducts);

      if (result.newUpdateString) {
        marketDoc.lastScrapedUpdate = result.newUpdateString;
        await this.marketRepository.save(marketDoc);
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
