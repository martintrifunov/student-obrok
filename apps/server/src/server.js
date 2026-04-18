import "dotenv/config";
import app from "./app.js";
import connectDB from "./infrastructure/database/connectDB.js";
import mongoose from "mongoose";
import { startScraperCron } from "./modules/scraper/scraper.cron.js";
import { startAnalyticsCron } from "./modules/analytics/analytics.cron.js";
import { seedChainImages } from "./infrastructure/database/seed-chain-images.js";
import { seedFeatureFlags } from "./infrastructure/database/seed-feature-flags.js";
import { scraperService, analyticsService, embeddingService, productEmbeddingRepository, productRepository, featureFlagService } from "./container.js";

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

connectDB();

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB");
  await seedChainImages();
  await seedFeatureFlags();
  startScraperCron(scraperService, embeddingService, productEmbeddingRepository, productRepository, featureFlagService);
  startAnalyticsCron(analyticsService);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
