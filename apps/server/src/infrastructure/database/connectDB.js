import mongoose from "mongoose";
import { seedAdminUser } from "./seed.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    await seedAdminUser();
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
