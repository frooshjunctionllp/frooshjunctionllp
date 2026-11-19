"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowUpRight, CupSoda, MapPin, Plus, Search, ShoppingBag,
  Ticket, TrainFront,
} from "lucide-react";
import type {
  Category, Product, CustomerPass, ContestOffer, RewardVoucher,
  OnlineOrderItem, OnlineOrder, ProductVariant, OrderItemCustomization,
} from "@/types";
import { storageService } from "@/services/storageService";
import { PassengerRailPassModal } from "./PassengerRailPassModal";
import { DrinkCustomizationModal } from "./DrinkCustomizationModal";
import { TicketCheckoutModal } from "./TicketCheckoutModal";
import { LiveOrderTrackerModal } from "./LiveOrderTrackerModal";
import { OffersAndContestsView } from "./OffersAndContestsView";
import { CustomerDrinkMonitor } from "./CustomerDrinkMonitor";
import { FrooshMarquee } from "./FrooshMarquee";

const stops = [
  { id: "menu", name: "Menu" },
  { id: "monitor", name: "My Drinks" },
  { id: "offers", name: "Offers" },
  { id: "contact", name: "Find Us" },
];

function exploreMenu() {
  window.location.hash = "menu";
  document.getElementById("menu")?.focus({ preventScroll: true });
}

function DrinkPhoto({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="fj-drinkPhoto">
      {product.imageUrl && !failed ? (
        <Image
          src={product.imageUrl}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 300px"
          onError={() => setFailed(true)}
        />
      ) : (
        <CupSoda size={44} strokeWidth={1.3} aria-hidden="true" />
      )}
    </div>
  );
}

