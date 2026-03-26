import cron from "node-cron";
import { VeroScraper } from "./markets/vero.scraper.js";
import { RamstoreScraper } from "./markets/ramstore.scraper.js";
import { StokomakScraper } from "./markets/stokomak.scraper.js";
import { KamScraper } from "./markets/kam.scraper.js";

/**
 * All registered market scrapers.
 */
const SCRAPERS = [
  new VeroScraper(),
  new RamstoreScraper(),
  new StokomakScraper(),
  new KamScraper(),
];

/**
 * Initialises the scraper cron job.
 * Schedule: 03:00 on Monday and Thursday (twice a week).
 *
 * @param {import('./scraper.service.js').ScraperService} scraperService
 */
export function startScraperCron(scraperService) {
  cron.schedule("0 3 * * 1,4", async () => {
    console.log("[ScraperCron] Starting scheduled scrape run...");

    for (const scraper of SCRAPERS) {
      try {
        await scraperService.runForMarket(scraper);
      } catch (err) {
        console.error(
          `[ScraperCron] Fatal error for ${scraper.constructor.name}:`,
          err.message,
        );
      }
    }

    console.log("[ScraperCron] All markets done.");
  });

  console.log(
    "[ScraperCron] Scheduled — runs at 03:00 every Monday and Thursday.",
  );
}
