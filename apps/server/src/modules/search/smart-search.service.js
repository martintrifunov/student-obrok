import { haversineDistance } from "../../shared/utils/haversine.js";
import { MarketModel } from "../market/market.model.js";

export class SmartSearchService {
  constructor(intentParserService, searchService, featureFlagService) {
    this.intentParserService = intentParserService;
    this.searchService = searchService;
    this.featureFlagService = featureFlagService;
  }

  async search({ q, lat, lon }) {
    const isEnabled = await this.featureFlagService.isEnabled("smart-search");
    if (!isEnabled) {
      return { data: null, error: "Smart search is not enabled." };
    }

    if (!this.intentParserService.isAvailable()) {
      return { data: null, error: "AI service is not configured." };
    }

    const intent = await this.intentParserService.parseIntent(q);

    // For simple search intents, fall back to the regular search
    if (intent.intent !== "recipe" || intent.products.length === 0) {
      return { data: null, redirect: true, intent };
    }

    // Search for each product in parallel
    const productSearches = await Promise.all(
      intent.products.map(async (productName) => {
        const result = await this.searchService.search({
          q: productName,
          page: 1,
          limit: 20,
        });
        return { name: productName, results: result.data };
      }),
    );

    // Build a shopping list with match status
    const shoppingList = productSearches.map((ps) => ({
      name: ps.name,
      found: ps.results.length > 0,
    }));

    // Collect all markets that carry at least one product
    // Structure: Map<marketId, { market, products: Map<productName, { product, price }> }>
    const marketMap = new Map();

    for (const ps of productSearches) {
      for (const result of ps.results) {
        for (const mp of result.marketProducts) {
          if (!mp.market?._id) continue;
          const mid = mp.market._id.toString();

          if (!marketMap.has(mid)) {
            marketMap.set(mid, {
              market: mp.market,
              products: new Map(),
            });
          }

          const entry = marketMap.get(mid);
          const existing = entry.products.get(ps.name);

          // Keep the cheapest option per product per market
          if (!existing || mp.price < existing.price) {
            entry.products.set(ps.name, {
              product: result.product,
              price: mp.price,
            });
          }
        }
      }
    }

    const hasUserLocation =
      lat !== undefined && lat !== null && lon !== undefined && lon !== null;

    // Score and rank markets
    const rankedMarkets = Array.from(marketMap.values()).map((entry) => {
      const matchCount = entry.products.size;
      const totalProducts = intent.products.length;
      const complete = matchCount === totalProducts;

      let totalPrice = 0;
      const productDetails = [];
      for (const [name, info] of entry.products) {
        totalPrice += info.price;
        productDetails.push({
          name,
          title: info.product?.title || name,
          price: info.price,
          image: info.product?.image || null,
        });
      }

      let distance = null;
      if (hasUserLocation && entry.market.location?.length === 2) {
        const [mLat, mLon] = entry.market.location;
        distance = Math.round(haversineDistance(lat, lon, mLat, mLon));
      }

      return {
        market: entry.market,
        matchCount,
        totalProducts,
        complete,
        totalPrice: Math.round(totalPrice),
        distance,
        products: productDetails,
      };
    });

    // Sort: complete first → distance ascending → total price ascending
    rankedMarkets.sort((a, b) => {
      if (a.complete !== b.complete) return a.complete ? -1 : 1;
      if (a.matchCount !== b.matchCount) return b.matchCount - a.matchCount;
      if (a.distance !== null && b.distance !== null) {
        if (a.distance !== b.distance) return a.distance - b.distance;
      }
      return a.totalPrice - b.totalPrice;
    });

    // Find the nearest complete-match market for routing suggestion
    const nearestComplete =
      hasUserLocation &&
      rankedMarkets.find((m) => m.complete && m.distance !== null);

    return {
      data: {
        shoppingList,
        markets: rankedMarkets.slice(0, 20),
        nearestMarket: nearestComplete || null,
        query: q,
        priceSort: intent.priceSort || "asc",
      },
    };
  }
}
