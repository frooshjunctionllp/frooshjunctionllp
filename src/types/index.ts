export type Gender = "male" | "female" | "other";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Emoji or icon key
  color: string; // Hex or tailwind color
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Regular 350ml", "Large 500ml", "Mega 750ml"
  price: number;
  isAvailable?: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  variants: ProductVariant[];
  emoji: string;
  imageUrl?: string; // Cloudinary or web image URL
  isAvailable: boolean;
  createdAt: string;
}

export interface Customer {
  id: string; // e.g., "001", "002"
  name: string;
  gender: Gender;
  phone?: string;
  instagramId?: string;
  createdAt: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  variantId: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  imageUrl?: string;
  isComplementary?: boolean;
  originalPrice?: number;
}

export type PaymentMethod = "cash" | "card" | "upi" | "complimentary" | "other";

export interface Sale {
  id: string; // e.g., "REC-1001"
  date: string; // ISO string e.g. "2026-10-09T10:15:00.000Z"
  customerId: string; // e.g. "001"
  customerName: string;
  customerGender: Gender;
  customerPhone?: string;
  customerInstagram?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  isComplementary?: boolean;
  workerId?: string;
  workerName?: string;
}

export type UserRole = "admin" | "worker";

export interface WorkerUser {
  id: string; // e.g., "WRK-001"
  username: string; // Worker login ID e.g. "cashier1" or "001"
  name: string; // e.g. "Rahul"
  pin: string; // Login Passcode / Password
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthSession {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export type DateRangePreset =
  | "all"
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "custom";

export interface ReportFilter {
  datePreset: DateRangePreset;
  startDate?: string;
  endDate?: string;
  categoryId?: string; // "all" or specific category ID
  productId?: string; // "all" or specific product ID
  gender?: "all" | "male" | "female";
  sortBy?: "qty_desc" | "qty_asc" | "revenue_desc" | "revenue_asc" | "recent";
}

export interface ProductSalesStat {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  emoji: string;
  totalQuantity: number;
  totalRevenue: number;
  maleBuyersQty: number;
  femaleBuyersQty: number;
  otherBuyersQty: number;
  orderCount: number;
  variantBreakdown: Record<string, number>; // variantName -> count
}

export interface CustomerSalesStat {
  customerId: string;
  customerName: string;
  customerGender: Gender;
  customerPhone?: string;
  customerInstagram?: string;
  totalOrders: number;
  totalQuantity: number;
  totalSpent: number;
  lastPurchaseDate: string;
  purchasedProducts: {
    productId: string;
    productName: string;
    variantName: string;
    quantity: number;
    dates: string[];
  }[];
  favoriteProduct: string;
}

// ================= FROOSH JUNCTION CUSTOMER & CONTEST SUITE =================

export interface CustomerPass {
  id: string;
  pnr: string; // e.g. "FJ-7821"
  customerId?: string; // Associated Customer ID
  name: string; // "Passenger Name"
  pin?: string; // 4-digit PIN for device recovery / counter redemption
  phone?: string; // Customer Phone
  instagramId?: string; // Optional Instagram handle e.g. @frooshfan
  stats: {
    totalJuices: number;
    totalShakes: number;
    totalOrders: number;
    totalSpent: number;
    favoriteItem?: string;
  };
  createdAt: string;
  lastActiveAt: string;
}

export type OfferType =
  | "contest_leaderboard"
  | "punchcard_milestone"
  | "happy_hours"
  | "flat_discount"
  | "bogo";

export interface RewardConfig {
  type: "free_drinks" | "discount_percentage" | "flat_discount";
  productScope: "any" | "shakes" | "juices" | "specific_product";
  allowedProductIds?: string[];
  quantity: number; // e.g. 100 shakes
  discountValue?: number; // e.g. 20 for 20% or 50 for ₹50
  maxRedemptionsPerDay?: number; // e.g. 2 shakes per day to protect stock
  title: string;
}

export interface ContestOffer {
  id: string;
  title: string;
  badge?: string; // e.g. "GRAND CONTEST", "HAPPY HOUR"
  description: string;
  offerType: OfferType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  targetScope: "all" | "shakes" | "juices" | "specific_product";
  targetProductIds?: string[];
  evaluationMetric: "drink_count" | "spend_amount" | "order_count";
  minQualifyingCount?: number;
  winnerCount: number; // e.g. 1 (Top Champion) or 3
  reward: RewardConfig;
  redeemValidUntil: string; // Expiry date to redeem won prize
  status: "active" | "draft" | "ended";
  code?: string; // Optional coupon code e.g. "EXPRESS20"
  minOrderValue?: number; // Optional MOV
  createdAt: string;
}

export interface RewardVoucher {
  id: string; // e.g. "VOUCH-4091-1"
  pnr: string;
  customerName: string;
  contestId: string;
  contestTitle: string;
  rewardType: "free_drinks" | "discount_percentage" | "flat_discount";
  productScope: "any" | "shakes" | "juices" | "specific_product";
  allowedProductIds?: string[];
  totalQuantity: number; // e.g. 100
  remainingQuantity: number; // e.g. 98
  maxPerDay: number;
  redeemedToday: number;
  lastRedeemedDate?: string;
  validUntil: string; // Expiry date
  status: "active" | "exhausted" | "expired";
  createdAt: string;
}

export interface LeaderboardEntry {
  pnr: string;
  name: string;
  maskedName: string;
  totalScore: number; // e.g. 24 shakes
  rank: number;
  isCurrentUser?: boolean;
}

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderItemCustomization {
  sugarLevel: "Normal (100%)" | "Less Sweet (50%)" | "Sugar-Free / Natural";
  iceLevel: "Normal Chill" | "Less Ice" | "No Ice";
  addons: string[]; // e.g. ["Dry Fruit Crunch (+₹30)", "Chia Seeds (+₹15)", "Whey Protein (+₹60)"]
}

export interface OnlineOrderItem {
  productId: string;
  productName: string;
  categoryId: string;
  variantId: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  customization?: OrderItemCustomization;
  isFreeVoucherReward?: boolean;
  voucherId?: string;
}

export interface OnlineOrder {
  id: string; // e.g. "TK-1082"
  customerId?: string; // Associated Customer ID / Phone
  pnr: string; // Associated Passenger PNR
  customerName: string;
  customerPhone?: string;
  customerInstagram?: string;
  orderType: "counter_pickup" | "dine_in" | "delivery";
  deliveryAddress?: string;
  items: OnlineOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "upi" | "cash" | "voucher";
  paymentStatus: "pending" | "paid";
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  estimatedMinutes?: number;
}