export function CustomerView({ fontClassName }: { fontClassName: string }) {
  const [catalog, setCatalog] = useState<{ categories: Category[]; products: Product[] } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPass, setCurrentPass] = useState<CustomerPass | null>(null);
  const [offers, setOffers] = useState<ContestOffer[]>([]);
  const [vouchers, setVouchers] = useState<RewardVoucher[]>([]);
  const [cartItems, setCartItems] = useState<OnlineOrderItem[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [trackedOrder, setTrackedOrder] = useState<OnlineOrder | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  function refreshPassenger() {
    const pass = storageService.getCurrentCustomerPass();
    setCurrentPass(pass);
    setVouchers(pass ? storageService.getVouchersByPnr(pass.pnr) : []);
  }

  useEffect(() => {
    let mounted = true;
    async function loadStorefront() {
      const cachedCatalog = {
        categories: storageService.getCategories(),
        products: storageService.getProducts(),
      };
      setCatalog(cachedCatalog);
      refreshPassenger();
      setOffers(storageService.getOffers());
      setOnlineOrders(storageService.getOnlineOrders());

      const { categories, products } = await storageService.syncFromMongo();
      if (mounted) {
        setCatalog({
          categories: categories ?? cachedCatalog.categories,
          products: products ?? cachedCatalog.products,
        });
      }
    }
    queueMicrotask(() => {
      if (mounted) void loadStorefront();
    });

    async function syncOrders() {
      const orders = await storageService.syncOrdersFromMongo();
      if (mounted) setOnlineOrders(orders);
    }
    void syncOrders();
    const pollInterval = window.setInterval(syncOrders, 4000);

    return () => {
      mounted = false;
      window.clearInterval(pollInterval);
    };
  }, []);

  const catalogReady = catalog !== null;
  useEffect(() => {
    if (!catalogReady) return;
    const url = new URL(window.location.href);
    const legacyStop = stops.find(({ id }) => id === url.searchParams.get("tab"));

    // Existing sign-in, registration, and shared URLs used query-string tabs.
    if (!url.hash && legacyStop) {
      url.searchParams.delete("tab");
      url.hash = legacyStop.id;
      window.history.replaceState(window.history.state, "", url);
    }

    const stop = stops.find(({ id }) => `#${id}` === url.hash);
    if (stop) document.getElementById(stop.id)?.scrollIntoView();
  }, [catalogReady]);

  function addToCart(
    product: Product,
    variant: ProductVariant,
    quantity: number,
    customization: OrderItemCustomization,
    finalPrice: number,
  ) {
    setCartItems((items) => [...items, {
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      variantId: variant.id,
      variantName: variant.name,
      unitPrice: variant.price,
      quantity,
      total: finalPrice,
      customization,
    }]);
  }

  function handleOrderPlaced(order: OnlineOrder) {
    setIsCheckoutModalOpen(false);
    setOnlineOrders(storageService.getOnlineOrders());
    setTrackedOrder(order);
    refreshPassenger();
  }

  const categories = catalog?.categories ?? [];
  const category = categories.some(({ id }) => id === selectedCategory) ? selectedCategory : "all";
  const query = searchQuery.trim().toLowerCase();
  const drinks = (catalog?.products ?? []).filter((product) =>
    product.isAvailable !== false
    && (category === "all" || product.categoryId === category)
    && (product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query)),
  );
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const activeOrder = currentPass && onlineOrders.find((order) =>
    order.pnr === currentPass.pnr
    && order.orderStatus !== "completed"
    && order.orderStatus !== "cancelled",
  );
  const latestTrackedOrder = onlineOrders.find((order) => order.id === trackedOrder?.id) ?? trackedOrder;

  return (
    <div className={`fj-storefront ${fontClassName}`} id="top">
      <a className="fj-skipLink" href="#menu">Skip to the menu</a>
      <header className="fj-header">
        <div className="fj-headerInner">
          <a href="#top" className="fj-brand" aria-label="Froosh Junction home">
            <span className="fj-brandMark"><TrainFront size={22} strokeWidth={2.5} /></span>
            <span>Froosh Junction</span>
          </a>
          <nav className="fj-nav" aria-label="Station stops">
            {stops.map(({ id, name }) => <a key={id} href={`#${id}`}>{name}</a>)}
          </nav>
          <div className="fj-headerActions">
            {currentPass ? (
              <button type="button" className="fj-passLink" aria-label="Rail Pass" onClick={() => setIsPassModalOpen(true)}>
                <Ticket size={17} aria-hidden="true" /> <span className="fj-passLabel">Rail Pass</span>
              </button>
            ) : (
              <Link className="fj-passLink" href="/login">Sign in</Link>
            )}
            <button type="button" className="fj-ticket" onClick={() => setIsCheckoutModalOpen(true)}>
              <ShoppingBag size={16} aria-hidden="true" />
              <span>Ticket</span>
              <span className="fj-ticketCount" aria-live="polite">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="fj-heroWrap" aria-labelledby="hero-title">
          <div className="fj-hero">
            <div className="fj-heroCopy">
              <div className="fj-stationSign">
                <MapPin size={15} aria-hidden="true" />
                Entally <span aria-hidden="true">/</span> Kolkata
                <span className="fj-stationBengali" lang="bn">কলকাতা</span>
              </div>
              <h1 id="hero-title">Next stop:<br /><em>Fresh.</em></h1>
              <p>Fresh juices, thick shakes, and a little Kolkata railway nostalgia.</p>
              <div className="fj-heroActions">
                <a className="fj-primaryButton" href="#menu">Explore the menu <ArrowDown size={17} /></a>
                {activeOrder && (
                  <button type="button" className="fj-trackButton" onClick={() => setTrackedOrder(activeOrder)}>
                    Track order <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="fj-heroArt">
              <Image
                src="/froosh-express.webp"
                alt="An Indian passenger train winds past giant mango juice and strawberry shake cups."
                fill
                preload
                sizes="(max-width: 720px) 95vw, (max-width: 1330px) 54vw, 715px"
              />
            </div>
          </div>
        </section>

        <FrooshMarquee />

        <section className="fj-menu" id="menu" tabIndex={-1} aria-labelledby="menu-title">
          <div className="fj-lineSign" aria-hidden="true"><TrainFront size={17} /> Platform Menu</div>
          <h2 id="menu-title">Pick your sip.</h2>
          <div className="fj-menuControls">
            <div className="fj-platforms" role="group" aria-label="Filter by drink category">
              <button type="button" aria-pressed={category === "all"} onClick={() => setSelectedCategory("all")}>
                All drinks
              </button>
              {categories.map((item) => (
                <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setSelectedCategory(item.id)}>
                  {item.name}
                </button>
              ))}
            </div>
            <label className="fj-search">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search drinks</span>
              <input type="search" placeholder="Search drinks" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </label>
          </div>

          {!catalog ? (
            <p className="fj-empty" role="status">Loading the menu…</p>
          ) : drinks.length === 0 ? (
            <div className="fj-empty">
              <p role="status">{query ? "No drinks match your search." : "No drinks are available here right now."}</p>
              {(query || category !== "all") && (
                <button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                  Show all drinks
                </button>
              )}
            </div>
          ) : (
            <ul className="fj-drinkGrid">
              {drinks.map((product) => {
                const variants = product.variants.filter((variant) => variant.isAvailable !== false);
                const fromPrice = Math.min(...variants.map(({ price }) => price));
                return (
                  <li className="fj-drinkCard" key={product.id}>
                    <DrinkPhoto key={product.imageUrl} product={product} />
                    <div className="fj-drinkInfo">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      {variants.length > 0 ? (
                        <div className="fj-drinkOrder">
                          <span><small>From</small> ₹{fromPrice}</span>
                          <button type="button" aria-label={`Customize ${product.name}`} onClick={() => setCustomizingProduct({ ...product, variants })}>
                            <Plus size={16} aria-hidden="true" /> Add
                          </button>
                        </div>
                      ) : (
                        <p className="fj-soldOut">Sold out</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section id="monitor" className="fj-sideStop" aria-label="My Drinks">
          <CustomerDrinkMonitor
            currentPass={currentPass}
            orders={onlineOrders}
            onOpenRegister={() => setIsPassModalOpen(true)}
            onExploreMenu={exploreMenu}
          />
        </section>

        <section id="offers" className="fj-sideStop" aria-label="Offers and contests">
          <OffersAndContestsView
            offers={offers}
            currentPass={currentPass}
            onOpenPassModal={() => setIsPassModalOpen(true)}
            onExploreMenu={exploreMenu}
          />
        </section>
      </main>

      <footer id="contact" className="fj-footer">
        <div className="fj-footerInner">
          <div>
            <h2>Find the junction.</h2>
            <address>Padma Pukur, Bihar Bus Stand<br />Entally, Kolkata 700014</address>
            <p>Daily, 10 am to 11:30 pm IST</p>
          </div>
          <div className="fj-footerLinks">
            <a href="tel:+918013726751">+91 80137 26751 <ArrowUpRight size={15} /></a>
            <a href="https://instagram.com/frooshjunction" target="_blank" rel="noreferrer">@frooshjunction <ArrowUpRight size={15} /></a>
            {!currentPass && <Link href="/register">Register for a Rail Pass <ArrowUpRight size={15} /></Link>}
          </div>
        </div>
      </footer>

      <PassengerRailPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        currentPass={currentPass}
        onPassUpdated={refreshPassenger}
        vouchers={vouchers}
        onRedirectToMenu={exploreMenu}
      />

      {customizingProduct && (
        <DrinkCustomizationModal
          product={customizingProduct}
          isOpen
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={addToCart}
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

      {latestTrackedOrder && (
        <LiveOrderTrackerModal order={latestTrackedOrder} isOpen onClose={() => setTrackedOrder(null)} />
      )}
    </div>
  );
}
