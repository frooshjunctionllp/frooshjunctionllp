"use client";

import React, { useEffect, useState } from "react";
import {
  Store,
  Layers,
  Users,
  BarChart3,
  Receipt,
  Sparkles,
  Clock,
  Briefcase,
  Shield,
  User,
  ArrowRightLeft,
  LogOut,
  ChefHat,
  Trophy,
  Globe,
  Train,
} from "lucide-react";
import { AuthSession } from "@/types";

export type ActiveTab =
  | "pos"
  | "kds"
  | "offers"
  | "menu"
  | "customers"
  | "workers"
  | "sales"
  | "reports";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: {
    todaySalesCount: number;
    todayRevenue: number;
    totalCustomers: number;
  };
  currentUser: AuthSession | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenCustomerPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenCustomerPortal,
}) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = currentUser?.role === "admin";

  // Navigation tabs filtered strictly by role:
  // Worker CANNOT see sales or reports!
  const allNavItems: {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
  }[] = [
    {
      id: "pos",
      label: "POS Order",
      shortLabel: "POS",
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: "kds",
      label: "Orders",
      shortLabel: "Orders",
      icon: <ChefHat className="w-4 h-4" />,
    },
    {
      id: "offers",
      label: "Contests & Deals",
      shortLabel: "Contests",
      icon: <Trophy className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: "menu",
      label: "Menu & Items",
      shortLabel: "Menu",
      icon: <Layers className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: "customers",
      label: "Customers",
      shortLabel: "Clients",
      icon: <Users className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: "workers",
      label: "Staff & Workers",
      shortLabel: "Workers",
      icon: <Briefcase className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: "sales",
      label: "Sales Log",
      shortLabel: "Sales",
      icon: <Receipt className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: "reports",
      label: "Reports & BI",
      shortLabel: "Reports",
      icon: <BarChart3 className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const visibleNavItems = allNavItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <>
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png"
              alt="Froosh Junction"
              className="h-9 sm:h-11 w-auto object-contain"
            />
            <div className="flex flex-col hidden sm:flex">
              <span className="font-pixel text-[11px] text-slate-900 tracking-wider">
                OPERATIONS PORTAL
              </span>
              <p className="text-[10px] text-slate-500 font-medium">
                Live POS & Real-Time Orders
              </p>
            </div>

            {/* Dashboard role pill */}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-red-50 text-red-700 border-red-200/80"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3" />
                  <span>Worker Shift</span>
                </>
              )}
            </span>
          </div>

          {/* User profile & Stats Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Ticker: Admin sees Revenue, Worker sees terminal active info */}
            {isAdmin ? (
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-500 font-medium text-[11px]">
                    Today:
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-red-600">
                    ₹{stats.todayRevenue.toFixed(0)}
                  </span>
                  <span className="text-slate-400 hidden lg:inline font-normal text-[11px]">
                    ({stats.todaySalesCount} orders)
                  </span>
                </div>

                <div className="h-3 w-px bg-slate-200 hidden sm:block" />

                <div className="hidden sm:flex items-center gap-1 text-slate-700 font-medium text-xs">
                  <span className="text-slate-400 text-[11px]">Clients:</span>
                  <span className="font-bold text-slate-800">
                    {stats.totalCustomers}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3 py-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-800 text-[11px] sm:text-xs">
                  Terminal Ready
                </span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">
                  • {currentUser?.name || "Worker"}
                </span>
              </div>
            )}

            {/* Time on large screens */}
            <div className="hidden xl:flex items-center gap-1.5 text-slate-600 font-medium text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 font-semibold">{time || "--:--:--"}</span>
            </div>

            {/* Auth / Switch User Button */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isAdmin
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
              }`}
              title="Switch user or login"
            >
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <User className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className="max-w-[80px] sm:max-w-[110px] truncate">
                {currentUser?.name || "Login"}
              </span>
              <ArrowRightLeft className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Customer Storefront / QR Website View */}
            {onOpenCustomerPortal && (
              <button
                onClick={onOpenCustomerPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="View customer QR storefront & website"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customer (QR)</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200/80 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 text-xs font-semibold transition-all cursor-pointer"
              title="Lock terminal and sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Tabs */}
        <div className="bg-slate-50/70 border-t border-slate-200/60 hidden md:block">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1.5 py-1.5">
            {visibleNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-red-600 shadow-2xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-red-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Filtered by role: 3 tabs for worker, 5 for admin) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-xl">
        <div
          className={`grid py-1.5 ${
            visibleNavItems.length === 3
              ? "grid-cols-3"
              : visibleNavItems.length === 4
              ? "grid-cols-4"
              : "grid-cols-5"
          }`}
        >
          {visibleNavItems.slice(0, 5).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-all cursor-pointer ${
                  isActive
                    ? "text-red-600 font-bold bg-red-50/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    isActive ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] leading-tight block truncate w-full font-medium">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
