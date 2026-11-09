import { apiRequest } from "@/lib/apiClient";
import {
  Category,
  Customer,
  Product,
  Sale,
  WorkerUser,
  AuthSession,
  CustomerPass,
  ContestOffer,
  RewardVoucher,
  OnlineOrder,
  LeaderboardEntry,
  OrderStatus,
} from "@/types";
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_WORKERS,
  DEFAULT_ADMIN,
  getInitialSales,
} from "@/lib/seedData";

const KEYS = {
  CATEGORIES: "froosh_v3_categories",
  PRODUCTS: "froosh_v3_products",
  CUSTOMERS: "froosh_v3_customers",
  SALES: "froosh_v3_sales",
  WORKERS: "froosh_v3_workers",
  CURRENT_USER: "froosh_v3_current_user",
  IS_INITIALIZED: "froosh_v3_initialized",
  CUSTOMER_PASSES: "froosh_v3_customer_passes",
  CURRENT_PASS: "froosh_v3_current_customer_pass",
  OFFERS: "froosh_v3_offers",
  VOUCHERS: "froosh_v3_vouchers",
  ONLINE_ORDERS: "froosh_v3_online_orders",
};

export const INITIAL_OFFERS: ContestOffer[] = [
  {
    id: "offer-shakes-championship",
    title: "Grand Shakes Championship",
    badge: "PLATFORM CHAMPIONSHIP",
    description:
      "Drink the highest number of gourmet milkshakes between Nov 1 and Nov 30 to win 100 Free Shakes! (Redeemable until Dec 31).",
    offerType: "contest_leaderboard",
    startDate: "2026-11-01T00:00:00.000Z",
    endDate: "2026-11-30T23:59:59.000Z",
    targetScope: "shakes",
    evaluationMetric: "drink_count",
    winnerCount: 1,
    reward: {
      type: "free_drinks",
      productScope: "shakes",
      quantity: 100,
      maxRedemptionsPerDay: 2,
      title: "100 Free Gourmet Milkshakes (Max 2/day)",
    },
    redeemValidUntil: "2026-12-31T23:59:59.000Z",
    status: "active",
    createdAt: "2026-10-30T00:00:00.000Z",
  },
  {
    id: "offer-juice-marathon",
    title: "Cold-Pressed Pure Juice Sprint",
    badge: "HEALTH LEADERBOARD",
    description:
      "Top fresh juice drinker this month wins 25 Free 100% Pure Fruit Juices (Redeemable until Dec 15).",
    offerType: "contest_leaderboard",
    startDate: "2026-10-15T00:00:00.000Z",
    endDate: "2026-11-15T23:59:59.000Z",
    targetScope: "juices",
    evaluationMetric: "drink_count",
    winnerCount: 3,
    reward: {
      type: "free_drinks",
      productScope: "juices",
      quantity: 25,
      maxRedemptionsPerDay: 1,
      title: "25 Free Pure Cold-Pressed Juices",
    },
    redeemValidUntil: "2026-12-15T23:59:59.000Z",
    status: "active",
    createdAt: "2026-10-15T00:00:00.000Z",
  },
  {
    id: "offer-happy-hours",
    title: "Platform Express Rush Hour",
    badge: "20% OFF DAILY",
    description:
      "Enjoy 20% off all platform beverages between 3:00 PM and 6:00 PM! Code EXPRESS20.",
    offerType: "happy_hours",
    startDate: "2026-10-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    targetScope: "all",
    evaluationMetric: "spend_amount",
    winnerCount: 0,
    reward: {
      type: "discount_percentage",
      productScope: "any",
      quantity: 1,
      discountValue: 20,
      title: "20% Off Platform Orders",
    },
    redeemValidUntil: "2026-12-31T23:59:59.000Z",
    code: "EXPRESS20",
    status: "active",
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "offer-punchcard-shake",
    title: "Station Stamp Pass: 5 Shakes = 1 Free",
    badge: "DIGITAL PUNCHCARD",
    description:
      "Buy any 5 shakes on your Froosh Rail Pass, and the 6th shake is completely on the house!",
    offerType: "punchcard_milestone",
    startDate: "2026-10-01T00:00:00.000Z",
    endDate: "2027-03-31T23:59:59.000Z",
    targetScope: "shakes",
    evaluationMetric: "drink_count",
    minQualifyingCount: 5,
    winnerCount: 1,
    reward: {
      type: "free_drinks",
      productScope: "shakes",
      quantity: 1,
      title: "1 Free Shake",
    },
    redeemValidUntil: "2027-04-30T23:59:59.000Z",
    status: "active",
    createdAt: "2026-10-01T00:00:00.000Z",
  },
];

