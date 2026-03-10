import "dotenv/config";
import app from "./app.js";
import connectDB from "./infrastructure/database/connectDB.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

connectDB();

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
