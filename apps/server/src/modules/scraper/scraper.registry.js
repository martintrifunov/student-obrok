import { VeroScraper } from "./markets/vero.scraper.js";
import { RamstoreScraper } from "./markets/ramstore.scraper.js";
import { StokomakScraper } from "./markets/stokomak.scraper.js";
import { KamScraper } from "./markets/kam.scraper.js";

const SCRAPER_REGISTRY = {
  vero: {
    create: () => new VeroScraper(),
    populateStrategy: "geocode",
  },
  ramstore: {
    create: () => new RamstoreScraper(),
    populateStrategy: "geocode",
  },
  stokomak: {
    create: () => new StokomakScraper(),
    populateStrategy: "places",
  },
  kam: {
    create: () => new KamScraper(),
    populateStrategy: "geocode",
  },
};

export const SCRAPER_KEYS = Object.keys(SCRAPER_REGISTRY);

export function createScraper(key) {
  if (!key) return null;
  const entry = SCRAPER_REGISTRY[key.toLowerCase()];
  return entry ? entry.create() : null;
}

export function createAllScrapers() {
  return SCRAPER_KEYS.map((key) => SCRAPER_REGISTRY[key].create());
}

export function getScraperPopulateStrategy(key) {
  if (!key) return null;
  return SCRAPER_REGISTRY[key.toLowerCase()]?.populateStrategy ?? null;
}