export const INITIAL_PASSES: CustomerPass[] = [];


/**
 * Storage & MongoDB Sync Service
 * Seamless hybrid architecture:
 * 1. Synchronizes with MongoDB Atlas in the background via Next.js API routes.
 * 2. Instant local cache for zero-latency mobile touch response & offline resilience.
 */
class StorageService {
  private revisions = new Map<string, number>();
  private syncPromise: ReturnType<StorageService["performSync"]> | null = null;
  private ordersPromise: Promise<OnlineOrder[]> | null = null;
  private notificationPending = false;

  private notify(): void {
    if (this.notificationPending) return;
    this.notificationPending = true;
    queueMicrotask(() => {
      this.notificationPending = false;
      window.dispatchEvent(new Event("froosh:change"));
    });
  }

  private writeCache(key: string, value: string): void {
    if (localStorage.getItem(key) === value) return;
    localStorage.setItem(key, value);
    this.revisions.set(key, (this.revisions.get(key) ?? 0) + 1);
    this.notify();
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // Ensure default datasets are present in local cache
  public init(): void {
    if (!this.isBrowser()) return;

    const initialized = localStorage.getItem(KEYS.IS_INITIALIZED);
    if (!initialized) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): void {
    if (!this.isBrowser()) return;
    this.writeCache(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    this.writeCache(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    this.writeCache(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    this.writeCache(KEYS.SALES, JSON.stringify(getInitialSales()));
    this.writeCache(
      KEYS.WORKERS,
      JSON.stringify([DEFAULT_ADMIN, ...INITIAL_WORKERS])
    );
    this.writeCache(
      KEYS.CUSTOMER_PASSES,
      JSON.stringify(INITIAL_PASSES)
    );
    this.writeCache(KEYS.OFFERS, JSON.stringify(INITIAL_OFFERS));
    this.writeCache(KEYS.VOUCHERS, JSON.stringify([]));
    this.writeCache(KEYS.ONLINE_ORDERS, JSON.stringify([]));
    this.writeCache(KEYS.IS_INITIALIZED, "true");
  }

  // Sync state from MongoDB Atlas
  public syncFromMongo() {
    if (!this.syncPromise) {
      this.syncPromise = this.performSync().finally(() => { this.syncPromise = null; });
    }
    return this.syncPromise;
  }

  private async performSync(): Promise<{
    categories?: Category[];
    products?: Product[];
    customers?: Customer[];
    sales?: Sale[];
    workers?: WorkerUser[];
    orders?: OnlineOrder[];
  }> {
    if (!this.isBrowser()) return {};

    try {
      const revisions = new Map(this.revisions);

      const [catRes, prodRes, custRes, salesRes, workersRes, ordersRes] =
        await Promise.allSettled([
          apiRequest<{ data: Category[] }>("/api/categories"),
          apiRequest<{ data: Product[] }>("/api/products"),
          apiRequest<{ data: Customer[] }>("/api/customers"),
          apiRequest<{ data: Sale[] }>("/api/sales"),
          apiRequest<{ data: WorkerUser[] }>("/api/workers"),
          apiRequest<{ data: OnlineOrder[] }>("/api/orders"),
        ]);

      const updates: Awaited<ReturnType<StorageService["performSync"]>> = {};

      if (catRes.status === "fulfilled" && Array.isArray(catRes.value?.data) && revisions.get(KEYS.CATEGORIES) === this.revisions.get(KEYS.CATEGORIES)) {
        this.writeCache(KEYS.CATEGORIES, JSON.stringify(catRes.value.data));
        updates.categories = catRes.value.data;
      }
      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value?.data) && revisions.get(KEYS.PRODUCTS) === this.revisions.get(KEYS.PRODUCTS)) {
        this.writeCache(KEYS.PRODUCTS, JSON.stringify(prodRes.value.data));
        updates.products = prodRes.value.data;
      }
      if (custRes.status === "fulfilled" && Array.isArray(custRes.value?.data) && revisions.get(KEYS.CUSTOMERS) === this.revisions.get(KEYS.CUSTOMERS)) {
        this.writeCache(KEYS.CUSTOMERS, JSON.stringify(custRes.value.data));
        updates.customers = custRes.value.data;
      }
      if (salesRes.status === "fulfilled" && Array.isArray(salesRes.value?.data) && revisions.get(KEYS.SALES) === this.revisions.get(KEYS.SALES)) {
        this.writeCache(KEYS.SALES, JSON.stringify(salesRes.value.data));
        updates.sales = salesRes.value.data;
      }
      if (workersRes.status === "fulfilled" && Array.isArray(workersRes.value?.data) && revisions.get(KEYS.WORKERS) === this.revisions.get(KEYS.WORKERS)) {
        this.writeCache(KEYS.WORKERS, JSON.stringify(workersRes.value.data));
        updates.workers = workersRes.value.data;
      }
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value?.data) && revisions.get(KEYS.ONLINE_ORDERS) === this.revisions.get(KEYS.ONLINE_ORDERS)) {
        this.writeCache(KEYS.ONLINE_ORDERS, JSON.stringify(ordersRes.value.data));
        updates.orders = ordersRes.value.data;
      }

      return updates;
    } catch (err) {
      console.warn("Sync failed, continuing with cached data:", err);
      return {};
    }
  }

