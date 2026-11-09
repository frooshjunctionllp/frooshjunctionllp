"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Customer,
  Sale,
  AuthSession,
  OnlineOrder,
} from "@/types";
import { useAppState } from "@/state/AppState";
import { storageService } from "@/services/storageService";
import { Header, ActiveTab } from "@/components/Header";
import { PosTerminal } from "@/components/PosTerminal";
import { KitchenDisplayScreen } from "@/components/admin/KitchenDisplayScreen";
import { NewOrderNotificationModal } from "@/components/admin/NewOrderNotificationModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { StaffLoginForm } from "@/components/StaffLoginForm";

export default function StaffPortalPage() {
  const router = useRouter();
  // Staff is restricted strictly to "pos" and "kds"
  const { categories, products, customers, workers, onlineOrders, currentUser, isLoaded } = useAppState();
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  // Poll online orders from MongoDB in real time every 2.5 seconds
  useEffect(() => {
    if (currentUser?.id) {
      void storageService.syncOrdersFromMongo();
      const interval = setInterval(() => {
        void storageService.syncOrdersFromMongo();
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  // Online Order Action Handlers
  const handleConfirmOnlineOrder = async (orderId: string) => {
    await storageService.updateOrderStatus(orderId, "accepted");
    await storageService.syncOrdersFromMongo();
  };

  const handleRejectOnlineOrder = async (orderId: string, reason?: string) => {
    await storageService.updateOrderStatus(orderId, "cancelled", { notes: reason });
    await storageService.syncOrdersFromMongo();
  };

  const handleModifyOnlineOrder = async (
    orderId: string,
    modifications: { items: OnlineOrder["items"]; total: number; notes?: string }
  ) => {
    await storageService.updateOrderStatus(orderId, "accepted", modifications);
    await storageService.syncOrdersFromMongo();
  };

  const nextCustomerId = useMemo(() => {
    return storageService.getNextCustomerId(customers);
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
    storageService.saveCustomer(customer);
  };

  const handleRecordSale = (sale: Sale) => {
    storageService.recordSale(sale);
  };

  const handleLoginSuccess = (user: AuthSession) => {
    storageService.setCurrentUser(user);

    setActiveTab("pos");
  };

  const handleLogout = () => {
    storageService.logout();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-800 font-sans flex items-center justify-center p-4">
        <div className="text-center space-y-4 font-mono max-w-sm mx-auto">
          <div className="flex justify-center mb-2">
            <img
              src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png"
              alt="Froosh Junction"
              className="h-16 w-auto object-contain animate-pulse"
            />
          </div>
          <div className="relative inline-flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 rounded-full border-3 border-amber-400 border-t-emerald-600 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
            router.push("/");
          }
        }}
      />
    );
  }

  // 2. Staff Operations Portal (Locked strictly to POS & KDS Order Confirmation)
  return (
    <div className="dashboard-shell flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => { if (tab === "pos" || tab === "kds") setActiveTab(tab); }}
        stats={headerStats}
        currentUser={{ ...currentUser, role: "worker" }} // Force worker scope: strictly hides sales & reports
        onOpenAuthModal={() => {}}
        onLogout={handleLogout}
        onOpenCustomerPortal={() => {
          if (typeof window !== "undefined") {
            router.push("/");
          }
        }}
      />

      {/* Main Content Body: ONLY POS AND KDS ALLOWED */}
      <main id="dashboard-content" tabIndex={-1} className="dashboard-workspace">
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
