"use client";

import { JunctionMenu } from "./JunctionMenu";
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
import { TrainMarquee } from "./TrainMarquee";
import "@/app/storefront.css";
import { PassengerRailPassModal } from "./PassengerRailPassModal";
import { DrinkCustomizationModal } from "./DrinkCustomizationModal";
import { TicketCheckoutModal } from "./TicketCheckoutModal";
import { LiveOrderTrackerModal } from "./LiveOrderTrackerModal";
import { OffersAndContestsView } from "./OffersAndContestsView";
import { CustomerDrinkMonitor } from "./CustomerDrinkMonitor";
import { CustomerMobileDock } from "./CustomerMobileDock";
import { Train, Ticket } from "lucide-react";

interface CustomerViewProps {
  categories: Category[];
  products: Product[];
  onOpenStaffLogin?: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  categories,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<
    "home" | "menu" | "monitor" | "offers" | "contact"
  >("home");
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
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(
    null,
  );

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
      setActiveOrder(
        orders.find(
          (order) =>
            order.pnr === pass?.pnr &&
            !["completed", "cancelled"].includes(order.orderStatus),
        ) || null,
      );
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || window.location.hash.slice(1);
      if (
        tabParam === "menu" ||
        tabParam === "monitor" ||
        tabParam === "offers" ||
        tabParam === "contact" ||
        tabParam === "home"
      ) {
        setActiveTab(tabParam);
      }
    }
    refreshCustomerState();
    window.addEventListener("froosh:change", refreshCustomerState);
    window.addEventListener("storage", refreshCustomerState);
    // Poll orders from MongoDB in background
    storageService.syncOrdersFromMongo().then((orders) => {
      setOnlineOrders(orders);
      setActiveOrder(
        orders.find(
          (order) =>
            order.pnr === storageService.getCurrentCustomerPass()?.pnr &&
            !["completed", "cancelled"].includes(order.orderStatus),
        ) || null,
      );
    });

    const pollInterval = setInterval(() => {
      storageService.syncOrdersFromMongo().then((orders) => {
        setOnlineOrders(orders);
        setActiveOrder(
          orders.find(
            (order) =>
              order.pnr === storageService.getCurrentCustomerPass()?.pnr &&
              !["completed", "cancelled"].includes(order.orderStatus),
          ) || null,
        );
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
        }),
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => {
      window.removeEventListener("froosh:change", refreshCustomerState);
      window.removeEventListener("storage", refreshCustomerState);
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, []);

  const handleAddToCart = (
    product: Product,
    variant: ProductVariant,
    quantity: number,
    customization: OrderItemCustomization | undefined,
    finalPrice: number,
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
    setCartItems((items) => [...items, newItem]);
  };

  const handleOrderPlaced = (order: OnlineOrder) => {
    setIsCheckoutModalOpen(false);
    setActiveOrder(order);
    setIsTrackerModalOpen(true);
    refreshCustomerState();
  };

  const isHomePage = activeTab !== "monitor";
  const scrollToSection = (tab: "home" | "menu" | "offers" | "contact") => {
    const id = tab === "contact" ? "visit" : tab;
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  };
  const navigate = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "monitor") window.scrollTo({ top: 0 });
    else if (isHomePage) scrollToSection(tab);
  };
  useEffect(() => {
    if (activeTab === "monitor") return;
    const frame = requestAnimationFrame(() => scrollToSection(activeTab));
    return () => cancelAnimationFrame(frame);
  }, [activeTab]);

  const currentOffers = offers.filter(
    (offer) =>
      offer.status === "active" &&
      Date.parse(offer.startDate) <= Date.now() &&
      Date.parse(offer.endDate) >= Date.now(),
  );

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="client-station min-h-screen flex flex-col font-sans">
      <JunctionHeader
        activeTab={activeTab}
        onTab={navigate}
        currentPass={currentPass}
        cartCount={cartCount}
        onAccount={() => setIsPassModalOpen(true)}
        onCart={() => setIsCheckoutModalOpen(true)}
        time={stationTime}
      />

      {/* Main Body */}
      <main
        className={`station-main flex-1 ${isHomePage ? "" : "station-inner-screen"}`}
      >
        {/* ================= TAB 1: HOME (FRESH ARRIVALS) ================= */}
        {isHomePage && (
          <div id="home">
            {activeOrder &&
              currentPass?.pnr === activeOrder.pnr &&
              !["completed", "cancelled"].includes(activeOrder.orderStatus) && (
                <button
                  className="station-active-order"
                  onClick={() => setIsTrackerModalOpen(true)}
                >
                  <Train size={20} /> Ticket {activeOrder.id} ·{" "}
                  {activeOrder.orderStatus}
                  <strong>Track your order</strong>
                </button>
              )}
            <JunctionLanding
              onMenu={() => navigate("menu")}
              onVisit={() => navigate("contact")}
              menuSection={
                <JunctionMenu
                  products={products}
                  categories={categories}
                  onChoose={setCustomizingProduct}
                />
              }
              offersSection={
                <section
                  id="offers"
                  className="junction-home-offers"
                  aria-labelledby="home-offers-title"
                >
                  <div className="junction-section-heading">
                    <div>
                      <span className="station-label">ON THE OFFERS BOARD</span>
                      <h2 id="home-offers-title">
                        A little extra
                        <br />
                        <em>for your journey.</em>
                      </h2>
                    </div>
                    <p>
                      Current offers and rewards,
                      <br />
                      right here at the junction.
                    </p>
                  </div>
                  {currentOffers.length ? (
                    <OffersAndContestsView
                      offers={currentOffers}
                      currentPass={currentPass}
                      onOpenPassModal={() => setIsPassModalOpen(true)}
                      onExploreMenu={() => navigate("menu")}
                    />
                  ) : (
                    <div className="junction-offers-empty">
                      <Ticket size={30} />
                      <div>
                        <h3>Good things are on their way.</h3>
                        <p>
                          There are no active offers right now. Check back for
                          our next special.
                        </p>
                      </div>
                      <button
                        className="station-text-button"
                        onClick={() => navigate("menu")}
                      >
                        Explore the menu
                      </button>
                    </div>
                  )}
                </section>
              }
            />
          </div>
        )}

        {/* ================= TAB 3: PERSONAL DRINK MONITOR & HABIT TRACKER (NO COST) ================= */}
        {activeTab === "monitor" && (
          <CustomerDrinkMonitor
            currentPass={currentPass}
            orders={onlineOrders.filter(
              (order) => order.pnr === currentPass?.pnr,
            )}
            onOpenRegister={() => setIsPassModalOpen(true)}
            onExploreMenu={() => navigate("menu")}
          />
        )}
      </main>

      {isHomePage && <TrainMarquee />}
      {/* Footer */}
      <footer className="junction-final-footer">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Train className="w-4 h-4 text-amber-400" />
            <span className="font-black tracking-widest uppercase">
              Froosh Junction • Entally, Kolkata – 700014
            </span>
          </div>
          <p className="text-slate-400 text-[11px] font-sans">
            Phone: +91 8013726751 • Instagram: @frooshjunction • Station Code:
            FRSH
          </p>
        </div>
      </footer>

      {/* Floating Mobile Dock */}
      <CustomerMobileDock
        activeTab={activeTab}
        onSelectTab={navigate}
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
        onRedirectToMenu={() => navigate("menu")}
      />

      {customizingProduct && (
        <DrinkCustomizationModal
          key={customizingProduct.id}
          product={customizingProduct}
          isOpen={!!customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

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