  // ---------------- AUTHENTICATION & USERS ----------------
  public getCurrentUser(): AuthSession | null {
    if (!this.isBrowser()) return null;
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: AuthSession | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      this.writeCache(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
      this.notify();
    }
  }

  public logout(): void {
    this.setCurrentUser(null);
  }

  // ---------------- WORKERS MANAGEMENT ----------------
  public getWorkers(): WorkerUser[] {
    if (!this.isBrowser()) return [DEFAULT_ADMIN, ...INITIAL_WORKERS];
    this.init();
    try {
      const data = localStorage.getItem(KEYS.WORKERS);
      return data ? JSON.parse(data) : [DEFAULT_ADMIN, ...INITIAL_WORKERS];
    } catch {
      return [DEFAULT_ADMIN, ...INITIAL_WORKERS];
    }
  }

  public getNextWorkerId(workers = this.getWorkers()): string {
    let maxNum = 0;
    workers.forEach((w) => {
      const match = w.id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `WRK-${String(maxNum + 1).padStart(3, "0")}`;
  }

  public saveWorker(worker: WorkerUser): WorkerUser[] {
    const list = this.getWorkers();
    const index = list.findIndex((w) => w.id === worker.id);
    if (index >= 0) {
      list[index] = worker;
    } else {
      list.push(worker);
    }
    if (this.isBrowser()) {
      this.writeCache(KEYS.WORKERS, JSON.stringify(list));
      // Async sync to MongoDB
      fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(worker),
      }).catch((e) => console.warn("Failed to push worker to MongoDB:", e));
    }
    return list;
  }

