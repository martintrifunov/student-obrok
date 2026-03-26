import { VeroScraper } from "./markets/vero.scraper.js";
import { RamstoreScraper } from "./markets/ramstore.scraper.js";
import { StokomakScraper } from "./markets/stokomak.scraper.js";
import { KamScraper } from "./markets/kam.scraper.js";

const SCRAPER_FACTORIES = {
  vero: () => new VeroScraper(),
  ramstore: () => new RamstoreScraper(),
  stokomak: () => new StokomakScraper(),
  kam: () => new KamScraper(),
};

export const SCRAPER_KEYS = Object.keys(SCRAPER_FACTORIES);

export function createScraper(key) {
  if (!key) return null;
  const factory = SCRAPER_FACTORIES[key.toLowerCase()];
  return factory ? factory() : null;
}

export function createAllScrapers() {
  return SCRAPER_KEYS.map((key) => SCRAPER_FACTORIES[key]());
}
