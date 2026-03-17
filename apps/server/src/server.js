import "dotenv/config";
import app from "./app.js";
import connectDB from "./infrastructure/database/connectDB.js";
import mongoose from "mongoose";
import { startScraperCron } from "./modules/scraper/scraper.cron.js";
import { scraperService } from "./container.js";

const PORT = process.env.PORT || 5000;

connectDB();

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  startScraperCron(scraperService);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