  public deleteWorker(id: string): WorkerUser[] {
    const list = this.getWorkers().filter((w) => w.id !== id);
    if (this.isBrowser()) {
      this.writeCache(KEYS.WORKERS, JSON.stringify(list));
      // Async delete from MongoDB
      fetch(`/api/workers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch((e) => console.warn("Failed to delete worker in MongoDB:", e));
    }
    return list;
  }

  // ---------------- CATEGORIES ----------------
  public getCategories(): Category[] {
    if (!this.isBrowser()) return INITIAL_CATEGORIES;
    this.init();
    try {
      const data = localStorage.getItem(KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public async saveCategory(category: Category): Promise<Category[]> {
    await apiRequest("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    const list = this.getCategories();
    const index = list.findIndex((item) => item.id === category.id);
    if (index >= 0) list[index] = category;
    else list.unshift(category);
    this.writeCache(KEYS.CATEGORIES, JSON.stringify(list));
    return list;
  }

  public async deleteCategory(id: string): Promise<Category[]> {
    await apiRequest(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const list = this.getCategories().filter((item) => item.id !== id);
    this.writeCache(KEYS.CATEGORIES, JSON.stringify(list));
    return list;
  }

  // ---------------- PRODUCTS ----------------
  public getProducts(): Product[] {
    if (!this.isBrowser()) return INITIAL_PRODUCTS;
    this.init();
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public async saveProduct(product: Product): Promise<Product[]> {
    await apiRequest("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const list = this.getProducts();
    const index = list.findIndex((item) => item.id === product.id);
    if (index >= 0) list[index] = product;
    else list.unshift(product);
    this.writeCache(KEYS.PRODUCTS, JSON.stringify(list));
    return list;
  }

  public async deleteProduct(id: string): Promise<Product[]> {
    await apiRequest(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const list = this.getProducts().filter((item) => item.id !== id);
    this.writeCache(KEYS.PRODUCTS, JSON.stringify(list));
    return list;
  }

  // ---------------- CUSTOMERS ----------------
  public getCustomers(): Customer[] {
    if (!this.isBrowser()) return INITIAL_CUSTOMERS;
    this.init();
    try {
      const data = localStorage.getItem(KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  }

  public getNextCustomerId(customers = this.getCustomers()): string {
    let maxId = 0;
    customers.forEach((c) => {
      const num = parseInt(c.id, 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    });
    return String(maxId + 1).padStart(3, "0");
  }

  public saveCustomer(customer: Customer): Customer[] {
    const list = this.getCustomers();
    const index = list.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.push(customer);
    }
    if (this.isBrowser()) {
      this.writeCache(KEYS.CUSTOMERS, JSON.stringify(list));
      fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      }).catch((e) => console.warn("Failed to push customer to Mongo:", e));
    }
    return list;
  }

  // ---------------- SALES ----------------
  public getSales(): Sale[] {
    if (!this.isBrowser()) return getInitialSales();
    this.init();
    try {
      const data = localStorage.getItem(KEYS.SALES);
      return data ? JSON.parse(data) : getInitialSales();
    } catch {
      return getInitialSales();
    }
  }

  public recordSale(sale: Sale): Sale[] {
    const list = this.getSales();
    list.unshift(sale); // newest first
    if (this.isBrowser()) {
      this.writeCache(KEYS.SALES, JSON.stringify(list));
      fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      }).catch((e) => console.warn("Failed to record sale in Mongo:", e));
    }
    return list;
  }

  public deleteSale(id: string): Sale[] {
    const list = this.getSales().filter((s) => s.id !== id);
    if (this.isBrowser()) {
      this.writeCache(KEYS.SALES, JSON.stringify(list));
      fetch(`/api/sales?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch((e) => console.warn("Failed to delete sale in Mongo:", e));
    }
    return list;
  }

  // ---------------- FROOSH RAIL PASS (FRICTIONLESS IDENTITY) ----------------
  public getCustomerPasses(): CustomerPass[] {
    if (!this.isBrowser()) return INITIAL_PASSES;
    try {
      const data = localStorage.getItem(KEYS.CUSTOMER_PASSES);
      return data ? JSON.parse(data) : INITIAL_PASSES;
    } catch {
      return INITIAL_PASSES;
    }
  }

  public getCustomerPassByPnr(pnr: string): CustomerPass | null {
    const list = this.getCustomerPasses();
    return list.find((p) => p.pnr.toUpperCase() === pnr.toUpperCase()) || null;
  }

  public saveCustomerPass(pass: CustomerPass): CustomerPass {
    const list = this.getCustomerPasses();
    const index = list.findIndex((p) => p.pnr === pass.pnr);
    if (index >= 0) {
      list[index] = pass;
    } else {
      list.push(pass);
    }
    if (this.isBrowser()) {
      this.writeCache(KEYS.CUSTOMER_PASSES, JSON.stringify(list));
    }
    return pass;
  }

  /**
   * Fast customer registration / login with phone number, name, and optional instagram id.
   * Stores customer login in session, generates customer ID and PNR.
   */
  public registerCustomer(
    name: string,
    phone: string,
    instagramId?: string
  ): CustomerPass {
    const trimmedName = name.trim();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const cleanInsta = instagramId?.trim().replace(/^@/, "") ? `@${instagramId.trim().replace(/^@/, "")}` : undefined;

    const list = this.getCustomerPasses();
    const existing = list.find(
      (p) => (p.phone && p.phone.replace(/[\s-]/g, "") === cleanPhone) ||
             (cleanPhone && p.phone === cleanPhone)
    );

    if (existing) {
      existing.name = trimmedName || existing.name;
      if (cleanInsta) existing.instagramId = cleanInsta;
      existing.lastActiveAt = new Date().toISOString();
      this.saveCustomerPass(existing);
      this.setCurrentCustomerPass(existing);

      // Also ensure customer record exists in customers list
      const customerRecord: Customer = {
        id: existing.customerId || existing.pnr,
        name: existing.name,
        gender: "other",
        phone: existing.phone || cleanPhone,
        instagramId: existing.instagramId || "",
        createdAt: existing.createdAt,
      };
      this.saveCustomer(customerRecord);

      return existing;
    }

    // New Customer Pass
    const nextId = this.getNextCustomerId();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPass: CustomerPass = {
      id: `pass-${Date.now()}`,
      pnr: `FJ-${randomNum}`,
      customerId: nextId,
      name: trimmedName,
      phone: cleanPhone,
      instagramId: cleanInsta,
      pin: "1234",
      stats: {
        totalJuices: 0,
        totalShakes: 0,
        totalOrders: 0,
        totalSpent: 0,
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    list.unshift(newPass);
    if (this.isBrowser()) {
      this.writeCache(KEYS.CUSTOMER_PASSES, JSON.stringify(list));
      this.writeCache(KEYS.CURRENT_PASS, JSON.stringify(newPass));
    }

    // Create Customer record for POS & CRM
    const customerRecord: Customer = {
      id: nextId,
      name: trimmedName,
      gender: "other",
      phone: cleanPhone,
      instagramId: cleanInsta || "",
      createdAt: new Date().toISOString(),
    };
    this.saveCustomer(customerRecord);

    // Sync to MongoDB in background
    if (this.isBrowser()) {
      fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerRecord),
      }).catch((e) => console.warn("Background customer sync error:", e));
    }

    return newPass;
  }

