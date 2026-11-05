const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

if (!process.env.MONGODB_URI) {
  try {
    const envPath = path.resolve(__dirname, "../.env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      const match = envContent.match(/MONGODB_URI=(.*)/);
      if (match) process.env.MONGODB_URI = match[1].trim();
    }
  } catch (e) {}
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI in environment or .env.local");
  process.exit(1);
}

async function clean() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("frooshjunction");
  console.log("Connected to MongoDB database: frooshjunction");

  // 1. Clear dummy customers, sales, orders
  await db.collection("customers").deleteMany({});
  await db.collection("sales").deleteMany({});
  await db.collection("orders").deleteMany({});
  console.log("Cleared dummy customers, dummy sales, and test orders.");

  // 2. Ensure only legitimate admin and 2 worker accounts exist
  const admin = {
    id: "ADM-001",
    username: "admin",
    name: "Froosh Admin (Store Owner)",
    pin: "admin123",
    role: "admin",
    phone: "+91 8013726751",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const adminAlias = {
    id: "ADM-002",
    username: "asad@froosh.com",
    name: "Asad (Admin)",
    pin: "asad1234",
    role: "admin",
    phone: "+91 8013726751",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const worker1 = {
    id: "WRK-001",
    username: "worker1",
    name: "Aakash (Juice Barista)",
    pin: "1234",
    role: "worker",
    phone: "+91 98111 22233",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const worker2 = {
    id: "WRK-002",
    username: "worker2",
    name: "Pooja (Counter Staff)",
    pin: "2026",
    role: "worker",
    phone: "+91 98222 33344",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await db.collection("workers").deleteMany({});
  await db.collection("workers").insertMany([admin, adminAlias, worker1, worker2]);
  console.log("Workers synchronized: 1 Admin (with alias) and 2 Workers.");

  // 3. Inspect final state
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(" - Collection " + c.name + ": " + count + " documents");
  }

  await client.close();
  console.log("Database cleanup complete!");
}

clean().catch(console.error);
