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
import { JunctionLanding } from "./JunctionLanding";
import { JunctionHeader } from "./JunctionHeader";
import { CustomerRegisterModal } from "./CustomerRegisterModal";
import { RailwaySignboard } from "./RailwaySignboard";
import { PassengerRailPassModal } from "./PassengerRailPassModal";
import { DrinkCustomizationModal } from "./DrinkCustomizationModal";
import { TicketCheckoutModal } from "./TicketCheckoutModal";
import { LiveOrderTrackerModal } from "./LiveOrderTrackerModal";
import { OffersAndContestsView } from "./OffersAndContestsView";
import { CustomerDrinkMonitor } from "./CustomerDrinkMonitor";
import {
  Train,
  Sparkles,
  ShoppingBag,
  MapPin,
  Phone,
  Share2,
  Clock,
  ArrowRight,
  Search,
  CheckCircle,
  Milk,
  GlassWater,
} from "lucide-react";

interface CustomerViewProps {
  categories: Category[];
  products: Product[];
  onOpenStaffLogin?: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  categories,
  products,
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
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState("");
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  useEffect(() => { if (!cartNotice) return; const timer = setTimeout(() => setCartNotice(""), 4500); return () => clearTimeout(timer); }, [cartNotice]);

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
      setActiveOrder(orders.find(order => order.pnr === pass?.pnr && !["completed", "cancelled"].includes(order.orderStatus)) || null);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "menu" || tabParam === "monitor" || tabParam === "offers" || tabParam === "contact" || tabParam === "home") {
        setActiveTab(tabParam);
      }
    }
    refreshCustomerState();
    // Poll orders from MongoDB in background
    storageService.syncOrdersFromMongo().then((orders) => {
      setOnlineOrders(orders);
      setActiveOrder(orders.find(order => order.pnr === storageService.getCurrentCustomerPass()?.pnr && !["completed", "cancelled"].includes(order.orderStatus)) || null);
    });

    const pollInterval = setInterval(() => {
      storageService.syncOrdersFromMongo().then((orders) => {
        setOnlineOrders(orders);
        setActiveOrder(orders.find(order => order.pnr === storageService.getCurrentCustomerPass()?.pnr && !["completed", "cancelled"].includes(order.orderStatus)) || null);
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
    setCartItems(items => [...items, newItem]);
    setCartNotice(`${product.name} added to your order`);
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
    <div className="client-station min-h-screen flex flex-col">
      <JunctionHeader activeTab={activeTab} onTab={tab => {setActiveTab(tab);window.scrollTo({top:0});}} currentPass={currentPass} cartCount={cartCount} onAccount={() => currentPass ? setIsPassModalOpen(true) : setIsRegisterOpen(true)} onCart={() => setIsCheckoutModalOpen(true)} time={stationTime}/>
      {cartNotice && <div className="station-cart-notice" role="status"><CheckCircle size={18}/><span>{cartNotice}</span><button onClick={() => {setCartNotice("");setIsCheckoutModalOpen(true);}}>View order <ArrowRight size={15}/></button></div>}
      {activeOrder && currentPass?.pnr === activeOrder.pnr && <button className="station-active-order" onClick={() => setIsTrackerModalOpen(true)}><Train size={18}/><span>Your order {activeOrder.id} · {activeOrder.orderStatus === "ready" ? "Ready to collect" : "In progress"}</span><strong>Track order <ArrowRight size={15}/></strong></button>}
      {/* Main Body */}
      <main className={`station-main flex-1 ${activeTab !== "home" ? "station-inner-screen" : ""}`}>
        {/* ================= TAB 1: HOME (FRESH ARRIVALS) ================= */}
        {activeTab === "home" && <JunctionLanding products={products} onMenu={() => {setActiveTab("menu");window.scrollTo({top:0});}} onChoose={setCustomizingProduct} onVisit={() => {setActiveTab("contact");window.scrollTo({top:0});}} />}
        {/* ================= TAB 2: PLATFORM MENU ================= */}
        {activeTab === "menu" && (
          <div className="space-y-5">
            {/* Menu Header with Railway Platform Boards */}
            <div className="border-3 border-slate-900 bg-amber-400 p-4 rounded-xl shadow-[3px_3px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-800">
                  THE PLATFORM MENU
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-950 uppercase">
                  Find your next favourite
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
            orders={onlineOrders.filter(order => order.pnr === currentPass?.pnr)}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onExploreMenu={() => setActiveTab("menu")}
          />
        )}

        {/* ================= TAB 4: CONTESTS & OFFERS ================= */}
        {activeTab === "offers" && (
          <OffersAndContestsView
            offers={offers}
            currentPass={currentPass}
            onOpenPassModal={() => currentPass ? setIsPassModalOpen(true) : setIsRegisterOpen(true)}
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

      <footer className="station-footer"><div><img src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png" alt="Froosh Junction" /><p>Fresh stops. Familiar faces.</p></div><div><span className="station-label">FIND THE JUNCTION</span><p>Padma Pukur, Bihar Bus Stand<br/>Entally, Kolkata · 700014</p><a href="tel:+918013726751">+91 8013726751</a></div><div><span className="station-label">STAY A LITTLE LONGER</span><button onClick={() => setActiveTab("menu")}>Explore the menu</button><a href="https://instagram.com/frooshjunction" target="_blank" rel="noreferrer">Instagram</a><div className="station-team-links"><a href="/staff">Staff sign in</a><a href="/admin">Admin</a></div></div></footer>
      {cartCount > 0 && <button className="station-mobile-order" onClick={() => setIsCheckoutModalOpen(true)}><ShoppingBag size={18}/><span>{cartCount} {cartCount === 1 ? "drink" : "drinks"} in your order</span><strong>View order <ArrowRight size={16}/></strong></button>}
      <CustomerRegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} currentPass={currentPass} onPassUpdated={pass => {setCurrentPass(pass);refreshCustomerState();}} onRedirectToMenu={() => setActiveTab("menu")} />
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

      {customizingProduct && <DrinkCustomizationModal
        key={customizingProduct.id}
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
        onAddToCart={handleAddToCart}
      />}

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
