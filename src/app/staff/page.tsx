"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Category,
  Customer,
  Product,
  Sale,
  WorkerUser,
  AuthSession,
  OnlineOrder,
} from "@/types";
import { storageService } from "@/services/storageService";
import { Header, ActiveTab } from "@/components/Header";
import { PosTerminal } from "@/components/PosTerminal";
import { KitchenDisplayScreen } from "@/components/admin/KitchenDisplayScreen";
import { NewOrderNotificationModal } from "@/components/admin/NewOrderNotificationModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { StaffLoginForm } from "@/components/StaffLoginForm";

export default function StaffPortalPage() {
  // Staff is restricted strictly to "pos" and "kds"
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshData = () => {
    storageService.init();
    setCategories(storageService.getCategories());
    setProducts(storageService.getProducts());
    setCustomers(storageService.getCustomers());
    setWorkers(storageService.getWorkers());
    setOnlineOrders(storageService.getOnlineOrders());
    const user = storageService.getCurrentUser();
    // Accept worker or staff session
    setCurrentUser(user);
  };

  useEffect(() => {
    refreshData();
    setIsLoaded(true);

    // Sync categories & products from MongoDB
    storageService.syncFromMongo().then((updates) => {
      if (updates.categories) setCategories(updates.categories);
      if (updates.products) setProducts(updates.products);
      if (updates.customers) setCustomers(updates.customers);
      if (updates.workers) setWorkers(updates.workers);
      if (updates.orders) setOnlineOrders(updates.orders);
    });
  }, []);

  // Poll online orders from MongoDB in real time every 2.5 seconds
  useEffect(() => {
    if (currentUser) {
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

  // Strict guard: Workers can NEVER be on sales, reports, workers, menu, or offers
  useEffect(() => {
    if (activeTab !== "pos" && activeTab !== "kds") {
      setActiveTab("pos");
    }
  }, [activeTab]);

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

  // Header stats for worker: ZERO revenue exposed
  const headerStats = useMemo(() => {
    return {
      todaySalesCount: 0,
      todayRevenue: 0,
      totalCustomers: customers.length,
    };
  }, [customers]);

  const handleSaveCustomer = (customer: Customer) => {
    const updated = storageService.saveCustomer(customer);
    setCustomers(updated);
  };

  const handleRecordSale = (sale: Sale) => {
    storageService.recordSale(sale);
  };

  const handleLoginSuccess = (user: AuthSession) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab("pos");
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-800 font-sans flex items-center justify-center p-4">
        <div className="text-center space-y-3 font-mono">
          <p className="text-sm font-bold text-emerald-600 animate-pulse">
            Loading Staff Terminal...
          </p>
        </div>
      </div>
    );
  }

  // 1. Staff Login Gateway (Dedicated to staff)
  if (!currentUser) {
    return (
      <StaffLoginForm
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

  // 2. Staff Operations Portal (Locked strictly to POS & KDS Order Confirmation)
  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-800 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={headerStats}
        currentUser={{ ...currentUser, role: "worker" }} // Force worker scope: strictly hides sales & reports
        onOpenAuthModal={() => {}}
        onLogout={handleLogout}
        onOpenCustomerPortal={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
      />

      {/* Staff Operational Shift Banner */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-3">
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>Active Shift:</strong> Logged in as{" "}
              <span className="font-bold underline text-emerald-950">{currentUser?.name}</span>{" "}
              ({currentUser?.id || currentUser?.username}) • Order Intake & Ticket Dispatch Mode
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
          >
            End Shift / Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Body: ONLY POS AND KDS ALLOWED */}
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
            currentUser={{ ...currentUser, role: "worker" }}
            onUpdateStatus={handleConfirmOnlineOrder}
          />
        )}
      </main>

      {/* Live New Order Notification Popup for Staff (Customer Name ONLY, No phone or sales) */}
      <NewOrderNotificationModal
        orders={onlineOrders}
        currentUser={{ ...currentUser, role: "worker" }}
        onConfirmOrder={handleConfirmOnlineOrder}
        onRejectOrder={handleRejectOnlineOrder}
        onModifyOrder={handleModifyOnlineOrder}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        sale={activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500 mb-14 md:mb-0 font-mono">
        <p>Froosh Junction • Staff Terminal • Padma Pukur, Entally, Kolkata – 700014</p>
      </footer>
    </div>
  );
}
