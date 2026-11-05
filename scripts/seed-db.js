const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const { MongoClient } = require("mongodb");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://frooshjunctionllp_db_user:4Xi4clN1yKd0EBxX@frooshjunction.s7l78r1.mongodb.net/frooshjunction?retryWrites=true&w=majority";

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("frooshjunction");
  console.log("Connected to MongoDB database: frooshjunction");

  // 1. Admin and Worker Accounts
  const admin1 = {
    id: "ADM-001",
    username: "admin",
    name: "Froosh Admin (Store Owner)",
    pin: "admin123",
    role: "admin",
    phone: "+91 8013726751",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const admin2 = {
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

  for (const w of [admin1, admin2, worker1, worker2]) {
    await db.collection("workers").updateOne(
      { username: w.username },
      { $set: w },
      { upsert: true }
    );
  }
  console.log("Admin and 2 worker accounts created successfully!");

  // 2. Categories
  const categories = [
    {
      id: "cat-juices",
      name: "Juices",
      slug: "juices",
      description: "100% pure fresh-squeezed cold press & tropical juices",
      icon: "GlassWater",
      color: "#FACC15",
    },
    {
      id: "cat-shakes",
      name: "Shakes",
      slug: "shakes",
      description: "Rich thick gourmet milkshakes & dessert blends",
      icon: "Milk",
      color: "#EF4444",
    },
    {
      id: "cat-smoothies",
      name: "Smoothies & Bowls",
      slug: "smoothies",
      description: "Protein enriched fruit blends & berry bowls",
      icon: "Sparkles",
      color: "#EC4899",
    },
    {
      id: "cat-specials",
      name: "Froosh Specials",
      slug: "specials",
      description: "Signature mocktails, detox brews & seasonal creations",
      icon: "Flame",
      color: "#F97316",
    },
  ];

  for (const cat of categories) {
    await db.collection("categories").updateOne(
      { id: cat.id },
      { $set: cat },
      { upsert: true }
    );
  }
  console.log("Categories seeded successfully!");

  // 3. Products
  const products = [
    {
      id: "prod-mango-tango",
      name: "Mango Tango Zest",
      categoryId: "cat-juices",
      description: "Fresh Alphonso mango pulp with crushed mint and a splash of lime",
      emoji: "🥭",
      imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-01T08:00:00Z",
      variants: [
        { id: "var-mt-reg", name: "Regular 350ml", price: 90, isAvailable: true },
        { id: "var-mt-lrg", name: "Large 500ml", price: 140, isAvailable: true },
        { id: "var-mt-jmb", name: "Jumbo 750ml", price: 190, isAvailable: true },
      ],
    },
    {
      id: "prod-watermelon-chill",
      name: "Watermelon Mint Chill",
      categoryId: "cat-juices",
      description: "Hydrating cold-pressed watermelon with fresh garden mint & black salt",
      emoji: "🍉",
      imageUrl: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-01T08:00:00Z",
      variants: [
        { id: "var-wm-reg", name: "Regular 350ml", price: 70, isAvailable: true },
        { id: "var-wm-lrg", name: "Large 500ml", price: 110, isAvailable: true },
        { id: "var-wm-jmb", name: "Jumbo 750ml", price: 160, isAvailable: true },
      ],
    },
    {
      id: "prod-orange-sunrise",
      name: "Nagpur Orange Sunrise",
      categoryId: "cat-juices",
      description: "Pure citrus pulp loaded with Vitamin C, no added water or sugar",
      emoji: "🍊",
      imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-01T08:00:00Z",
      variants: [
        { id: "var-os-reg", name: "Regular 350ml", price: 80, isAvailable: true },
        { id: "var-os-lrg", name: "Large 500ml", price: 120, isAvailable: true },
      ],
    },
    {
      id: "prod-abc-detox",
      name: "ABC Miracle Detox",
      categoryId: "cat-juices",
      description: "Power cleanser made of Apple, Ruby Beetroot, and fresh Carrot with ginger",
      emoji: "🥕",
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-02T08:00:00Z",
      variants: [
        { id: "var-abc-reg", name: "Regular 350ml", price: 110, isAvailable: true },
        { id: "var-abc-lrg", name: "Large 500ml", price: 160, isAvailable: true },
        { id: "var-abc-jmb", name: "Jumbo 750ml", price: 220, isAvailable: true },
      ],
    },
    {
      id: "prod-pomegranate-ruby",
      name: "Ruby Pomegranate Glow",
      categoryId: "cat-juices",
      description: "Hand-pressed fresh ruby pomegranate arils bursting with antioxidants",
      emoji: "🍇",
      imageUrl: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-02T08:00:00Z",
      variants: [
        { id: "var-pom-reg", name: "Regular 350ml", price: 120, isAvailable: true },
        { id: "var-pom-lrg", name: "Large 500ml", price: 180, isAvailable: true },
      ],
    },
    {
      id: "prod-belgian-choco",
      name: "Belgian Fudge Thickshake",
      categoryId: "cat-shakes",
      description: "Rich dark cocoa truffle shake loaded with Belgian chocolate curls",
      emoji: "🍫",
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-03T08:00:00Z",
      variants: [
        { id: "var-bc-reg", name: "Regular 350ml", price: 140, isAvailable: true },
        { id: "var-bc-lrg", name: "Large 500ml", price: 190, isAvailable: true },
        { id: "var-bc-mon", name: "Monster 750ml", price: 260, isAvailable: true },
      ],
    },
    {
      id: "prod-oreo-overload",
      name: "Oreo Crumble Blast",
      categoryId: "cat-shakes",
      description: "Crushed Oreo cookies blended with creamy vanilla ice cream",
      emoji: "🍪",
      imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-03T08:00:00Z",
      variants: [
        { id: "var-or-reg", name: "Regular 350ml", price: 130, isAvailable: true },
        { id: "var-or-lrg", name: "Large 500ml", price: 180, isAvailable: true },
      ],
    },
    {
      id: "prod-avocado-royal",
      name: "Royal Avocado & Honey Shake",
      categoryId: "cat-shakes",
      description: "Silky Hass avocado puree blended with pure honey, dates and creamy milk",
      emoji: "🥑",
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-04T08:00:00Z",
      variants: [
        { id: "var-av-reg", name: "Regular 350ml", price: 160, isAvailable: true },
        { id: "var-av-lrg", name: "Large 500ml", price: 220, isAvailable: true },
      ],
    },
    {
      id: "prod-kitkat-crunch",
      name: "KitKat Break Thickshake",
      categoryId: "cat-shakes",
      description: "Crisp wafer KitKat bars blended with chocolate malt cream",
      emoji: "🍫",
      imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80",
      isAvailable: true,
      createdAt: "2026-09-04T08:00:00Z",
      variants: [
        { id: "var-kk-reg", name: "Regular 350ml", price: 130, isAvailable: true },
        { id: "var-kk-lrg", name: "Large 500ml", price: 180, isAvailable: true },
      ],
    },
  ];

  for (const prod of products) {
    await db.collection("products").updateOne(
      { id: prod.id },
      { $set: prod },
      { upsert: true }
    );
  }
  console.log("Products seeded successfully!");

  // Check counts
  const workerList = await db.collection("workers").find({}).toArray();
  const catCount = await db.collection("categories").countDocuments();
  const prodCount = await db.collection("products").countDocuments();

  console.log("MongoDB Database frooshjunction setup complete!");
  console.log(`Workers (${workerList.length}):`);
  workerList.forEach((w) => {
    console.log(` - [${w.role.toUpperCase()}] ${w.name} | Username: ${w.username} | PIN: ${w.pin}`);
  });
  console.log(`Categories: ${catCount}`);
  console.log(`Products: ${prodCount}`);

  await client.close();
}

seed().catch(console.error);
