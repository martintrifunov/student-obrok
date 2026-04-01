import "dotenv/config";
import app from "./app.js";
import connectDB from "./infrastructure/database/connectDB.js";
import mongoose from "mongoose";
import { startScraperCron } from "./modules/scraper/scraper.cron.js";
import { seedChainImages } from "./infrastructure/database/seed-chain-images.js";
import { seedFeatureFlags } from "./infrastructure/database/seed-feature-flags.js";
import { scraperService } from "./container.js";

const PORT = process.env.PORT || 5000;

connectDB();

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB");
  await seedChainImages();
  await seedFeatureFlags();
  startScraperCron(scraperService);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
