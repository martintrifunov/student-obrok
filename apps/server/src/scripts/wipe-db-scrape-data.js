import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../../.env") });

async function wipe() {
  const uri = process.env.MONGO_URI_LOCAL ?? process.env.MONGO_URI;
  if (!uri) throw new Error("No Mongo URI found");

  console.log("Connecting to database...");
  await mongoose.connect(uri);

  console.log("Wiping collections...");
  await mongoose.connection.db.collection("chains").deleteMany({});
  await mongoose.connection.db.collection("markets").deleteMany({});
  await mongoose.connection.db.collection("marketproducts").deleteMany({});

  await mongoose.connection.db
    .collection("products")
    .drop()
    .catch(() => console.log("Products collection already empty or missing."));

  console.log("✅ Database wiped cleanly!");
  await mongoose.disconnect();
}

wipe().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
