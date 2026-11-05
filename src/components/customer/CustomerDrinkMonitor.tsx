"use client";

import React, { useMemo, useState } from "react";
import { CustomerPass, OnlineOrder } from "@/types";
import {
  GlassWater,
  Milk,
  Flame,
  Calendar,
  Sparkles,
  TrendingUp,
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
  Train,
  ArrowRight,
  Filter,
  User,
  Heart,
  Droplets,
  RotateCcw,
} from "lucide-react";

interface CustomerDrinkMonitorProps {
  currentPass: CustomerPass | null;
  orders: OnlineOrder[];
  onOpenRegister: () => void;
  onOrderAgain?: (productName: string, categoryId: string) => void;
  onExploreMenu: () => void;
}

export const CustomerDrinkMonitor: React.FC<CustomerDrinkMonitorProps> = ({
  currentPass,
  orders,
  onOpenRegister,
  onOrderAgain,
  onExploreMenu,
}) => {
  const [filterType, setFilterType] = useState<"all" | "juices" | "shakes">("all");

  // Filter orders associated with this passenger (by PNR, phone, or current session)
  const userOrders = useMemo(() => {
    if (!currentPass) return [];
    return orders.filter(
      (o) =>
        o.pnr === currentPass.pnr ||
        (currentPass.phone && o.customerPhone === currentPass.phone)
    );
  }, [orders, currentPass]);

  // Aggregate all items drunk
  const drinkSummary = useMemo(() => {
    let totalGlasses = 0;
    let juiceCount = 0;
    let shakeCount = 0;
    let smoothieCount = 0;
    const frequencyMap: Record<string, { count: number; categoryId: string; lastDate: string }> = {};

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        totalGlasses += item.quantity;
        if (item.categoryId === "cat-juices") {
          juiceCount += item.quantity;
        } else if (item.categoryId === "cat-shakes") {
          shakeCount += item.quantity;
        } else {
          smoothieCount += item.quantity;
        }

        if (!frequencyMap[item.productName]) {
          frequencyMap[item.productName] = {
            count: 0,
            categoryId: item.categoryId,
            lastDate: order.createdAt,
          };
        }
        frequencyMap[item.productName].count += item.quantity;
      });
    });

    // Fallback to pass stats if no orders yet
    if (totalGlasses === 0 && currentPass?.stats) {
      juiceCount = currentPass.stats.totalJuices || 0;
      shakeCount = currentPass.stats.totalShakes || 0;
      totalGlasses = juiceCount + shakeCount;
    }

    // Sort by most frequent
    const frequencyList = Object.entries(frequencyMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        categoryId: data.categoryId,
        lastDate: data.lastDate,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalGlasses,
      juiceCount,
      shakeCount,
      smoothieCount,
      frequencyList,
      favorite: frequencyList[0]?.name || currentPass?.stats.favoriteItem || "Watermelon Mint Chill",
    };
  }, [userOrders, currentPass]);

  // Weekly intake breakdown by day of week
  const weeklyActivity = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    userOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) {
        const dayName = days[d.getDay()];
        const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
        counts[dayName] = (counts[dayName] || 0) + itemsCount;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    return { days, counts, maxCount };
  }, [userOrders]);

  // Filter history entries
  const filteredOrders = useMemo(() => {
    if (filterType === "all") return userOrders;
    return userOrders.filter((order) =>
      order.items.some((i) =>
        filterType === "juices"
          ? i.categoryId === "cat-juices"
          : i.categoryId === "cat-shakes"
      )
    );
  }, [userOrders, filterType]);

  // 1. Not Logged In View
  if (!currentPass) {
    return (
      <div className="border-3 border-slate-900 bg-white rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#0f172a] text-center space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto border-2 border-slate-950 shadow-[2px_2px_0px_#000]">
          <Flame className="w-8 h-8 text-red-600 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-amber-300 px-3 py-1 rounded-full inline-block">
            Personal Drink Tracker
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-950">
            Monitor How Much Juice & Shakes You Drink
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-md mx-auto">
            Log in with your phone number and name to track your daily hydration,
            what beverages you drink, how often you drink them, and see personal habit charts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/register"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-mono font-black text-xs sm:text-sm px-5 py-3 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_#000] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create New Drink Pass</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-xs sm:text-sm px-5 py-3 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_#000] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In with Phone</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Passenger Header & Wellness Habit Profile */}
      <div className="border-3 border-slate-900 bg-slate-950 text-amber-300 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#0f172a] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center border-2 border-slate-950 shadow-[2px_2px_0px_#fff] shrink-0 font-black text-lg">
              {currentPass.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {currentPass.name}&apos;s Drink Ledger
                </h2>
                <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded font-mono">
                  Active
                </span>
              </div>
              <div className="text-xs text-amber-200/90 flex flex-wrap items-center gap-2 mt-0.5 font-sans">
                <span>📱 {currentPass.phone || "No phone linked"}</span>
                {currentPass.instagramId && (
                  <>
                    <span>•</span>
                    <span className="text-pink-300 font-semibold">{currentPass.instagramId}</span>
                  </>
                )}
                <span>•</span>
                <span className="font-mono text-amber-300">ID: {currentPass.pnr}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onExploreMenu}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_#fff] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <GlassWater className="w-4 h-4" />
            <span>Order Next Drink</span>
          </button>
        </div>

        {/* Decorative Track */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 border-4 border-dashed border-amber-400/15 rounded-full pointer-events-none" />
      </div>

      {/* Key Habit & Consumption Counters (STRICTLY NO COST / PRICES) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Consumed */}
        <div className="border-3 border-slate-900 bg-white rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Consumed</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950">
            {drinkSummary.totalGlasses}
          </div>
          <p className="text-[10px] text-slate-500 font-sans">
            Glasses of fresh blends enjoyed
          </p>
        </div>

        {/* Pure Juices */}
        <div className="border-3 border-slate-900 bg-amber-50 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] space-y-1">
          <div className="flex items-center justify-between text-amber-800 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Cold Juices</span>
            <GlassWater className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {drinkSummary.juiceCount}
          </div>
          <p className="text-[10px] text-amber-900/80 font-sans">
            100% pure cold-pressed fruit
          </p>
        </div>

        {/* Gourmet Shakes */}
        <div className="border-3 border-slate-900 bg-red-50 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] space-y-1">
          <div className="flex items-center justify-between text-red-800 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Thick Shakes</span>
            <Milk className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600">
            {drinkSummary.shakeCount}
          </div>
          <p className="text-[10px] text-red-900/80 font-sans">
            Gourmet dessert thickshakes
          </p>
        </div>

        {/* Top Favorite */}
        <div className="border-3 border-slate-900 bg-amber-400 text-slate-950 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] space-y-1">
          <div className="flex items-center justify-between text-slate-900 text-xs">
            <span className="font-black uppercase tracking-wider text-[10px]">Favorite Beverage</span>
            <Award className="w-4 h-4 text-slate-950" />
          </div>
          <div className="text-xs sm:text-sm font-black truncate" title={drinkSummary.favorite}>
            {drinkSummary.favorite}
          </div>
          <p className="text-[10px] text-slate-800 font-sans font-bold">
            Your most ordered platform drink
          </p>
        </div>
      </div>

      {/* Visual Analytics & Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Graph 1: Weekly Hydration & Intake Frequency */}
        <div className="border-3 border-slate-900 bg-white rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">CONSUMPTION FREQUENCY</span>
              <h3 className="text-sm sm:text-base font-black text-slate-950 uppercase flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-red-600" />
                <span>Weekly Drink Rhythm</span>
              </h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              Glasses / Day
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {weeklyActivity.days.map((day) => {
              const count = weeklyActivity.counts[day] || 0;
              const heightPct = Math.max(8, Math.round((count / weeklyActivity.maxCount) * 100));
              const hasActivity = count > 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className={`text-[10px] font-bold ${hasActivity ? "text-slate-900 font-mono" : "text-slate-400"}`}>
                    {count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden border border-slate-200">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full transition-all duration-500 rounded-t-md ${
                        hasActivity
                          ? "bg-amber-400 group-hover:bg-amber-500 border-t-2 border-slate-900"
                          : "bg-transparent"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 font-mono mt-1">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 rounded-lg p-2.5 text-[11px] text-amber-900 font-sans border border-amber-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Tip: Consistent fruit juice drinkers enjoy 20% higher daily hydration and antioxidant intake.
            </span>
          </div>
        </div>

        {/* Graph 2: What You Drink & How Often (Item Frequency Breakdown) */}
        <div className="border-3 border-slate-900 bg-white rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">BEVERAGE PREFERENCES</span>
              <h3 className="text-sm sm:text-base font-black text-slate-950 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>What You Drink & How Often</span>
              </h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              Times Ordered
            </span>
          </div>

          {drinkSummary.frequencyList.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <GlassWater className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>No beverage records logged yet.</p>
              <button
                onClick={onExploreMenu}
                className="mt-3 text-red-600 font-bold hover:underline"
              >
                Order from Menu →
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {drinkSummary.frequencyList.map((item, idx) => {
                const maxFrequency = drinkSummary.frequencyList[0]?.count || 1;
                const pct = Math.round((item.count / maxFrequency) * 100);
                const isShake = item.categoryId === "cat-shakes";

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-950">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono w-4">
                          #{idx + 1}
                        </span>
                        <span className="truncate max-w-44 sm:max-w-56">{item.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isShake ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {isShake ? "Shake" : "Juice"}
                        </span>
                      </div>
                      <span className="font-mono text-red-600 font-black">
                        {item.count} {item.count === 1 ? "time" : "times"}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isShake ? "bg-red-500" : "bg-amber-400"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drink History Timeline & Purchases (NO COST SHOWN) */}
      <div className="border-3 border-slate-900 bg-white rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">CHRONOLOGICAL RECORD</span>
            <h3 className="text-base font-black text-slate-950 uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Drink Sessions & Date Purchases</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Review every beverage order date, items enjoyed, and preparation details.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-slate-950 text-amber-300 border-slate-950 font-bold"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              All ({userOrders.length})
            </button>
            <button
              onClick={() => setFilterType("juices")}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterType === "juices"
                  ? "bg-amber-400 text-slate-950 border-slate-950 font-bold"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              Juices
            </button>
            <button
              onClick={() => setFilterType("shakes")}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterType === "shakes"
                  ? "bg-red-600 text-white border-slate-950 font-bold"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              Shakes
            </button>
          </div>
        </div>

        {/* Orders Timeline List */}
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Train className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-xs">No drink logs found for this filter.</p>
            <button
              onClick={onExploreMenu}
              className="text-xs text-red-600 font-bold underline"
            >
              Explore Fresh Station Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const orderDate = new Date(order.createdAt);
              const formattedDate = !isNaN(orderDate.getTime())
                ? orderDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              const formattedTime = !isNaN(orderDate.getTime())
                ? orderDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "";

              const isCompleted = order.orderStatus === "completed";
              const isReady = order.orderStatus === "ready";
              const isPreparing = order.orderStatus === "preparing";

              return (
                <div
                  key={order.id}
                  className="border-2 border-slate-900 rounded-xl p-3.5 bg-slate-50 hover:bg-white transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-black text-slate-900">
                        {formattedDate} • {formattedTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Ticket #{order.id}
                      </span>
                    </div>

                    {/* Status Badge (No Cost/Price) */}
                    <div>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Delivered & Enjoyed</span>
                        </span>
                      ) : isReady ? (
                        <span className="text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full animate-pulse">
                          Ready at Counter
                        </span>
                      ) : isPreparing ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                          Preparing (Blenders on)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                          Order Received
                        </span>
                      )}
                    </div>
                  </div>

                  {/* List of items consumed (Quantity, Name, Size, Sweetness - NO COST) */}
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 bg-white p-2 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-red-600 font-mono">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-900">
                            {item.productName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.variantName}
                          </span>
                        </div>

                        {/* Customizations (Sugar, Ice) */}
                        {item.customization && (
                          <div className="text-[10px] text-slate-600 font-sans flex items-center gap-2">
                            <span>Sugar: {item.customization.sugarLevel}</span>
                            <span>•</span>
                            <span>Ice: {item.customization.iceLevel}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="text-[11px] text-slate-500 font-sans italic">
                      Note: {order.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
