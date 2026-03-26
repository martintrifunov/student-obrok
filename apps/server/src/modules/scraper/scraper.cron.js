import cron from "node-cron";
import { createAllScrapers } from "./scraper.registry.js";

/**
 * Initialises the scraper cron job.
 * Schedule: 03:00 on Monday and Thursday (twice a week).
 *
 * @param {import('./scraper.service.js').ScraperService} scraperService
 */
export function startScraperCron(scraperService) {
  cron.schedule("0 3 * * 1,4", async () => {
    console.log("[ScraperCron] Starting scheduled scrape run...");

    const scrapers = createAllScrapers();

    for (const scraper of scrapers) {
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
