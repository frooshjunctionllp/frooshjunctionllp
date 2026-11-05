import { Category, Customer, Product, Sale, WorkerUser } from "@/types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-juices",
    name: "Juices",
    slug: "juices",
    description: "100% pure fresh-squeezed cold press & tropical juices",
    icon: "",
    color: "#FACC15",
  },
  {
    id: "cat-shakes",
    name: "Shakes",
    slug: "shakes",
    description: "Rich thick gourmet milkshakes & dessert blends",
    icon: "",
    color: "#EF4444",
  },
  {
    id: "cat-smoothies",
    name: "Smoothies & Bowls",
    slug: "smoothies",
    description: "Protein enriched fruit blends & berry bowls",
    icon: "",
    color: "#EC4899",
  },
  {
    id: "cat-specials",
    name: "Froosh Specials",
    slug: "specials",
    description: "Signature mocktails, detox brews & seasonal creations",
    icon: "",
    color: "#F97316",
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // JUICES
  {
    id: "prod-mango-tango",
    name: "Mango Tango Zest",
    categoryId: "cat-juices",
    description: "Fresh Alphonso mango pulp with crushed mint and a splash of lime",
    emoji: "",
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
    emoji: "",
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
    emoji: "",
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
    emoji: "",
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
    emoji: "",
    imageUrl: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
    createdAt: "2026-09-02T08:00:00Z",
    variants: [
      { id: "var-pom-reg", name: "Regular 350ml", price: 120, isAvailable: true },
      { id: "var-pom-lrg", name: "Large 500ml", price: 180, isAvailable: true },
    ],
  },

  // SHAKES
  {
    id: "prod-belgian-choco",
    name: "Belgian Fudge Thickshake",
    categoryId: "cat-shakes",
    description: "Rich dark cocoa truffle shake loaded with Belgian chocolate curls",
    emoji: "",
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
    emoji: "",
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
    emoji: "",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
    createdAt: "2026-09-03T08:00:00Z",
    variants: [
      { id: "var-av-reg", name: "Regular 350ml", price: 160, isAvailable: true },
      { id: "var-av-lrg", name: "Large 500ml", price: 220, isAvailable: true },
    ],
  },
  {
    id: "prod-strawberry-dream",
    name: "Strawberry Cream Overload",
    categoryId: "cat-shakes",
    description: "Fresh strawberries blended with sweet cream",
    emoji: "",
    imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
    createdAt: "2026-09-04T08:00:00Z",
    variants: [
      { id: "var-st-reg", name: "Regular 350ml", price: 130, isAvailable: true },
      { id: "var-st-lrg", name: "Large 500ml", price: 180, isAvailable: true },
    ],
  },

  // SMOOTHIES
  {
    id: "prod-acai-berry",
    name: "Wild Berry Super Smoothie",
    categoryId: "cat-smoothies",
    description: "Antioxidant superblend with blueberries, banana & chia seeds",
    emoji: "",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
    createdAt: "2026-09-05T08:00:00Z",
    variants: [
      { id: "var-ac-reg", name: "Regular 400ml", price: 160, isAvailable: true },
      { id: "var-ac-lrg", name: "Large 600ml", price: 220, isAvailable: true },
    ],
  },
  {
    id: "prod-peanut-protein",
    name: "Peanut Butter Muscle Blast",
    categoryId: "cat-smoothies",
    description: "25g Whey protein with crunchy peanut butter, oats & Greek yogurt",
    emoji: "",
    imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
    createdAt: "2026-09-05T08:00:00Z",
    variants: [
      { id: "var-pb-reg", name: "Regular 450ml", price: 180, isAvailable: true },
      { id: "var-pb-pro", name: "Pro Double Scoop 650ml", price: 250, isAvailable: true },
    ],
  },

  // SPECIALS
  {
    id: "prod-dragon-mojito",
    name: "Pink Dragonfruit Mojito",
    categoryId: "cat-specials",
    description: "Vibrant pink dragonfruit, sparkling soda, garden mint, lime and ice",
    emoji: "",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
    createdAt: "2026-09-06T08:00:00Z",
    variants: [
      { id: "var-dm-reg", name: "Regular 400ml", price: 130, isAvailable: true },
      { id: "var-dm-lrg", name: "Large 600ml", price: 180, isAvailable: true },
    ],
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [];

export function getInitialSales(): Sale[] {
  return [];
}

export const INITIAL_WORKERS: WorkerUser[] = [
  {
    id: "WRK-001",
    username: "worker1",
    name: "Aakash (Juice Barista)",
    pin: "1234",
    role: "worker",
    phone: "+91 98111 22233",
    isActive: true,
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "WRK-002",
    username: "worker2",
    name: "Pooja (Counter Staff)",
    pin: "2026",
    role: "worker",
    phone: "+91 98222 33344",
    isActive: true,
    createdAt: "2026-10-02T10:00:00.000Z",
  },
];

export const DEFAULT_ADMIN: WorkerUser = {
  id: "ADM-001",
  username: "admin",
  name: "Froosh Admin (Store Owner)",
  pin: "admin123",
  role: "admin",
  phone: "+91 8013726751",
  isActive: true,
  createdAt: "2026-09-01T00:00:00.000Z",
};

export const BACKUP_ADMIN: WorkerUser = {
  id: "ADM-002",
  username: "asad@froosh.com",
  name: "Asad (Admin)",
  pin: "asad1234",
  role: "admin",
  phone: "+91 8013726751",
  isActive: true,
  createdAt: "2026-09-01T00:00:00.000Z",
};


