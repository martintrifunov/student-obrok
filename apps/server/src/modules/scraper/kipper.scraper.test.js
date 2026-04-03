import { beforeEach, describe, expect, it, vi } from "vitest";
import { KipperScraper } from "./markets/kipper.scraper.js";

describe("KipperScraper", () => {
  let scraper;

  beforeEach(() => {
    scraper = new KipperScraper();
  });

  it("returns correct chain metadata", () => {
    expect(scraper.chainName).toBe("Kipper");
    expect(scraper.chainImageKey).toBe("kipper");
    expect(scraper.geocodeSuffix).toBe("Македонија");
  });

  it("collects market details from market pages", async () => {
    const goto = vi.fn().mockResolvedValue(undefined);
    const waitForFunction = vi.fn().mockResolvedValue(undefined);
    const evaluate = vi.fn()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce([
        "https://kipper.mk/mk/kipper-163-tetove/",
        "https://kipper.mk/mk/kipper-162-sveti-nikole/",
      ])
      .mockResolvedValueOnce({
        name: "Киппер 163 - Тетово",
        address: "Киро Ристоски бр.1 Тетово, Тетово",
      })
      .mockResolvedValueOnce({
        name: "Киппер 162 - Свети Николе",
        address: "Маршал Тито бр.5, Свети Николе",
      });

    const page = { goto, waitForFunction, evaluate };

    const markets = await scraper.fetchMarkets(page);

    expect(markets).toEqual([
      {
        name: "Киппер 163 - Тетово",
        address: "Киро Ристоски бр.1 Тетово, Тетово",
        pricelistUrl: "https://kipper.mk/mk/kipper-163-tetove/",
      },
      {
        name: "Киппер 162 - Свети Николе",
        address: "Маршал Тито бр.5, Свети Николе",
        pricelistUrl: "https://kipper.mk/mk/kipper-162-sveti-nikole/",
      },
    ]);
  });

  it("returns upToDate when the detail page update date matches", async () => {
    const page = {
      goto: vi.fn().mockResolvedValue(undefined),
      waitForFunction: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValueOnce("03.04.2026 06:08"),
    };

    const result = await scraper.fetchProducts(
      page,
      "https://kipper.mk/mk/kipper-163-tetove/",
      new Date(2026, 3, 3, 6, 8),
    );

    expect(result).toEqual({ upToDate: true });
  });

  it("keeps available products including high-priced ones", async () => {
    const page = {
      goto: vi.fn().mockResolvedValue(undefined),
      waitForFunction: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn()
        .mockResolvedValueOnce("03.04.2026 06:08")
        .mockResolvedValueOnce([
          { title: "STANDARD", price: 120, category: "Општо" },
          { title: "PREMIUM", price: 1599, category: "Специјално" },
          { title: "PREMIUM", price: 1699, category: "Специјално" },
        ]),
    };

    const result = await scraper.fetchProducts(
      page,
      "https://kipper.mk/mk/kipper-163-tetove/",
      null,
    );

    expect(result.upToDate).toBe(false);
    expect(result.products).toEqual([
      { title: "STANDARD", price: 120, category: "Општо" },
      { title: "PREMIUM", price: 1699, category: "Специјално" },
    ]);
    expect(result.newUpdateDate).toEqual(new Date(2026, 3, 3, 6, 8));
  });
});