"use client";

import React, { useState, useMemo } from "react";
import {
  Category,
  Customer,
  DateRangePreset,
  Product,
  ReportFilter,
  Sale,
} from "@/types";
import { computeAnalytics } from "@/lib/analytics";
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  Printer,
  TrendingUp,
  Award,
  Users,
  Coffee,
  Sparkles,
  ArrowUpDown,
  Search,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

interface ReportsAnalyticsProps {
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  categories: Category[];
  onOpenReceipt: (sale: Sale) => void;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  sales,
  customers,
  products,
  categories,
  onOpenReceipt,
}) => {
  // Filter States
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [productId, setProductId] = useState<string>("all");
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [sortBy, setSortBy] = useState<
    "qty_desc" | "qty_asc" | "revenue_desc" | "revenue_asc"
  >("qty_desc");

  // Tab inside report
  const [activeReportTab, setActiveReportTab] = useState<
    "leaderboard" | "customer_habits" | "gender_insights" | "transactions"
  >("leaderboard");

  const filter: ReportFilter = useMemo(
    () => ({
      datePreset,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      categoryId,
      productId,
      gender,
      sortBy,
    }),
    [datePreset, startDate, endDate, categoryId, productId, gender, sortBy]
  );

  const analytics = useMemo(() => {
    return computeAnalytics(sales, customers, products, filter);
  }, [sales, customers, products, filter]);

  const maxQty = useMemo(() => {
    if (analytics.productStats.length === 0) return 1;
    return Math.max(...analytics.productStats.map((p) => p.totalQuantity), 1);
  }, [analytics.productStats]);

  const handleExportCSV = () => {
    const headers = [
      "Product Name",
      "Category",
      "Units Sold",
      "Revenue (INR)",
      "Male Buyers Qty",
      "Female Buyers Qty",
      "Variant Breakdown",
    ];

    const rows = analytics.productStats.map((p) => [
      `"${p.productName}"`,
      `"${p.categoryName}"`,
      p.totalQuantity,
      p.totalRevenue.toFixed(0),
      p.maleBuyersQty,
      p.femaleBuyersQty,
      `"${Object.entries(p.variantBreakdown)
        .map(([v, count]) => `${v}:${count}`)
        .join("; ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `froosh_junction_sales_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setCategoryId("all");
    setProductId("all");
    setGender("all");
    setSortBy("qty_desc");
  };

  const selectableProducts = useMemo(() => {
    if (categoryId === "all") return products;
    return products.filter((p) => p.categoryId === categoryId);
  }, [products, categoryId]);

  return (
    <div className="space-y-6 pb-20 md:pb-6 font-sans">
      {/* FILTER ENGINE PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-sm text-slate-900">
              Enterprise Reports & Filter Engine
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={handleExportCSV}
              className="pixel-btn-yellow px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
          {/* 1. DATE PRESET */}
          <div className="lg:col-span-4 bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-red-600 block">
              1. Date Range
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "All" },
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "last7days", label: "7 Days" },
                { id: "last30days", label: "30 Days" },
                { id: "custom", label: "Custom" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id as DateRangePreset)}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border cursor-pointer transition-all ${
                    datePreset === p.id
                      ? "bg-yellow-400 text-amber-950 border-yellow-400 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {datePreset === "custom" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Start:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">End:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. CATEGORY & DRINK */}
          <div className="lg:col-span-4 bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
            <div>
              <label className="text-xs font-bold text-red-600 block mb-1">
                2. Category Filter
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setProductId("all");
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
              >
                <option value="all">All Categories (Juices & Shakes)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-red-600 block mb-1">
                3. Specific Drink
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="all">All Drinks</option>
                {selectableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. GENDER & SORT */}
          <div className="lg:col-span-4 bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
            <div>
              <label className="text-xs font-bold text-red-600 block mb-1">
                4. Customer Gender
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "male", label: "Male" },
                  { id: "female", label: "Female" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGender(g.id as "all" | "male" | "female")}
                    className={`py-1 text-xs rounded-md font-semibold border cursor-pointer transition-all ${
                      gender === g.id
                        ? "bg-red-600 text-white border-red-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-red-600 block mb-1">
                5. Sort Results (High & Low)
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
              >
                <option value="qty_desc">Highest Volume Sold (High to Low)</option>
                <option value="qty_asc">Lowest Volume Sold (Low to High)</option>
                <option value="revenue_desc">Highest Revenue (₹) (High to Low)</option>
                <option value="revenue_asc">Lowest Revenue (₹) (Low to High)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
            <span className="font-bold text-sm">₹</span>
          </div>
          <p className="text-lg font-bold text-red-600">
            ₹{analytics.totalRevenue.toFixed(0)}
          </p>
          <span className="text-[11px] text-slate-400">
            Filtered gross
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drinks Sold</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            {analytics.totalQuantity}
          </p>
          <span className="text-[11px] text-slate-400">
            Glasses / Bottles
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Orders</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            {analytics.totalOrders}
          </p>
          <span className="text-[11px] text-slate-400">
            Receipt tickets
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Ticket</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            ₹{analytics.averageOrderValue.toFixed(0)}
          </p>
          <span className="text-[11px] text-slate-400">
            Per sale average
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">#1 Best Seller</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-red-600 truncate">
            {analytics.topSellingProduct?.productName || "None"}
          </p>
          <span className="text-[11px] text-slate-400">
            {analytics.topSellingProduct
              ? `${analytics.topSellingProduct.totalQuantity} units sold`
              : "No sales yet"}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender Split</span>
            <Users className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-[11px] space-y-0.5">
            <div className="text-blue-700 font-semibold">
              ♂ {analytics.genderMetrics.maleJuicesCount} (₹
              {analytics.genderMetrics.maleRevenue.toFixed(0)})
            </div>
            <div className="text-pink-700 font-semibold">
              ♀ {analytics.genderMetrics.femaleJuicesCount} (₹
              {analytics.genderMetrics.femaleRevenue.toFixed(0)})
            </div>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          {
            id: "leaderboard",
            label: "Top Juices & Shakes Ranking",
            count: analytics.productStats.length,
          },
          {
            id: "customer_habits",
            label: "Customer Buying Breakdown",
            count: analytics.customerStats.length,
          },
          {
            id: "gender_insights",
            label: "Demographic Taste Preferences",
            count: null,
          },
          {
            id: "transactions",
            label: "Filtered Sales Receipts",
            count: analytics.filteredSales.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold whitespace-nowrap border-b-2 cursor-pointer transition-all ${
              activeReportTab === tab.id
                ? "border-red-600 text-red-600 bg-amber-50 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label} {tab.count !== null ? `(${tab.count})` : ""}
          </button>
        ))}
      </div>

      {/* VIEW 1: LEADERBOARD */}
      {activeReportTab === "leaderboard" && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Product Sales Analysis & Sizes Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Sorted by: <strong className="text-red-600 uppercase">{sortBy}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                  <th className="py-2.5 px-3 rounded-l-lg">Rank & Drink</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                  <th className="py-2.5 px-4 text-center">Volume Bar</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  <th className="py-2.5 px-3 text-center">Male / Female Buyers</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Size Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.productStats.map((item, idx) => {
                  const percentOfMax = (item.totalQuantity / maxQty) * 100;
                  const totalGenderBuyers =
                    item.maleBuyersQty + item.femaleBuyersQty + item.otherBuyersQty;
                  const malePct =
                    totalGenderBuyers > 0
                      ? Math.round((item.maleBuyersQty / totalGenderBuyers) * 100)
                      : 0;
                  const femalePct =
                    totalGenderBuyers > 0
                      ? Math.round((item.femaleBuyersQty / totalGenderBuyers) * 100)
                      : 0;

                  return (
                    <tr
                      key={item.productId}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs w-5 h-5 flex items-center justify-center rounded font-bold ${
                              idx === 0
                                ? "bg-yellow-400 text-amber-950"
                                : idx === 1
                                ? "bg-slate-200 text-slate-700"
                                : idx === 2
                                ? "bg-amber-100 text-amber-800"
                                : "text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xl">{item.emoji}</span>
                          <span className="font-semibold text-slate-900">
                            {item.productName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {item.categoryName}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-sm text-slate-900">
                          {item.totalQuantity}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="w-28 bg-slate-100 h-2.5 rounded-full overflow-hidden mx-auto">
                          <div
                            className="bg-red-600 h-full rounded-full transition-all"
                            style={{ width: `${percentOfMax}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-red-600 text-sm">
                          ₹{item.totalRevenue.toFixed(0)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-[11px]">
                          <span className="text-blue-700 font-semibold">
                            ♂ {item.maleBuyersQty} ({malePct}%)
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-pink-700 font-semibold">
                            ♀ {item.femaleBuyersQty} ({femalePct}%)
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.variantBreakdown).map(
                            ([varName, count]) => (
                              <span
                                key={varName}
                                className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-600"
                              >
                                {varName}: <strong className="text-red-600">{count}</strong>
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {analytics.productStats.length === 0 && (
              <p className="text-slate-400 text-center py-8">
                No juices or shakes match this filter range.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CUSTOMER DRINK INTELLIGENCE */}
      {activeReportTab === "customer_habits" && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Customer Drink Intelligence
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed audit of which customer purchased which juice, variant, and on what dates.
              </p>
            </div>
            <span className="text-xs text-slate-600 font-semibold">
              {analytics.customerStats.length} Clients Active
            </span>
          </div>

          <div className="space-y-3">
            {analytics.customerStats.map((cust) => (
              <div
                key={cust.customerId}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                      #{cust.customerId}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {cust.customerName}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        cust.customerGender === "male"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-pink-50 text-pink-700"
                      }`}
                    >
                      {cust.customerGender === "male" ? "♂ Male" : "♀ Female"}
                    </span>
                    {cust.customerInstagram && (
                      <span className="text-xs text-pink-600 font-semibold">
                        {cust.customerInstagram}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500">
                      Orders: <strong className="text-slate-800">{cust.totalOrders}</strong>
                    </span>
                    <span className="text-slate-500">
                      Drinks: <strong className="text-slate-800">{cust.totalQuantity}</strong>
                    </span>
                    <span className="text-red-600 font-bold text-sm">
                      Spent: ₹{cust.totalSpent.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1">
                    Juices & Shakes Bought:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {cust.purchasedProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs space-y-1 shadow-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-slate-800">
                              {p.productName}
                            </span>
                            <span className="text-slate-400 block text-[11px]">
                              [{p.variantName}]
                            </span>
                          </div>
                          <span className="bg-red-50 text-red-600 font-bold text-[10px] px-2 py-0.5 rounded">
                            Qty: {p.quantity}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Dates: {p.dates.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {analytics.customerStats.length === 0 && (
              <p className="text-slate-400 text-center py-8">
                No customer orders match the current filters.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: GENDER PREFERENCE */}
      {activeReportTab === "gender_insights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* MALE CUSTOMERS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-blue-600">♂</span>
                <h3 className="font-bold text-sm text-blue-900">
                  Male Customer Preferences
                </h3>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded">
                {analytics.genderMetrics.maleOrders} Orders
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Revenue</span>
                <span className="text-lg font-bold text-red-600">
                  ₹{analytics.genderMetrics.maleRevenue.toFixed(0)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Drinks</span>
                <span className="text-lg font-bold text-blue-700">
                  {analytics.genderMetrics.maleJuicesCount}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Top Drinks Preferred by Men:
              </span>
              <div className="space-y-2">
                {analytics.productStats
                  .filter((p) => p.maleBuyersQty > 0)
                  .sort((a, b) => b.maleBuyersQty - a.maleBuyersQty)
                  .slice(0, 5)
                  .map((p, i) => (
                    <div
                      key={p.productId}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">#{i + 1}</span>
                        <span className="text-base">{p.emoji}</span>
                        <span className="font-semibold text-slate-800">{p.productName}</span>
                      </div>
                      <span className="font-bold text-blue-700">
                        {p.maleBuyersQty} sold
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* FEMALE CUSTOMERS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-pink-600">♀</span>
                <h3 className="font-bold text-sm text-pink-900">
                  Female Customer Preferences
                </h3>
              </div>
              <span className="text-xs bg-pink-50 text-pink-700 font-bold px-2.5 py-0.5 rounded">
                {analytics.genderMetrics.femaleOrders} Orders
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Revenue</span>
                <span className="text-lg font-bold text-red-600">
                  ₹{analytics.genderMetrics.femaleRevenue.toFixed(0)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Drinks</span>
                <span className="text-lg font-bold text-pink-700">
                  {analytics.genderMetrics.femaleJuicesCount}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Top Drinks Preferred by Women:
              </span>
              <div className="space-y-2">
                {analytics.productStats
                  .filter((p) => p.femaleBuyersQty > 0)
                  .sort((a, b) => b.femaleBuyersQty - a.femaleBuyersQty)
                  .slice(0, 5)
                  .map((p, i) => (
                    <div
                      key={p.productId}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">#{i + 1}</span>
                        <span className="text-base">{p.emoji}</span>
                        <span className="font-semibold text-slate-800">{p.productName}</span>
                      </div>
                      <span className="font-bold text-pink-700">
                        {p.femaleBuyersQty} sold
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: FILTERED RECEIPTS */}
      {activeReportTab === "transactions" && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Matching Receipts ({analytics.filteredSales.length})
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {analytics.filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:border-red-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                      {sale.id}
                    </span>
                    <span className="text-slate-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-slate-800">
                      #{sale.customerId} {sale.customerName} (
                      {sale.customerGender.toUpperCase()})
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Items:{" "}
                    {sale.items
                      .map((it) => `${it.productName} (${it.variantName}) x${it.quantity}`)
                      .join(", ")}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-red-600 font-bold text-sm">
                    ₹{sale.total.toFixed(0)}
                  </span>
                  <button
                    onClick={() => onOpenReceipt(sale)}
                    className="pixel-btn-yellow px-2.5 py-1 text-xs rounded-md cursor-pointer"
                  >
                    Receipt
                  </button>
                </div>
              </div>
            ))}

            {analytics.filteredSales.length === 0 && (
              <p className="text-slate-400 text-center py-8">
                No receipts found in this filter range.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
