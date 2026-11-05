import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure SRV DNS resolution succeeds across Windows and cloud runtimes
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore in restricted environments
}

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://frooshjunctionllp_db_user:4Xi4clN1yKd0EBxX@frooshjunction.s7l78r1.mongodb.net/frooshjunction?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "frooshjunction";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
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
