"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Category,
  Customer,
  Product,
  Sale,
  WorkerUser,
  AuthSession,
  ContestOffer,
  OnlineOrder,
} from "@/types";
import { storageService } from "@/services/storageService";
import { Header, ActiveTab } from "@/components/Header";
import { PosTerminal } from "@/components/PosTerminal";
import { MenuManagement } from "@/components/MenuManagement";
import { CustomerManagement } from "@/components/CustomerManagement";
import { WorkerManagement } from "@/components/WorkerManagement";
import { SalesLog } from "@/components/SalesLog";
import { ReportsAnalytics } from "@/components/ReportsAnalytics";
import { ReceiptModal } from "@/components/ReceiptModal";
import { AuthModal } from "@/components/AuthModal";
import { LoginPage } from "@/components/LoginPage";
import { CustomerView } from "@/components/customer/CustomerView";
import { ContestOfferManager } from "@/components/admin/ContestOfferManager";
import { KitchenDisplayScreen } from "@/components/admin/KitchenDisplayScreen";
import { NewOrderNotificationModal } from "@/components/admin/NewOrderNotificationModal";
import { Shield, Sparkles, User, LogOut } from "lucide-react";

export default function Home() {
  const [portalMode, setPortalMode] = useState<"customer" | "staff">("customer");
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [offers, setOffers] = useState<ContestOffer[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayStr, setTodayStr] = useState<string>("");

  // Load data from StorageService & trigger background MongoDB Atlas sync
  const refreshData = () => {
    storageService.init();
    setCategories(storageService.getCategories());
    setProducts(storageService.getProducts());
    setCustomers(storageService.getCustomers());
    setSales(storageService.getSales());
    setWorkers(storageService.getWorkers());
    setOffers(storageService.getOffers());
    setOnlineOrders(storageService.getOnlineOrders());
    setCurrentUser(storageService.getCurrentUser());
  };

  useEffect(() => {
    setTodayStr(new Date().toISOString().slice(0, 10));
    refreshData();
    setIsLoaded(true);

    // Sync with MongoDB in background and update states
    storageService.syncFromMongo().then((updates) => {
      if (updates.categories) setCategories(updates.categories);
      if (updates.products) setProducts(updates.products);
      if (updates.customers) setCustomers(updates.customers);
      if (updates.sales) setSales(updates.sales);
      if (updates.workers) setWorkers(updates.workers);
      if (updates.orders) setOnlineOrders(updates.orders);
    });
  }, []);

  // Poll online orders from MongoDB in real time for staff & admin
  useEffect(() => {
    if (portalMode === "staff" && currentUser) {
      storageService.syncOrdersFromMongo().then((orders) => {
        setOnlineOrders(orders);
      });
      const interval = setInterval(() => {
        storageService.syncOrdersFromMongo().then((orders) => {
          setOnlineOrders(orders);
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [portalMode, currentUser]);

  // Online Order Action Handlers
  const handleConfirmOnlineOrder = (orderId: string) => {
    storageService.updateOrderStatus(orderId, "accepted");
    setOnlineOrders(storageService.getOnlineOrders());
  };

  const handleRejectOnlineOrder = (orderId: string, reason?: string) => {
    storageService.updateOrderStatus(orderId, "cancelled", { notes: reason });
    setOnlineOrders(storageService.getOnlineOrders());
  };

  const handleModifyOnlineOrder = (
    orderId: string,
    modifications: { items: any[]; total: number; notes?: string }
  ) => {
    storageService.updateOrderStatus(orderId, "accepted", modifications);
    setOnlineOrders(storageService.getOnlineOrders());
  };

  const isAdmin = currentUser?.role === "admin";
  const isWorker = currentUser?.role === "worker";

  // Security guard: If worker tries to access sales, reports, or worker management, redirect to POS
  useEffect(() => {
    if (
      isWorker &&
      (activeTab === "sales" || activeTab === "reports" || activeTab === "workers")
    ) {
      setActiveTab("pos");
    }
  }, [isWorker, activeTab]);

  // Next available Customer ID (e.g. "009")
  const nextCustomerId = useMemo(() => {
    return storageService.getNextCustomerId();
  }, [customers]);

  // Next available Worker ID (e.g. "WRK-003")
  const nextWorkerId = useMemo(() => {
    return storageService.getNextWorkerId();
  }, [workers]);

  // Today's summary stats for header ticker
  const headerStats = useMemo(() => {
    if (!todayStr) {
      return {
        todaySalesCount: 0,
        todayRevenue: 0,
        totalCustomers: customers.length,
      };
    }
    const todaySales = sales.filter((s) => s.date.startsWith(todayStr));
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);

    return {
      todaySalesCount: todaySales.length,
      todayRevenue,
      totalCustomers: customers.length,
    };
  }, [todayStr, sales, customers]);

  // Handlers for Customers
  const handleSaveCustomer = (customer: Customer) => {
    const updated = storageService.saveCustomer(customer);
    setCustomers(updated);
  };

  // Handlers for Sales
  const handleRecordSale = (sale: Sale) => {
    const updated = storageService.recordSale(sale);
    setSales(updated);
  };

  const handleDeleteSale = (saleId: string) => {
    const updated = storageService.deleteSale(saleId);
    setSales(updated);
  };

  // Handlers for Categories
  const handleSaveCategory = (category: Category) => {
    const updated = storageService.saveCategory(category);
    setCategories(updated);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = storageService.deleteCategory(categoryId);
    setCategories(updated);
  };

  // Handlers for Products
  const handleSaveProduct = (product: Product) => {
    const updated = storageService.saveProduct(product);
    setProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = storageService.deleteProduct(productId);
    setProducts(updated);
  };

  // Handlers for Workers
  const handleSaveWorker = (worker: WorkerUser) => {
    const updated = storageService.saveWorker(worker);
    setWorkers(updated);
  };

  const handleDeleteWorker = (workerId: string) => {
    const updated = storageService.deleteWorker(workerId);
    setWorkers(updated);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: AuthSession) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
    if (user.role === "worker") {
      setActiveTab("pos");
    }
  };

  const handleSwitchToWorker = (worker: WorkerUser) => {
    const session: AuthSession = {
      id: worker.id,
      username: worker.username,
      name: worker.name,
      role: worker.role,
    };
    storageService.setCurrentUser(session);
    setCurrentUser(session);
    if (worker.role === "worker") {
      setActiveTab("pos");
    }
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setPortalMode("customer");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-800 font-sans flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-sm font-bold text-red-600 font-mono">
            Loading Froosh Junction Platform...
          </p>
        </div>
      </div>
    );
  }

  // ================= 1. PUBLIC CUSTOMER QR STOREFRONT =================
  if (portalMode === "customer") {
    return (
      <CustomerView
        categories={categories}
        products={products}
        onOpenStaffLogin={() => setPortalMode("staff")}
      />
    );
  }

  // ================= 2. STAFF / ADMIN LOGIN GATEWAY =================
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        workers={workers}
        onBackToCustomer={() => setPortalMode("customer")}
      />
    );
  }

  // ================= 3. STAFF / ADMIN OPERATIONS DASHBOARD =================
  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-800 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={headerStats}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenCustomerPortal={() => setPortalMode("customer")}
      />

      {/* Worker Banner (when logged in as worker) */}
      {isWorker && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mt-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong>Worker Mode Active:</strong> Logged in as{" "}
                <span className="font-bold underline">{currentUser?.name}</span> (
                {currentUser?.id}). Sales logs and business reports are restricted.
              </span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            >
              Switch Account
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === "pos" && (
          <PosTerminal
            categories={categories}
            products={products}
            customers={customers}
            onSaveCustomer={handleSaveCustomer}
            onRecordSale={handleRecordSale}
            onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
            nextCustomerId={nextCustomerId}
            currentWorker={currentUser}
          />
        )}

        {activeTab === "kds" && <KitchenDisplayScreen />}

        {activeTab === "offers" && (
          <ContestOfferManager
            offers={offers}
            products={products}
            onOffersUpdated={(updated) => setOffers(updated)}
          />
        )}

        {activeTab === "menu" && (
          <MenuManagement
            categories={categories}
            products={products}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === "customers" && (
          <CustomerManagement
            customers={customers}
            sales={sales}
            onSaveCustomer={handleSaveCustomer}
            nextCustomerId={nextCustomerId}
            onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
          />
        )}

        {/* Admin Only Tabs */}
        {isAdmin && activeTab === "workers" && (
          <WorkerManagement
            workers={workers}
            onSaveWorker={handleSaveWorker}
            onDeleteWorker={handleDeleteWorker}
            nextWorkerId={nextWorkerId}
            onSwitchUser={handleSwitchToWorker}
          />
        )}

        {isAdmin && activeTab === "sales" && (
          <SalesLog
            sales={sales}
            onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
            onDeleteSale={handleDeleteSale}
          />
        )}

        {isAdmin && activeTab === "reports" && (
          <ReportsAnalytics
            sales={sales}
            customers={customers}
            products={products}
            categories={categories}
            onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
          />
        )}
      </main>

      {/* Live New Order Notification Popup for Admin & Workers */}
      <NewOrderNotificationModal
        orders={onlineOrders}
        currentUser={currentUser}
        onConfirmOrder={handleConfirmOnlineOrder}
        onRejectOrder={handleRejectOnlineOrder}
        onModifyOrder={handleModifyOnlineOrder}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        sale={activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
      />

      {/* Staff Authentication / Switch User Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        workers={workers}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500 mb-14 md:mb-0">
        <p>
          Froosh Junction • Platform Juice & Shake Destination • Entally, Kolkata – 700014
        </p>
      </footer>
    </div>
  );
}
