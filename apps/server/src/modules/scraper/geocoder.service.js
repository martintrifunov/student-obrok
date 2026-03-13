// Nominatim (OpenStreetMap)
// Rate limit: max 1 request/second. The ScraperService awaits each
// vendor sequentially so this is naturally respected.

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_COORDS = [41.9981, 21.4254]; // Skopje city centre fallback

export class GeocoderService {
  /**
   * Geocodes a store name using Nominatim.
   * Returns [lat, lng] or the default Skopje fallback if not found.
   *
   * @param {string} storeName - e.g. "ВЕРО 01"
   * @param {string} suffix    - e.g. "Скопје, Македонија"
   * @returns {Promise<[number, number]>}
   */
  async geocode(storeName, suffix) {
    const query = `${storeName} ${suffix}`;

    try {
      const url = new URL(NOMINATIM_URL);
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "StudentObrok/1.0 (student-meal-locator)",
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim responded with ${response.status}`);
      }

      const results = await response.json();

      if (!results.length) {
        console.warn(
          `[GeocoderService] No result for "${query}". Using Skopje fallback.`,
        );
        return DEFAULT_COORDS;
      }

      const { lat, lon } = results[0];
      return [parseFloat(lat), parseFloat(lon)];
    } catch (err) {
      console.error(
        `[GeocoderService] Geocoding failed for "${query}":`,
        err.message,
      );
      return DEFAULT_COORDS;
    }
  }
}
