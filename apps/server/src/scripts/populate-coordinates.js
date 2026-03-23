/**
 * One-time script to populate market-coordinates.json using Google APIs.
 *
 * Usage:
 *   GOOGLE_MAPS_API_KEY=<key> node src/scripts/populate-coordinates.js [--force] [chain]
 *
 * Strategy per chain:
 *   - Vero / Ramstore: Geocoding API with transliterated street addresses → exact coords.
 *   - Stokomak: Places Text Search API grouped by city → distinct POI coords per branch.
 *
 * Use --force to re-geocode all entries (overwrites existing coordinates).
 * Post-processing spreads any remaining duplicate coordinates via small jitter (~30m).
 */
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../../.env") });

import { VeroScraper } from "../modules/scraper/markets/vero.scraper.js";
import { RamstoreScraper } from "../modules/scraper/markets/ramstore.scraper.js";
import { StokomakScraper } from "../modules/scraper/markets/stokomak.scraper.js";
import { normalizeMarketName } from "../modules/scraper/normalize-market-name.js";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const COORDS_PATH = path.resolve(__dirname, "../data/market-coordinates.json");

// Macedonian Cyrillic → Latin transliteration (multi-char digraphs first)
const CYR_TO_LAT = [
  ["Љ", "Lj"],
  ["Њ", "Nj"],
  ["Џ", "Dzh"],
  ["Ѓ", "Gj"],
  ["Ќ", "Kj"],
  ["Ѕ", "Dz"],
  ["Ж", "Zh"],
  ["Ч", "Ch"],
  ["Ш", "Sh"],
  ["љ", "lj"],
  ["њ", "nj"],
  ["џ", "dzh"],
  ["ѓ", "gj"],
  ["ќ", "kj"],
  ["ѕ", "dz"],
  ["ж", "zh"],
  ["ч", "ch"],
  ["ш", "sh"],
  ["А", "A"],
  ["Б", "B"],
  ["В", "V"],
  ["Г", "G"],
  ["Д", "D"],
  ["Е", "E"],
  ["З", "Z"],
  ["И", "I"],
  ["Ј", "J"],
  ["К", "K"],
  ["Л", "L"],
  ["М", "M"],
  ["Н", "N"],
  ["О", "O"],
  ["П", "P"],
  ["Р", "R"],
  ["С", "S"],
  ["Т", "T"],
  ["У", "U"],
  ["Ф", "F"],
  ["Х", "H"],
  ["Ц", "C"],
  ["а", "a"],
  ["б", "b"],
  ["в", "v"],
  ["г", "g"],
  ["д", "d"],
  ["е", "e"],
  ["з", "z"],
  ["и", "i"],
  ["ј", "j"],
  ["к", "k"],
  ["л", "l"],
  ["м", "m"],
  ["н", "n"],
  ["о", "o"],
  ["п", "p"],
  ["р", "r"],
  ["с", "s"],
  ["т", "t"],
  ["у", "u"],
  ["ф", "f"],
  ["х", "h"],
  ["ц", "c"],
];

function transliterate(text) {
  let result = text;
  result = result.replace(/Бул\./g, "Bulevar").replace(/бул\./g, "bulevar");
  result = result.replace(/Ул\./g, "Ulica").replace(/ул\./g, "ulica");
  result = result.replace(/бр\.\s*/g, "");
  for (const [cyr, lat] of CYR_TO_LAT) {
    result = result.replaceAll(cyr, lat);
  }
  return result;
}

// Chains with real street addresses use Geocoding API.
// Chains with neighborhood-only addresses use Places Text Search API.
const ALL_SCRAPERS = {
  vero: { scraper: new VeroScraper(), strategy: "geocode" },
  ramstore: { scraper: new RamstoreScraper(), strategy: "geocode" },
  stokomak: { scraper: new StokomakScraper(), strategy: "places" },
};

function loadCoords() {
  try {
    return JSON.parse(fs.readFileSync(COORDS_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveCoords(coords) {
  fs.writeFileSync(
    COORDS_PATH,
    JSON.stringify(coords, null, 2) + "\n",
    "utf-8",
  );
}

async function googleGeocode(query) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("region", "mk");
  url.searchParams.set("key", GOOGLE_API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status === "OK" && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return [lat, lng];
  }
  return null;
}

async function placesTextSearch(query, maxResults = 20) {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.location,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: maxResults }),
  });
  const data = await res.json();
  return (data.places || []).map((p) => ({
    coords: [p.location.latitude, p.location.longitude],
    name: p.displayName?.text || "",
    address: p.formattedAddress || "",
  }));
}

