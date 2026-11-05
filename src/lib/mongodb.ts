import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure DNS servers are set for SRV resolution
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore in restricted environments
}

const dbName = process.env.MONGODB_DB || "frooshjunction";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Direct replicaSet fallback URI when Windows DNS blocks SRV resolution
const DIRECT_REPLICA_URI =
  "mongodb://frooshjunctionllp_db_user:4Xi4clN1yKd0EBxX@ac-yokkpx7-shard-00-00.s7l78r1.mongodb.net:27017,ac-yokkpx7-shard-00-01.s7l78r1.mongodb.net:27017,ac-yokkpx7-shard-00-02.s7l78r1.mongodb.net:27017/frooshjunction?ssl=true&replicaSet=atlas-79o56c-shard-0&authSource=admin&retryWrites=true&w=majority";

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI || DIRECT_REPLICA_URI;

  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  } catch {}

  try {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,
    });
    await client.connect();
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (err: any) {
    // If SRV lookup fails, fall back to direct replica set URI
    if (err?.message?.includes("querySrv") || err?.code === "ECONNREFUSED") {
      console.warn("SRV lookup failed, falling back to direct replica set connection...");
      const client = new MongoClient(DIRECT_REPLICA_URI, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
      });
      await client.connect();
      const db = client.db(dbName);
      cachedClient = client;
      cachedDb = db;
      return { client, db };
    }
    throw err;
  }
}
