const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_COORDS = [41.9981, 21.4254];

// Mapping for clean transliteration
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
  async geocode(storeName, suffix, address) {
    const city = this.#getCity(address) || "";

    // Clean the address: Remove "Бул.", "Ул.", "бр." etc.
    const cleanAddress = address
      ?.replace(/(Бул\.|Ул\.|ул\.|бул\.|бр\.|бр)/gi, "")
      .split("–")[0] // Remove neighborhood hints after the dash
      .trim();

    // Strategy: Try 4 levels of queries
    const queries = [
      `${cleanAddress}, ${city}, ${suffix}`, // 1. Specific Street + City
      `${storeName}, ${city}, ${suffix}`, // 2. Store Name + City
      `${transliterate(cleanAddress)}, ${transliterate(city)}, North Macedonia`, // 3. Latin Street
      `${city}, ${suffix}`, // 4. City Fallback
    ].filter((q) => q.length > 10); // Ignore empty/short queries

    for (const q of queries) {
      console.log(`[GeocoderService] Querying: "${q}"`);
      const result = await this.#search(q);

      if (result) {
        console.log(`[GeocoderService] ✅ Found match via: "${q}"`);
        return [result.lat, result.lon];
      }
      await this.#sleep(1100);
    }

    // Generic Jitter Fallback
    const jitterLat = (Math.random() - 0.5) * 0.01;
    const jitterLon = (Math.random() - 0.5) * 0.01;
    console.warn(
      `[GeocoderService] ❌ All queries failed for ${storeName}. Using jitter.`,
    );
    return [DEFAULT_COORDS[0] + jitterLat, DEFAULT_COORDS[1] + jitterLon];
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
