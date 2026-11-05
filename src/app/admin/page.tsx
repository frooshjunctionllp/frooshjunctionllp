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
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { ContestOfferManager } from "@/components/admin/ContestOfferManager";
import { KitchenDisplayScreen } from "@/components/admin/KitchenDisplayScreen";
import { NewOrderNotificationModal } from "@/components/admin/NewOrderNotificationModal";

export default function AdminPortalPage() {
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

  const refreshData = () => {
    storageService.init();
    setCategories(storageService.getCategories());
    setProducts(storageService.getProducts());
    setCustomers(storageService.getCustomers());
    setSales(storageService.getSales());
    setWorkers(storageService.getWorkers());
    setOffers(storageService.getOffers());
    setOnlineOrders(storageService.getOnlineOrders());
    const user = storageService.getCurrentUser();
    // Only accept admin in this console
    if (user && user.role === "admin") {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    setTodayStr(new Date().toISOString().slice(0, 10));
    refreshData();
    setIsLoaded(true);

    // Sync with MongoDB Atlas in background
    storageService.syncFromMongo().then((updates) => {
      if (updates.categories) setCategories(updates.categories);
      if (updates.products) setProducts(updates.products);
      if (updates.customers) setCustomers(updates.customers);
      if (updates.sales) setSales(updates.sales);
      if (updates.workers) setWorkers(updates.workers);
      if (updates.orders) setOnlineOrders(updates.orders);
    });
  }, []);

  // Poll online orders from MongoDB Atlas in real time every 2.5 seconds
  useEffect(() => {
    if (currentUser?.role === "admin") {
      storageService.syncOrdersFromMongo().then((orders) => {
        setOnlineOrders(orders);
      });
      const interval = setInterval(() => {
        storageService.syncOrdersFromMongo().then((orders) => {
          setOnlineOrders(orders);
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Online Order Action Handlers
  const handleConfirmOnlineOrder = async (orderId: string) => {
    await storageService.updateOrderStatus(orderId, "accepted");
    const fresh = await storageService.syncOrdersFromMongo();
    setOnlineOrders(fresh);
  };

  const handleRejectOnlineOrder = async (orderId: string, reason?: string) => {
    await storageService.updateOrderStatus(orderId, "cancelled", { notes: reason });
    const fresh = await storageService.syncOrdersFromMongo();
    setOnlineOrders(fresh);
  };

  const handleModifyOnlineOrder = async (
    orderId: string,
    modifications: { items: any[]; total: number; notes?: string }
  ) => {
    await storageService.updateOrderStatus(orderId, "accepted", modifications);
    const fresh = await storageService.syncOrdersFromMongo();
    setOnlineOrders(fresh);
  };

  const nextCustomerId = useMemo(() => {
    return storageService.getNextCustomerId();
  }, [customers]);

  const nextWorkerId = useMemo(() => {
    return storageService.getNextWorkerId();
  }, [workers]);

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

  const handleSaveCustomer = (customer: Customer) => {
    const updated = storageService.saveCustomer(customer);
    setCustomers(updated);
  };

  const handleRecordSale = (sale: Sale) => {
    const updated = storageService.recordSale(sale);
    setSales(updated);
  };

  const handleDeleteSale = (saleId: string) => {
    const updated = storageService.deleteSale(saleId);
    setSales(updated);
  };

  const handleSaveCategory = (category: Category) => {
    const updated = storageService.saveCategory(category);
    setCategories(updated);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = storageService.deleteCategory(categoryId);
    setCategories(updated);
  };

  const handleSaveProduct = (product: Product) => {
    const updated = storageService.saveProduct(product);
    setProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = storageService.deleteProduct(productId);
    setProducts(updated);
  };

  const handleSaveWorker = (worker: WorkerUser) => {
    const updated = storageService.saveWorker(worker);
    setWorkers(updated);
  };

  const handleDeleteWorker = (workerId: string) => {
    const updated = storageService.deleteWorker(workerId);
    setWorkers(updated);
  };

  const handleLoginSuccess = (user: AuthSession) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
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
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-800 font-sans flex items-center justify-center p-4">
        <div className="text-center space-y-3 font-mono">
          <p className="text-sm font-bold text-red-600 animate-pulse">
            Loading Admin Console...
          </p>
        </div>
      </div>
    );
  }

  // 1. Admin Login Form (Restricted to Admins only)
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AdminLoginForm
        onLoginSuccess={handleLoginSuccess}
        workers={workers}
        onBackToCustomer={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
      />
    );
  }

  // 2. Admin Operations Dashboard (Full store visibility)
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
        onOpenCustomerPortal={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
      />

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

        {activeTab === "kds" && (
          <KitchenDisplayScreen
            orders={onlineOrders}
            currentUser={currentUser}
            onUpdateStatus={handleConfirmOnlineOrder}
          />
        )}

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

        {activeTab === "workers" && (
          <WorkerManagement
            workers={workers}
            onSaveWorker={handleSaveWorker}
            onDeleteWorker={handleDeleteWorker}
            nextWorkerId={nextWorkerId}
            onSwitchUser={handleSwitchToWorker}
          />
        )}

        {activeTab === "sales" && (
          <SalesLog
            sales={sales}
            onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
            onDeleteSale={handleDeleteSale}
          />
        )}

        {activeTab === "reports" && (
          <ReportsAnalytics
            sales={sales}
            customers={customers}
            products={products}
            categories={categories}
            onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
          />
        )}
      </main>

      {/* Live New Order Notification Popup for Admin with FULL details */}
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

      {/* Admin Authentication / Switch User Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        workers={workers}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500 mb-14 md:mb-0 font-mono">
        <p>Froosh Junction • Admin Console • Padma Pukur, Entally, Kolkata – 700014</p>
      </footer>
    </div>
  );
}