async function main() {
  if (!GOOGLE_API_KEY) {
    console.error(
      "[populate] GOOGLE_MAPS_API_KEY env var is required.\n" +
        "  Usage: GOOGLE_MAPS_API_KEY=<key> node src/scripts/populate-coordinates.js [chain]",
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const target = args.find((a) => a !== "--force")?.toLowerCase();
  if (target && !ALL_SCRAPERS[target]) {
    console.error(
      `[populate] Unknown chain "${target}". Available: ${Object.keys(ALL_SCRAPERS).join(", ")}`,
    );
    process.exit(1);
  }

  const entries = target
    ? [[target, ALL_SCRAPERS[target]]]
    : Object.entries(ALL_SCRAPERS);

  const coords = loadCoords();
  const successes = [];
  const failures = [];
  const skipped = [];

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const [chainKey, { scraper, strategy }] of entries) {
      console.log(
        `\n[populate] Fetching markets for ${chainKey} (${strategy})...`,
      );
      const page = await browser.newPage();

      let markets;
      try {
        markets = await scraper.fetchMarkets(page);
      } catch (err) {
        console.error(
          `[populate] Failed to fetch markets for ${chainKey}:`,
          err.message,
        );
        await page.close();
        continue;
      }
      await page.close();

      console.log(
        `[populate] Found ${markets.length} markets for ${chainKey}.`,
      );

      if (strategy === "places") {
        // ---- Places API strategy: group by city, fetch all POIs, assign unique coords ----
        // Group markets by base name (strip trailing numbers) to identify cities
        const byCity = {};
        for (const m of markets) {
          const key = normalizeMarketName(m.name);
          const base = key
            .replace(/^[^\s]+\s/, "")
            .replace(/\s*\d+$/, "")
            .trim();
          (byCity[base] ??= []).push({ key, market: m });
        }

        for (const [city, group] of Object.entries(byCity)) {
          const needCount = force
            ? group.length
            : group.filter((g) => !coords[g.key]).length;
          if (needCount === 0) {
            group.forEach((g) => skipped.push(g.key));
            continue;
          }

          const query = `${scraper.chainName} supermarket, ${transliterate(city)}, North Macedonia`;
          console.log(
            `[populate] Places search for "${city}" (${group.length} markets) → "${query}"`,
          );

          const places = await placesTextSearch(query);
          console.log(`  Found ${places.length} POIs on Google Places.`);

          // Collect already-used coords to avoid reassigning them
          const usedCoords = new Set();
          if (!force) {
            for (const g of group) {
              if (coords[g.key])
                usedCoords.add(
                  coords[g.key][0].toFixed(7) +
                    "," +
                    coords[g.key][1].toFixed(7),
                );
            }
          }

          // Filter places to only unused coordinates
          const availablePlaces = places.filter(
            (p) =>
              !usedCoords.has(
                p.coords[0].toFixed(7) + "," + p.coords[1].toFixed(7),
              ),
          );

          let placeIdx = 0;
          for (const { key, market } of group) {
            if (coords[key] && !force) {
              skipped.push(key);
              continue;
            }

            if (placeIdx < availablePlaces.length) {
              coords[key] = availablePlaces[placeIdx].coords;
              console.log(
                `  ✅ ${key} → ${availablePlaces[placeIdx].name} [${coords[key]}]`,
              );
              placeIdx++;
            } else {
              // More markets than POIs — use the first POI as a fallback (jitter will spread later)
              const fallback = places[0]?.coords ?? null;
              if (fallback) {
                coords[key] = fallback;
                console.log(
                  `  ⚠️  ${key} → fallback (will jitter) [${coords[key]}]`,
                );
              } else {
                failures.push({ key, query });
                console.log(`  ❌ ${key}: No Places results at all`);
                continue;
              }
            }

            saveCoords(coords);
            successes.push(key);
          }

          await new Promise((r) => setTimeout(r, 300));
        }
      } else {
        // ---- Geocoding API strategy: transliterated street addresses ----
        for (const m of markets) {
          const key = normalizeMarketName(m.name);

          if (coords[key] && !force) {
            skipped.push(key);
            continue;
          }

          const addr = m.address || m.name;
          const isStreetAddress = /[Уу]л[\.\s]|[Бб]ул[\.\s]/u.test(addr);
          const query = isStreetAddress
            ? `${transliterate(addr)}, North Macedonia`
            : `${scraper.chainName} ${transliterate(addr)}, North Macedonia`;
          console.log(`[populate] Geocoding "${key}" → "${query}"`);

          const result = await googleGeocode(query);

          if (result) {
            coords[key] = result;
            saveCoords(coords);
            successes.push(key);
            console.log(`  ✅ ${key}: [${result[0]}, ${result[1]}]`);
          } else {
            failures.push({ key, query });
            console.log(`  ❌ ${key}: No result`);
          }

          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }
  } finally {
    await browser.close();
  }

  // Post-process: spread markets sharing identical coordinates in a small circle
  // ~30m radius so markers don't stack but stay in the same neighborhood.
  const JITTER_RADIUS = 0.0003; // ~30m in degrees
  const byCoord = {};
  for (const [key, val] of Object.entries(coords)) {
    const ck = val[0].toFixed(7) + "," + val[1].toFixed(7);
    (byCoord[ck] ??= []).push(key);
  }
  let jittered = 0;
  for (const group of Object.values(byCoord)) {
    if (group.length < 2) continue;
    const [baseLat, baseLng] = coords[group[0]];
    for (let i = 0; i < group.length; i++) {
      const angle = (2 * Math.PI * i) / group.length;
      coords[group[i]] = [
        +(baseLat + JITTER_RADIUS * Math.cos(angle)).toFixed(7),
        +(baseLng + JITTER_RADIUS * Math.sin(angle)).toFixed(7),
      ];
      jittered++;
    }
  }
  if (jittered > 0) {
    saveCoords(coords);
    console.log(
      `\n[populate] Jittered ${jittered} markets sharing duplicate coordinates.`,
    );
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("[populate] DONE");
  console.log(`  ✅ Geocoded: ${successes.length}`);
  console.log(
    `  ⏭  Skipped (already in JSON): ${skipped.length}${force ? " (--force: 0 skipped)" : ""}`,
  );
  console.log(`  ❌ Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.log("\nFailed markets (add manually to market-coordinates.json):");
    for (const f of failures) {
      console.log(`  "${f.key}": [LAT, LON],  // query was: "${f.query}"`);
    }
  }

  console.log(`\nCoordinates file: ${COORDS_PATH}`);
  console.log(`Total entries: ${Object.keys(coords).length}`);
}

main().catch((err) => {
  console.error("[populate] Fatal error:", err);
  process.exit(1);
});
