const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_COORDS = [41.9981, 21.4254];

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
  return text
    .split("")
    .map((ch) => CYR_TO_LAT[ch] ?? ch)
    .join("");
}

const CITY_HINTS = {
  аеродром: "Skopje",
  карпош: "Skopje",
  центар: "Skopje",
  чаир: "Skopje",
  "кисела вода": "Skopje",
  тетово: "Tetovo",
  битола: "Bitola",
  куманово: "Kumanovo",
  гевгелија: "Gevgelija",
  богородица: "Gevgelija",
};

function extractCity(address) {
  const lower = address.toLowerCase();
  for (const [hint, city] of Object.entries(CITY_HINTS)) {
    if (lower.includes(hint)) return city;
  }
  return null;
}

export class GeocoderService {
  /**
   * Geocodes a store using Nominatim with multiple fallback strategies.
   *
   * @param {string} storeName - e.g. "ВЕРО 1"
   * @param {string} suffix    - e.g. "Македонија"
   * @param {string} [address] - e.g. "Бул. Јане Сандански бр.111, Аеродром"
   * @returns {Promise<[number, number]>}
   */
  async geocode(storeName, suffix, address) {
    const city = extractCity(address || "") || "Skopje";
    const latinName = transliterate(storeName);
    const latinAddress = address ? transliterate(address) : "";

    // Try multiple query strategies in order of precision
    const queries = [
      // 1. Full Latin address + country
      latinAddress && `${latinAddress}, ${city}, North Macedonia`,
      // 2. Store name + city (e.g. "Vero 1 Skopje")
      `${latinName} ${city} North Macedonia`,
      // 3. Just "Vero supermarket" + city
      `Vero supermarket ${city} North Macedonia`,
    ].filter(Boolean);

    for (const query of queries) {
      const result = await this.#search(query);
      if (result) {
        console.log(
          `[GeocoderService] Found "${storeName}" via query: "${query}"`,
        );
        return result;
      }
      // Nominatim rate limit — 1 req/sec
      await this.#sleep(1100);
    }

    console.warn(
      `[GeocoderService] All queries failed for "${storeName}". Using fallback.`,
    );
    return DEFAULT_COORDS;
  }

  async #search(query) {
    try {
      const url = new URL(NOMINATIM_URL);
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "mk");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "StudentObrok/1.0 (student-meal-locator)",
        },
      });

      if (!response.ok) return null;

      const results = await response.json();
      if (!results.length) return null;

      const { lat, lon } = results[0];
      return [parseFloat(lat), parseFloat(lon)];
    } catch (err) {
      console.error(
        `[GeocoderService] Search error for "${query}":`,
        err.message,
      );
      return null;
    }
  }

  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