  /**
   * Frictionless registration: no phone, no email required!
   * Simply accepts name and optional PIN, creates a permanent PNR e.g. FJ-4819
   */
  public getOrCreatePass(name: string, pin?: string): CustomerPass {
    const trimmed = name.trim();
    const list = this.getCustomerPasses();
    // Check if matching pass already exists on current machine
    const existing = list.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      this.setCurrentCustomerPass(existing);
      return existing;
    }

    // Generate unique PNR
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPass: CustomerPass = {
      id: `pass-${Date.now()}`,
      pnr: `FJ-${randomNum}`,
      name: trimmed,
      pin: pin || "1234",
      stats: {
        totalJuices: 0,
        totalShakes: 0,
        totalOrders: 0,
        totalSpent: 0,
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    list.unshift(newPass);
    if (this.isBrowser()) {
      this.writeCache(KEYS.CUSTOMER_PASSES, JSON.stringify(list));
      this.writeCache(KEYS.CURRENT_PASS, JSON.stringify(newPass));
    }
    return newPass;
  }

  public getCurrentCustomerPass(): CustomerPass | null {
    if (!this.isBrowser()) return null;
    try {
      const data = localStorage.getItem(KEYS.CURRENT_PASS);
      if (data) {
        const parsed = JSON.parse(data);
        // Refresh with latest from pass list
        const latest = this.getCustomerPassByPnr(parsed.pnr);
        return latest || parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  public setCurrentCustomerPass(pass: CustomerPass | null): void {
    if (!this.isBrowser()) return;
    if (pass) {
      this.writeCache(KEYS.CURRENT_PASS, JSON.stringify(pass));
    } else {
      localStorage.removeItem(KEYS.CURRENT_PASS);
    }
  }

  public recordDrinkStats(
    pnr: string,
    drinks: { shakes: number; juices: number; spent: number; favoriteProduct?: string }
  ): void {
    const pass = this.getCustomerPassByPnr(pnr);
    if (!pass) return;

    pass.stats.totalShakes += drinks.shakes;
    pass.stats.totalJuices += drinks.juices;
    pass.stats.totalOrders += 1;
    pass.stats.totalSpent += drinks.spent;
    if (drinks.favoriteProduct) {
      pass.stats.favoriteItem = drinks.favoriteProduct;
    }
    pass.lastActiveAt = new Date().toISOString();

    this.saveCustomerPass(pass);
    const current = this.getCurrentCustomerPass();
    if (current && current.pnr === pass.pnr) {
      this.setCurrentCustomerPass(pass);
    }
  }

  // ---------------- OFFERS & CONTEST ENGINE (FULL FREEDOM) ----------------
  public getOffers(): ContestOffer[] {
    if (!this.isBrowser()) return INITIAL_OFFERS;
    try {
      const data = localStorage.getItem(KEYS.OFFERS);
      return data ? JSON.parse(data) : INITIAL_OFFERS;
    } catch {
      return INITIAL_OFFERS;
    }
  }

  public saveOffer(offer: ContestOffer): ContestOffer[] {
    const list = this.getOffers();
    const index = list.findIndex((o) => o.id === offer.id);
    if (index >= 0) {
      list[index] = offer;
    } else {
      list.unshift(offer);
    }
    if (this.isBrowser()) {
      this.writeCache(KEYS.OFFERS, JSON.stringify(list));
    }
    return list;
  }

  public deleteOffer(id: string): ContestOffer[] {
    const list = this.getOffers().filter((o) => o.id !== id);
    if (this.isBrowser()) {
      this.writeCache(KEYS.OFFERS, JSON.stringify(list));
    }
    return list;
  }

  /**
   * Computes dynamic contest leaderboard for any offer in real time.
   * Ranks customers based on total qualifying drinks bought between startDate & endDate.
   */
  public computeLeaderboard(offerId: string): LeaderboardEntry[] {
    const offer = this.getOffers().find((o) => o.id === offerId);
    if (!offer) return [];

    const passes = this.getCustomerPasses();
    const currentPass = this.getCurrentCustomerPass();

    // Map each customer to their score based on offer scope
    const entries: LeaderboardEntry[] = passes.map((p) => {
      let score = 0;
      if (offer.targetScope === "shakes") {
        score = p.stats.totalShakes;
      } else if (offer.targetScope === "juices") {
        score = p.stats.totalJuices;
      } else {
        score = p.stats.totalShakes + p.stats.totalJuices;
      }

      const nameParts = p.name.split(" ");
      const masked =
        nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
          : p.name;

      return {
        pnr: p.pnr,
        name: p.name,
        maskedName: masked,
        totalScore: score,
        rank: 1,
        isCurrentUser: currentPass?.pnr === p.pnr,
      };
    });

    // Sort descending by score
    entries.sort((a, b) => b.totalScore - a.totalScore);

    // Assign 1-based ranks
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  /**
   * Declares winners of a contest & automatically issues reward vouchers!
   * E.g. Top 1 gets 100 Shakes Voucher valid until redeemValidUntil.
   */
  public declareContestWinners(offerId: string): RewardVoucher[] {
    const offer = this.getOffers().find((o) => o.id === offerId);
    if (!offer) return [];

    const leaderboard = this.computeLeaderboard(offerId);
    const winners = leaderboard.slice(0, offer.winnerCount || 1);
    const issuedVouchers: RewardVoucher[] = [];

    winners.forEach((winner) => {
      const voucher: RewardVoucher = {
        id: `VOUCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        pnr: winner.pnr,
        customerName: winner.name,
        contestId: offer.id,
        contestTitle: offer.title,
        rewardType: offer.reward.type,
        productScope: offer.reward.productScope,
        allowedProductIds: offer.reward.allowedProductIds,
        totalQuantity: offer.reward.quantity,
        remainingQuantity: offer.reward.quantity,
        maxPerDay: offer.reward.maxRedemptionsPerDay || 2,
        redeemedToday: 0,
        validUntil: offer.redeemValidUntil,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      this.saveVoucher(voucher);
      issuedVouchers.push(voucher);
    });

    // Mark offer as ended
    offer.status = "ended";
    this.saveOffer(offer);

    return issuedVouchers;
  }

  // ---------------- REWARD VOUCHERS ----------------
  public getVouchers(): RewardVoucher[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(KEYS.VOUCHERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getVouchersByPnr(pnr: string): RewardVoucher[] {
    return this.getVouchers().filter(
      (v) => v.pnr.toUpperCase() === pnr.toUpperCase() && v.status === "active"
    );
  }

  public saveVoucher(voucher: RewardVoucher): RewardVoucher[] {
    const list = this.getVouchers();
    const index = list.findIndex((v) => v.id === voucher.id);
    if (index >= 0) {
      list[index] = voucher;
    } else {
      list.unshift(voucher);
    }
    if (this.isBrowser()) {
      this.writeCache(KEYS.VOUCHERS, JSON.stringify(list));
    }
    return list;
  }

  public redeemVoucher(
    voucherId: string,
    quantityToRedeem: number = 1
  ): { success: boolean; message: string; voucher?: RewardVoucher } {
    const vouchers = this.getVouchers();
    const voucher = vouchers.find((v) => v.id === voucherId);
    if (!voucher) {
      return { success: false, message: "Voucher not found." };
    }

    if (new Date() > new Date(voucher.validUntil)) {
      voucher.status = "expired";
      this.saveVoucher(voucher);
      return { success: false, message: "This voucher has expired." };
    }

    if (voucher.remainingQuantity < quantityToRedeem) {
      return {
        success: false,
        message: `Only ${voucher.remainingQuantity} free drinks remaining.`,
      };
    }

    // Daily limit check
    const todayStr = new Date().toISOString().slice(0, 10);
    if (voucher.lastRedeemedDate !== todayStr) {
      voucher.redeemedToday = 0;
      voucher.lastRedeemedDate = todayStr;
    }

    if (voucher.redeemedToday + quantityToRedeem > voucher.maxPerDay) {
      return {
        success: false,
        message: `Daily limit reached! Max ${voucher.maxPerDay} free drinks per visit/day.`,
      };
    }

    voucher.remainingQuantity -= quantityToRedeem;
    voucher.redeemedToday += quantityToRedeem;

    if (voucher.remainingQuantity <= 0) {
      voucher.status = "exhausted";
    }

    this.saveVoucher(voucher);
    return {
      success: true,
      message: `Redeemed ${quantityToRedeem} free drink(s)! Remaining: ${voucher.remainingQuantity}`,
      voucher,
    };
  }

  // ---------------- ONLINE ORDERS & KITCHEN KDS ----------------
  public getOnlineOrders(): OnlineOrder[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(KEYS.ONLINE_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async createOnlineOrder(order: OnlineOrder): Promise<OnlineOrder> {
    const list = this.getOnlineOrders();
    const existingIndex = list.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      list[existingIndex] = order;
    } else {
      list.unshift(order);
    }

    if (this.isBrowser()) {
      this.writeCache(KEYS.ONLINE_ORDERS, JSON.stringify(list));
    }

    // Auto update drink stats on customer pass
    if (order.pnr) {
      let shakeCount = 0;
      let juiceCount = 0;
      let favorite = "";

      order.items.forEach((item) => {
        if (item.categoryId === "cat-shakes") shakeCount += item.quantity;
        else if (item.categoryId === "cat-juices") juiceCount += item.quantity;
        favorite = item.productName;
      });

      this.recordDrinkStats(order.pnr, {
        shakes: shakeCount,
        juices: juiceCount,
        spent: order.total,
        favoriteProduct: favorite,
      });
    }

    // Persist to MongoDB with real await
    if (this.isBrowser()) {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        const data = await res.json();
        if (data.success && data.order) {
          return data.order;
        }
      } catch (e) {
        console.warn("MongoDB order sync warning:", e);
      }
    }

    return order;
  }

  public async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    modifications?: { items?: OnlineOrder["items"]; total?: number; notes?: string }
  ): Promise<OnlineOrder | null> {
    const list = this.getOnlineOrders();
    const order = list.find((o) => o.id === orderId);
    if (order) {
      order.orderStatus = status;
      if (modifications?.items) order.items = modifications.items;
      if (modifications?.total !== undefined) order.total = modifications.total;
      if (modifications?.notes !== undefined) order.notes = modifications.notes;

      if (this.isBrowser()) {
        this.writeCache(KEYS.ONLINE_ORDERS, JSON.stringify(list));
      }

      // Persist status change / modifications to MongoDB
      if (this.isBrowser()) {
        try {
          await fetch("/api/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: orderId,
              orderStatus: status,
              ...modifications,
            }),
          });
        } catch (e) {
          console.warn("Background order PATCH error:", e);
        }
      }

      return order;
    }
    return null;
  }

  /**
   * Sync online orders from MongoDB
   */
  public syncOrdersFromMongo(): Promise<OnlineOrder[]> {
    if (!this.ordersPromise) {
      this.ordersPromise = this.performOrderSync().finally(() => { this.ordersPromise = null; });
    }
    return this.ordersPromise;
  }

  private async performOrderSync(): Promise<OnlineOrder[]> {
    if (!this.isBrowser()) return this.getOnlineOrders();
    const revision = this.revisions.get(KEYS.ONLINE_ORDERS);
    try {
      const json = await apiRequest<{ success: boolean; data: OnlineOrder[] }>("/api/orders");
      if (revision !== this.revisions.get(KEYS.ONLINE_ORDERS)) return this.getOnlineOrders();
      if (json.success && Array.isArray(json.data)) {
        // Merge with local orders, prioritizing MongoDB for existing orders
        const localList = this.getOnlineOrders();
        const map = new Map<string, OnlineOrder>();

        // Put remote orders first
        json.data.forEach((order: OnlineOrder) => {
          map.set(order.id, order);
        });

        // Add any local orders that might be in flight
        localList.forEach((order) => {
          if (!map.has(order.id)) {
            map.set(order.id, order);
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.writeCache(KEYS.ONLINE_ORDERS, JSON.stringify(merged));
        return merged;
      }
      return this.getOnlineOrders();
    } catch {
      return this.getOnlineOrders();
    }
  }

  // ---------------- BACKUP & EXPORT ----------------
  public exportDatabase(): string {
    const dump = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      categories: this.getCategories(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      sales: this.getSales(),
      workers: this.getWorkers(),
    };
    return JSON.stringify(dump, null, 2);
  }

  public importDatabase(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.categories && data.products && data.customers && data.sales) {
        this.writeCache(KEYS.CATEGORIES, JSON.stringify(data.categories));
        this.writeCache(KEYS.PRODUCTS, JSON.stringify(data.products));
        this.writeCache(KEYS.CUSTOMERS, JSON.stringify(data.customers));
        this.writeCache(KEYS.SALES, JSON.stringify(data.sales));
        if (data.workers) {
          this.writeCache(KEYS.WORKERS, JSON.stringify(data.workers));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
