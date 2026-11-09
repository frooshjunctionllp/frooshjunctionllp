"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Category,
  Customer,
  Product,
  Sale,
  WorkerUser,
  AuthSession,
  OnlineOrder,
} from "@/types";
import { useAppState } from "@/state/AppState";
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
  const router = useRouter();
  const { categories, products, customers, workers, onlineOrders, currentUser, sales, offers, isLoaded, todayStr } = useAppState();
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  // Poll online orders from MongoDB Atlas in real time every 2.5 seconds
  useEffect(() => {
    if (currentUser?.role === "admin") {
      void storageService.syncOrdersFromMongo();
      const interval = setInterval(() => {
        void storageService.syncOrdersFromMongo();
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id, currentUser?.role]);

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

  const nextWorkerId = useMemo(() => {
    return storageService.getNextWorkerId(workers);
  }, [workers]);

  const headerStats = useMemo(() => {
    if (!todayStr) {
      return {
        todaySalesCount: 0,
        todayRevenue: 0,
        totalCustomers: customers.length,
      };
    }
    const businessDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
    const todaySales = sales.filter((sale) => {
      const date = new Date(sale.date);
      return !Number.isNaN(date.getTime()) && businessDate.format(date) === todayStr;
    });
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);

    return {
      todaySalesCount: todaySales.length,
      todayRevenue,
      totalCustomers: customers.length,
    };
  }, [todayStr, sales, customers]);

  const handleSaveCustomer = (customer: Customer) => {
    storageService.saveCustomer(customer);
  };

  const handleRecordSale = (sale: Sale) => {
    storageService.recordSale(sale);
  };

  const handleDeleteSale = (saleId: string) => {
    storageService.deleteSale(saleId);
  };

  const handleSaveCategory = async (category: Category) => {
    await storageService.saveCategory(category);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await storageService.deleteCategory(categoryId);
  };

  const handleSaveProduct = async (product: Product) => {
    await storageService.saveProduct(product);
  };

  const handleDeleteProduct = async (productId: string) => {
    await storageService.deleteProduct(productId);
  };

  const handleSaveWorker = (worker: WorkerUser) => {
    storageService.saveWorker(worker);
  };

  const handleDeleteWorker = (workerId: string) => {
    storageService.deleteWorker(workerId);
  };

  const handleLoginSuccess = (user: AuthSession) => {
    storageService.setCurrentUser(user);
  };

  const handleSwitchToWorker = (worker: WorkerUser) => {
    const session: AuthSession = {
      id: worker.id,
      username: worker.username,
      name: worker.name,
      role: worker.role,
    };
    storageService.setCurrentUser(session);
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
            <div className="absolute inset-0 rounded-full border-3 border-amber-400 border-t-red-600 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Loading Admin Security Console...
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
            router.push("/");
          }
        }}
      />
    );
  }

  // 2. Admin Operations Dashboard (Full store visibility)
  return (
    <div className="dashboard-shell flex flex-col font-sans">
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
            router.push("/");
          }
        }}
      />

      {/* Main Content Body */}
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
            currentUser={currentUser}
            onUpdateStatus={handleConfirmOnlineOrder}
          />
        )}

        {activeTab === "offers" && (
          <ContestOfferManager
            offers={offers}
            products={products}
            onOffersUpdated={() => {}}
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
