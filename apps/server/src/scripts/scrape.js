import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import { VendorRepository } from "../modules/vendor/vendor.repository.js";
import { ProductRepository } from "../modules/product/product.repository.js";
import { ImageRepository } from "../modules/image/image.repository.js";
import { GeocoderService } from "../modules/scraper/geocoder.service.js";
import { ScraperService } from "../modules/scraper/scraper.service.js";
import { VeroScraper } from "../modules/scraper/markets/vero.scraper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../../.env") });

const ALL_SCRAPERS = {
  vero: new VeroScraper(),
};

async function main() {
  const target = process.argv[2]?.toLowerCase();

  if (target && !ALL_SCRAPERS[target]) {
    console.error(
      `[scrape] Unknown market "${target}". ` +
        `Available: ${Object.keys(ALL_SCRAPERS).join(", ")}`,
    );
    process.exit(1);
  }

  const scrapers = target
    ? [ALL_SCRAPERS[target]]
    : Object.values(ALL_SCRAPERS);

  const uri = process.env.MONGO_URI_LOCAL ?? process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "[scrape] No MongoDB URI found. " +
        "Set MONGO_URI_LOCAL or MONGO_URI in your .env file.",
    );
    process.exit(1);
  }

  console.log(
    `[scrape] Connecting to MongoDB via ${
      process.env.MONGO_URI_LOCAL ? "MONGO_URI_LOCAL" : "MONGO_URI"
    }...`,
  );

  await mongoose.connect(uri);
  console.log("[scrape] DB connected.\n");

  const scraperService = new ScraperService(
    new VendorRepository(),
    new ProductRepository(),
    new ImageRepository(),
    new GeocoderService(),
  );

  for (const scraper of scrapers) {
    await scraperService.runForMarket(scraper);
  }

  await mongoose.disconnect();
  console.log("\n[scrape] Done. DB disconnected.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[scrape] Fatal error:", err);
  mongoose.disconnect();
  process.exit(1);
});
