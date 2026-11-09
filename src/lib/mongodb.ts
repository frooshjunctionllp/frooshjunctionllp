import { MongoClient, type Db } from "mongodb";

const connectionCache = globalThis as typeof globalThis & {
  frooshMongo?: Promise<{ client: MongoClient; db: Db }>;
};

/** Share in-flight connections, including across development hot reloads. */
export function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_DIRECT_URI || process.env.MONGODB_URI;
  if (!uri) return Promise.reject(new Error("MONGODB_URI is not configured"));
  if (!connectionCache.frooshMongo) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 15000,
    });
    connectionCache.frooshMongo = client.connect()
      .then(() => ({ client, db: client.db(process.env.MONGODB_DB || "frooshjunction") }))
      .catch(async (error: unknown) => {
        connectionCache.frooshMongo = undefined;
        await client.close();
        throw error;
      });
  }
  return connectionCache.frooshMongo;
}
