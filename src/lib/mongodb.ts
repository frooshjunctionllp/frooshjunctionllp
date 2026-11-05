import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure SRV DNS resolution succeeds across Windows and cloud runtimes
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore in restricted environments
}

const dbName = process.env.MONGODB_DB || "frooshjunction";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Please configure it in .env.local or production environment."
    );
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
