"use client";

import React from "react";
import { CustomerPass } from "@/types";
import {
  GlassWater,
  Flame,
  ShoppingBag,
  User,
  Sparkles,
  Ticket,
} from "lucide-react";

interface CustomerMobileDockProps {
  activeTab: "home" | "menu" | "monitor" | "offers" | "contact";
  onSelectTab: (tab: "home" | "menu" | "monitor" | "offers" | "contact") => void;
  cartCount: number;
  onOpenCart: () => void;
  currentPass: CustomerPass | null;
  onOpenProfile: () => void;
}

export const CustomerMobileDock: React.FC<CustomerMobileDockProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  currentPass,
  onOpenProfile,
}) => {
  return (
    <div className="fixed bottom-3 inset-x-3 sm:hidden z-40 max-w-md mx-auto">
      <div className="bg-slate-950/95 backdrop-blur-md text-amber-300 border-2 border-amber-400 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.6)] px-2 py-1.5 flex items-center justify-around font-mono">
        {/* Menu Tab */}
        <button
          onClick={() => onSelectTab("menu")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === "menu"
              ? "bg-amber-400 text-slate-950 font-black scale-105"
              : "text-amber-300 hover:text-white"
          }`}
        >
          <GlassWater className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5">
            Menu
          </span>
        </button>

        {/* My Drinks & Habit Monitor Tab */}
        <button
          onClick={() => onSelectTab("monitor")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === "monitor"
              ? "bg-amber-400 text-slate-950 font-black scale-105"
              : "text-amber-300 hover:text-white"
          }`}
        >
          <Flame className="w-4 h-4 text-red-500" />
          <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5">
            My Drinks
          </span>
          {/* Subtle pulse indicator if user has drink activity */}
          {currentPass && (
            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        {/* Cart / Ticket Button */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-amber-300 hover:text-white transition-all cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono border border-slate-950">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5">
            Ticket
          </span>
        </button>

        {/* Profile / Register Tab */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-amber-300 hover:text-white transition-all cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold tracking-tight mt-0.5 truncate max-w-14">
            {currentPass ? currentPass.name.split(" ")[0] : "Register"}
          </span>
        </button>
      </div>
    </div>
  );
};
