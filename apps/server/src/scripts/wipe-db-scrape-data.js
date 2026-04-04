import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../../.env") });

const COLLECTIONS_TO_WIPE = [
  "chains",
  "markets",
  "market_products",
  "products",
  "product_embeddings",
];

async function wipeCollection(db, collectionName) {
  const result = await db.collection(collectionName).deleteMany({});
  console.log(`- ${collectionName}: deleted ${result.deletedCount}`);
}

async function wipe() {
  const uri = process.env.MONGO_URI_LOCAL ?? process.env.MONGO_URI;
  if (!uri) throw new Error("No Mongo URI found");

  console.log("Connecting to database...");
  await mongoose.connect(uri);

  try {
    console.log("Wiping collections...");
    const db = mongoose.connection.db;

    for (const collectionName of COLLECTIONS_TO_WIPE) {
      await wipeCollection(db, collectionName);
    }

    console.log("✅ Database wiped cleanly!");
  } finally {
    await mongoose.disconnect();
  }
}

wipe().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
