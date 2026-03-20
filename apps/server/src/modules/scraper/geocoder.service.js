import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { normalizeMarketName } from "./normalize-market-name.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const COORDS_PATH = resolve(__dirname, "../../data/market-coordinates.json");

const CYR_TO_LAT = {
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Ѓ: "Gj",
  Е: "E",
  Ж: "Zh",
  З: "Z",
  Ѕ: "Dz",
  И: "I",
  Ј: "J",
  К: "K",
  Л: "L",
  Љ: "Lj",
  М: "M",
  Н: "N",
  Њ: "Nj",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  Ќ: "Kj",
  У: "U",
  Ф: "F",
  Х: "H",
  Ц: "C",
  Ч: "Ch",
  Џ: "Dzh",
  Ш: "Sh",
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  ѓ: "gj",
  е: "e",
  ж: "zh",
  з: "z",
  ѕ: "dz",
  и: "i",
  ј: "j",
  к: "k",
  л: "l",
  љ: "lj",
  м: "m",
  н: "n",
  њ: "nj",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  ќ: "kj",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  џ: "dzh",
  ш: "sh",
};

function transliterate(text) {
  return (
    text
      ?.split("")
      .map((ch) => CYR_TO_LAT[ch] ?? ch)
      .join("") || ""
  );
}

export class GeocoderService {
  #staticCoords;

  constructor() {
    try {
      this.#staticCoords = JSON.parse(readFileSync(COORDS_PATH, "utf-8"));
      console.log(
        `[GeocoderService] Loaded ${Object.keys(this.#staticCoords).length} static coordinates.`,
      );
    } catch {
      this.#staticCoords = {};
      console.warn(
        "[GeocoderService] No market-coordinates.json found — static lookup disabled.",
      );
    }
  }

  async geocode(storeName, suffix, address) {
    // --- Tier 1: Static JSON lookup ---
    const key = normalizeMarketName(storeName);
    if (this.#staticCoords[key]) {
      console.log(`[GeocoderService] ✅ Static lookup hit for "${key}".`);
      return this.#staticCoords[key];
    }

    // --- Tier 2: Nominatim fallback ---
    console.log(
      `[GeocoderService] Static miss for "${key}", trying Nominatim...`,
    );

    const city = this.#getCity(address) || "";

    const cleanAddress = address
      ?.replace(/(Бул\.|Ул\.|ул\.|бул\.|бр\.|бр)/gi, "")
      .split("–")[0]
      .trim();

    const queries = [
      `${cleanAddress}, ${city}, ${suffix}`,
      `${storeName}, ${city}, ${suffix}`,
      `${transliterate(cleanAddress)}, ${transliterate(city)}, North Macedonia`,
      `${city}, ${suffix}`,
    ].filter((q) => q.length > 10);

    for (const q of queries) {
      console.log(`[GeocoderService] Querying: "${q}"`);
      const result = await this.#search(q);

      if (result) {
        console.log(`[GeocoderService] ✅ Found match via: "${q}"`);
        return [result.lat, result.lon];
      }
      await this.#sleep(1100);
    }

    // --- No jitter — return null so the caller can handle failure explicitly ---
    console.warn(
      `[GeocoderService] ❌ All queries failed for "${key}". ` +
        "Add coordinates manually to market-coordinates.json.",
    );
    return null;
  }

  #getCity(address) {
    if (!address) return null;
    const cities = [
      "Скопје",
      "Битола",
      "Тетово",
      "Куманово",
      "Гевгелија",
      "Велес",
      "Штип",
      "Струга",
      "Охрид",
      "Прилеп",
      "Кавадарци",
      "Кичево",
      "Гостивар",
      "Струмица",
      "Кочани",
      "Неготино",
      "Виница",
      "Берово",
      "Свети Николе",
      "Демир Хисар",
      "Радовиш",
      "Пробиштип",
      "Делчево",
      "Крива Паланка",
      "Дебар",
      "Ресен",
      "Валандово",
    ];
    return cities.find((c) => address.includes(c)) || null;
  }

  async #search(query) {
    try {
      const url = new URL(NOMINATIM_URL);
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "mk"); // Lock to Macedonia

      const response = await fetch(url.toString(), {
        headers: { "User-Agent": "StudentObrok/1.0" },
      });

      const results = await response.json();
      return results.length > 0
        ? { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) }
        : null;
    } catch {
      return null;
    }
  }

  #sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
