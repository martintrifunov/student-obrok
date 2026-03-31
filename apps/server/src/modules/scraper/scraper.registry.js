import { VeroScraper } from "./markets/vero.scraper.js";
import { RamstoreScraper } from "./markets/ramstore.scraper.js";
import { StokomakScraper } from "./markets/stokomak.scraper.js";
import { KamScraper } from "./markets/kam.scraper.js";

const SCRAPER_REGISTRY = {
  vero: { create: () => new VeroScraper() },
  ramstore: { create: () => new RamstoreScraper() },
  stokomak: { create: () => new StokomakScraper() },
  kam: { create: () => new KamScraper() },
};

export const SCRAPER_KEYS = Object.keys(SCRAPER_REGISTRY);

export const createScraper = (key) => {
  if (!key) return null;
  const entry = SCRAPER_REGISTRY[key.toLowerCase()];
  return entry ? entry.create() : null;
};

export const createAllScrapers = () =>
  SCRAPER_KEYS.map((key) => SCRAPER_REGISTRY[key].create());
