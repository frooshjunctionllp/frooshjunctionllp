"use client";

import React, { useState, useEffect } from "react";
import {
  Category,
  Product,
  CustomerPass,
  ContestOffer,
  RewardVoucher,
  OnlineOrderItem,
  OnlineOrder,
  ProductVariant,
  OrderItemCustomization,
} from "@/types";
import { storageService } from "@/services/storageService";
import { RailwaySignboard } from "./RailwaySignboard";
import { PassengerRailPassModal } from "./PassengerRailPassModal";
import { DrinkCustomizationModal } from "./DrinkCustomizationModal";
import { TicketCheckoutModal } from "./TicketCheckoutModal";
import { LiveOrderTrackerModal } from "./LiveOrderTrackerModal";
import { OffersAndContestsView } from "./OffersAndContestsView";
import { CustomerDrinkMonitor } from "./CustomerDrinkMonitor";
import { CustomerMobileDock } from "./CustomerMobileDock";
import {
  Train,
  Ticket,
  Trophy,
  Sparkles,
  ShoppingBag,
  MapPin,
  Phone,
  Share2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Shield,
  Heart,
  ChevronRight,
  Flame,
  Milk,
  GlassWater,
  Award,
  Tag,
} from "lucide-react";

interface CustomerViewProps {
  categories: Category[];
  products: Product[];
  onOpenStaffLogin?: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  categories,
  products,
  onOpenStaffLogin,
}) => {
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "monitor" | "offers" | "contact">("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPass, setCurrentPass] = useState<CustomerPass | null>(null);
  const [offers, setOffers] = useState<ContestOffer[]>([]);
  const [vouchers, setVouchers] = useState<RewardVoucher[]>([]);
  const [cartItems, setCartItems] = useState<OnlineOrderItem[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<OnlineOrder | null>(null);

  // Modals
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  // Station Clock
  const [stationTime, setStationTime] = useState("");

  const refreshCustomerState = () => {
    const pass = storageService.getCurrentCustomerPass();
    setCurrentPass(pass);
    setOffers(storageService.getOffers());
    if (pass) {
      setVouchers(storageService.getVouchersByPnr(pass.pnr));
    } else {
      setVouchers([]);
    }
    const orders = storageService.getOnlineOrders();
    setOnlineOrders(orders);
    if (orders.length > 0) {
      setActiveOrder(orders[0]); // most recent
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "menu" || tabParam === "monitor" || tabParam === "offers" || tabParam === "contact" || tabParam === "home") {
        setActiveTab(tabParam as any);
      }
    }
    refreshCustomerState();
    // Poll orders from MongoDB in background
    storageService.syncOrdersFromMongo().then((orders) => {
      setOnlineOrders(orders);
      if (orders.length > 0) setActiveOrder(orders[0]);
    });

    const pollInterval = setInterval(() => {
      storageService.syncOrdersFromMongo().then((orders) => {
        setOnlineOrders(orders);
      });
    }, 4000);

    const updateClock = () => {
      const now = new Date();
      setStationTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, []);

  const handleAddToCart = (
    product: Product,
    variant: ProductVariant,
    quantity: number,
    customization: OrderItemCustomization,
    finalPrice: number
  ) => {
    const newItem: OnlineOrderItem = {
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      variantId: variant.id,
      variantName: variant.name,
      unitPrice: variant.price,
      quantity,
      total: finalPrice,
      customization,
    };
    setCartItems([...cartItems, newItem]);
  };

  const handleOrderPlaced = (order: OnlineOrder) => {
    setIsCheckoutModalOpen(false);
    setActiveOrder(order);
    setIsTrackerModalOpen(true);
    refreshCustomerState();
  };

  // Filter products (only available beverages)
  const filteredProducts = products.filter((p) => {
    if (p.isAvailable === false) return false;
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Station Marquee Bar */}
      <div className="bg-slate-950 text-amber-400 py-1.5 px-3 border-b-2 border-amber-400 text-[11px] font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">PLATFORM COUNTER OPEN</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-amber-200/90 hidden sm:inline">
            Padma Pukur, Bihar Bus Stand, Entally
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-300 font-black">
            {stationTime || "16:00:00"} IST
          </span>
        </div>
      </div>

      {/* Main Railway Navigation Bar */}
      <header className="sticky top-0 z-40 bg-amber-400 border-b-4 border-slate-900 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Station Brand */}
          <div
            onClick={() => setActiveTab("home")}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <img
              src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png"
              alt="Froosh Junction"
              className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
            />
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold text-slate-900 tracking-tight font-mono">
                Your Next Fresh Stop • Pure Juices & Shakes
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs font-black">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                  : "bg-amber-300/60 text-slate-900 border-transparent hover:bg-amber-300"
              }`}
            >
              Fresh Arrivals
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer ${
                activeTab === "menu"
                  ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                  : "bg-amber-300/60 text-slate-900 border-transparent hover:bg-amber-300"
              }`}
            >
              Platform Menu
            </button>
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "monitor"
                  ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                  : "bg-amber-300/60 text-slate-900 border-transparent hover:bg-amber-300"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-600" />
              <span>My Drinks Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "offers"
                  ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                  : "bg-amber-300/60 text-slate-900 border-transparent hover:bg-amber-300"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Contests & Deals</span>
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer ${
                activeTab === "contact"
                  ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                  : "bg-amber-300/60 text-slate-900 border-transparent hover:bg-amber-300"
              }`}
            >
              Station Info
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Passenger Rail Pass / Register Button */}
            {currentPass ? (
              <button
                onClick={() => setIsPassModalOpen(true)}
                className="bg-slate-950 hover:bg-slate-900 text-amber-300 border-2 border-slate-950 px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span className="truncate max-w-24 sm:max-w-none">
                  {currentPass.name.split(" ")[0]} ({currentPass.pnr})
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 font-mono">
                <a
                  href="/register"
                  className="bg-slate-950 hover:bg-slate-900 text-amber-300 border-2 border-slate-950 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Register</span>
                </a>
                <a
                  href="/login"
                  className="bg-amber-300/80 hover:bg-amber-300 text-slate-950 border-2 border-slate-950 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                >
                  Sign In
                </a>
              </div>
            )}

            {/* Cart / Ticket Button */}
            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="relative bg-red-600 hover:bg-red-700 text-white border-2 border-slate-950 px-3 py-1.5 rounded-lg font-mono text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ticket</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex border-t-2 border-slate-900 font-mono text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex-1 py-1.5 text-center ${
              activeTab === "home"
                ? "bg-slate-950 text-amber-300"
                : "bg-amber-400 text-slate-900"
            }`}
          >
            Arrivals
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-1.5 text-center border-l border-slate-900 ${
              activeTab === "menu"
                ? "bg-slate-950 text-amber-300"
                : "bg-amber-400 text-slate-900"
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab("monitor")}
            className={`flex-1 py-1.5 text-center border-l border-slate-900 flex items-center justify-center gap-0.5 ${
              activeTab === "monitor"
                ? "bg-slate-950 text-amber-300"
                : "bg-amber-400 text-slate-900"
            }`}
          >
            <Flame className="w-3 h-3 text-red-600" />
            <span>My Drinks</span>
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`flex-1 py-1.5 text-center border-l border-slate-900 ${
              activeTab === "offers"
                ? "bg-slate-950 text-amber-300"
                : "bg-amber-400 text-slate-900"
            }`}
          >
            Contests
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-1.5 text-center border-l border-slate-900 ${
              activeTab === "contact"
                ? "bg-slate-950 text-amber-300"
                : "bg-amber-400 text-slate-900"
            }`}
          >
            Station
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-8">
        {/* ================= TAB 1: HOME (FRESH ARRIVALS) ================= */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Authentic Railway Signboard */}
            <RailwaySignboard
              title="FROOSH JUNCTION"
              bengaliTitle="ফ্রুশ জংশন"
              stationCode="FRSH / 700014"
              platform="PLATFORM 1 & 2"
            />

            {/* Hero Banner */}
            <div className="border-4 border-slate-900 bg-slate-950 text-amber-300 rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#f59e0b] relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-block bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase px-2.5 py-1 rounded">
                  ESTD. KOLKATA 2026 • 100% PURE JUICES & SHAKES
                </span>
                <h1 className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight leading-tight">
                  Welcome to Froosh Junction —{" "}
                  <span className="text-amber-400 underline decoration-red-500">
                    Your Next Fresh Stop.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
                  Inspired by the lively spirit of Indian railway junctions. Sip
                  thick gourmet milkshakes and cold-pressed pure fruit juices
                  crafted right before your eyes.
                </p>

                {/* Quick Action CTA Buttons */}
                <div className="flex flex-wrap gap-3 pt-2 font-mono">
                  <button
                    onClick={() => setActiveTab("menu")}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_#fff] hover:shadow-none transition-all uppercase text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>View Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (!currentPass) {
                        setIsPassModalOpen(true);
                      } else {
                        setActiveTab("menu");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-3 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_#fff] hover:shadow-none transition-all uppercase text-xs sm:text-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{currentPass ? "Order Drinks" : "Register with Phone"}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("monitor")}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-black px-4 py-3 rounded-xl border-2 border-slate-700 transition-colors uppercase text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>My Drink Tracker</span>
                  </button>
                </div>
              </div>

              {/* Decorative Railway Tracks Overlay */}
              <div className="absolute -bottom-8 -right-8 w-64 h-64 border-8 border-dashed border-amber-400/20 rounded-full pointer-events-none" />
            </div>

            {/* Live Order Tracker Banner (If customer has an active order) */}
            {activeOrder && activeOrder.orderStatus !== "completed" && (
              <div className="border-3 border-slate-900 bg-amber-200/90 rounded-xl p-4 flex items-center justify-between shadow-[3px_3px_0px_#0f172a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                    <Train className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black text-slate-600 uppercase block">
                      LIVE PLATFORM STATUS • TICKET #{activeOrder.id}
                    </span>
                    <div className="text-sm font-black text-slate-950 uppercase font-mono">
                      Status: {activeOrder.orderStatus} • {activeOrder.items.length}{" "}
                      Drinks
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsTrackerModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono font-bold text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  View Status
                </button>
              </div>
            )}

            {/* The Free-Form Drink Championship Showcase */}
            <OffersAndContestsView
              offers={offers}
              currentPass={currentPass}
              onOpenPassModal={() => setIsPassModalOpen(true)}
              onExploreMenu={() => setActiveTab("menu")}
            />

            {/* Featured Platforms (Menu Highlights) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div>
                  <h3 className="font-mono text-lg font-black uppercase text-slate-950">
                    Platform Specials • Fresh Arrivals
                  </h3>
                  <p className="text-xs text-slate-600">
                    Sip directly at the counter or take away in platform bottles
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="text-xs font-mono font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <span>See Full Menu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
                {products.slice(0, 12).map((product) => (
                  <div
                    key={product.id}
                    className="border-3 border-slate-900 bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_#0f172a] hover:translate-y-[-2px] transition-transform flex flex-col justify-between"
                  >
                    <div>
                      {product.imageUrl && (
                        <div className="h-44 w-full relative bg-amber-100 overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-slate-950 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                            {product.categoryId === "cat-shakes" ? (
                              <>
                                <Milk className="w-3 h-3 text-red-400" />
                                <span>Gourmet Shake</span>
                              </>
                            ) : product.categoryId === "cat-juices" ? (
                              <>
                                <GlassWater className="w-3 h-3 text-amber-400" />
                                <span>Pure Juice</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-pink-400" />
                                <span>Station Special</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="p-3.5 space-y-1">
                        <h4 className="font-mono text-sm font-black text-slate-950">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Portion sizes */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {product.variants.map((v) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              {v.name.split(" ")[0]}: ₹{v.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Starts from
                        </span>
                        <span className="text-sm font-black text-red-600 font-mono">
                          ₹{product.variants[0]?.price || 90}
                        </span>
                      </div>
                      <button
                        onClick={() => setCustomizingProduct(product)}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 border border-slate-950 font-mono text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Customize & Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PLATFORM MENU ================= */}
        {activeTab === "menu" && (
          <div className="space-y-5">
            {/* Menu Header with Railway Platform Boards */}
            <div className="border-3 border-slate-900 bg-amber-400 p-4 rounded-xl shadow-[3px_3px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-800">
                  DIGITAL DESTINATION MENU
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-950 uppercase">
                  Station Beverage Ledger
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search juices, shakes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Platform Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 font-mono text-xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2 rounded-xl border-2 font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                    : "bg-white text-slate-800 border-slate-300 hover:border-slate-400"
                }`}
              >
                All Platforms ({products.length})
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl border-2 font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                      : "bg-white text-slate-800 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  Platform {idx + 1}: {cat.name}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border-3 border-slate-900 bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_#0f172a] hover:translate-y-[-2px] transition-transform flex flex-col justify-between"
                >
                  <div>
                    {product.imageUrl && (
                      <div className="h-44 w-full relative bg-amber-100 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-slate-950 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                          {product.categoryId === "cat-shakes" ? (
                            <>
                              <Milk className="w-3 h-3 text-red-400" />
                              <span>Gourmet Shake</span>
                            </>
                          ) : product.categoryId === "cat-juices" ? (
                            <>
                              <GlassWater className="w-3 h-3 text-amber-400" />
                              <span>Pure Juice</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-pink-400" />
                              <span>Station Special</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="p-3.5 space-y-1">
                      <h4 className="font-mono text-sm font-black text-slate-950">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Portion sizes */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.variants.map((v) => (
                          <span
                            key={v.id}
                            className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                          >
                            {v.name.split(" ")[0]}: ₹{v.price}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Starts from
                      </span>
                      <span className="text-sm font-black text-red-600 font-mono">
                        ₹{product.variants[0]?.price || 90}
                      </span>
                    </div>
                    <button
                      onClick={() => setCustomizingProduct(product)}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 border border-slate-950 font-mono text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Customize & Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PERSONAL DRINK MONITOR & HABIT TRACKER (NO COST) ================= */}
        {activeTab === "monitor" && (
          <CustomerDrinkMonitor
            currentPass={currentPass}
            orders={onlineOrders}
            onOpenRegister={() => setIsPassModalOpen(true)}
            onExploreMenu={() => setActiveTab("menu")}
          />
        )}

        {/* ================= TAB 4: CONTESTS & OFFERS ================= */}
        {activeTab === "offers" && (
          <OffersAndContestsView
            offers={offers}
            currentPass={currentPass}
            onOpenPassModal={() => setIsPassModalOpen(true)}
            onExploreMenu={() => setActiveTab("menu")}
          />
        )}

        {/* ================= TAB 4: STATION INFO & CONTACT ================= */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <RailwaySignboard
              title="FROOSH JUNCTION • STATION LEDGER"
              subTitle="ENTALLY, CENTRAL KOLKATA"
              stationCode="FRSH / 700014"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
              {/* Station Details Card */}
              <div className="border-3 border-slate-900 bg-white rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] space-y-4">
                <div className="border-b-2 border-slate-900 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    STATION PLATFORM LOCATION
                  </span>
                  <h3 className="text-lg font-black text-slate-950 uppercase">
                    Padma Pukur, Bihar Bus Stand
                  </h3>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-950 font-mono">Address:</strong>
                      <span>Padma Pukur, Bihar Bus Stand, Entally, Kolkata – 700014</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-950 font-mono">Phone:</strong>
                      <span>+91 8013726751</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Share2 className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-950 font-mono">Instagram:</strong>
                      <a
                        href="https://instagram.com/frooshjunction"
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-600 underline font-bold"
                      >
                        @frooshjunction
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-950 font-mono">Platform Hours:</strong>
                      <span>Monday – Sunday: 10:00 AM to 11:30 PM IST</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story / About Us Card */}
              <div className="border-3 border-slate-900 bg-amber-400 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] space-y-3 text-slate-950">
                <div className="border-b-2 border-slate-900 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-800">
                    OUR HERITAGE & INSPIRATION
                  </span>
                  <h3 className="text-lg font-black uppercase font-mono">
                    The Railway Junction Story
                  </h3>
                </div>

                <p className="text-xs font-sans leading-relaxed text-slate-900">
                  Froosh Junction was born out of love for the bustling,
                  energizing hubs of Indian railway junctions. Just like a station
                  unites passengers from every route, our platform serves
                  refreshing stops of 100% pure fruit juices and velvety thick
                  milkshakes to travelers and locals alike.
                </p>

                <div className="bg-slate-950 text-amber-300 rounded-xl p-3 text-xs font-mono space-y-1">
                  <div className="text-[10px] uppercase text-amber-400 font-bold">
                    THE FROOSH GUARANTEE
                  </div>
                  <div>• 100% Real Fruits, Zero Artificial Color</div>
                  <div>• Freshly prepared upon order at the platform</div>
                  <div>• Zero-condition passenger rewards & contests</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-slate-900 bg-slate-950 text-amber-400 py-6 mt-12 mb-20 sm:mb-0 text-center font-mono text-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Train className="w-4 h-4 text-amber-400" />
            <span className="font-black tracking-widest uppercase">
              Froosh Junction • Entally, Kolkata – 700014
            </span>
          </div>
          <p className="text-slate-400 text-[11px] font-sans">
            Phone: +91 8013726751 • Instagram: @frooshjunction • Station Code: FRSH
          </p>
        </div>
      </footer>

      {/* Floating Mobile Dock */}
      <CustomerMobileDock
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        cartCount={cartCount}
        onOpenCart={() => setIsCheckoutModalOpen(true)}
        currentPass={currentPass}
        onOpenProfile={() => setIsPassModalOpen(true)}
      />

      {/* Modals */}
      <PassengerRailPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        currentPass={currentPass}
        onPassUpdated={(pass) => {
          setCurrentPass(pass);
          refreshCustomerState();
        }}
        vouchers={vouchers}
        onRedirectToMenu={() => setActiveTab("menu")}
      />

      <DrinkCustomizationModal
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <TicketCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        onUpdateCart={setCartItems}
        currentPass={currentPass}
        onOpenPassModal={() => {
          setIsCheckoutModalOpen(false);
          setIsPassModalOpen(true);
        }}
        onOrderPlaced={handleOrderPlaced}
        vouchers={vouchers}
      />

      <LiveOrderTrackerModal
        order={activeOrder}
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
      />
    </div>
  );
};
