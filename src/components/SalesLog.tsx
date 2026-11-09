"use client";

import React, { useState, useMemo } from "react";
import { Sale } from "@/types";
import {
  Receipt,
  Search,
  Calendar,
  CreditCard,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";

interface SalesLogProps {
  sales: Sale[];
  onOpenReceipt: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
}

export const SalesLog: React.FC<SalesLogProps> = ({
  sales,
  onOpenReceipt,
  onDeleteSale,
}) => {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (paymentFilter !== "all" && s.paymentMethod !== paymentFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = s.id.toLowerCase().includes(q);
        const matchCust = s.customerName.toLowerCase().includes(q);
        const matchCustId = s.customerId.includes(q);
        const matchItem = s.items.some((it) =>
          it.productName.toLowerCase().includes(q)
        );
        return matchId || matchCust || matchCustId || matchItem;
      }
      return true;
    });
  }, [sales, paymentFilter, search]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.total, 0);
  }, [filteredSales]);

  return (
    <div className="space-y-6 pb-20 md:pb-6 font-sans">
      {/* Search & Header */}
      <div className="dashboard-panel space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-sm text-slate-900">
                Sales & Invoice Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              A record of every order, payment, and receipt.
            </p>
          </div>

          <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium">
            Showing: <strong className="text-red-600">{filteredSales.length}</strong> Sales |
            Total: <strong className="text-red-700">₹{totalFilteredRevenue.toFixed(0)}</strong>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search receipt # (REC-...), customer name, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="dashboard-filter-tabs flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <span className="text-xs font-semibold text-slate-500 px-2">Payment:</span>
            {["all", "cash", "card", "upi", "other"].map((pm) => (
              <button
                key={pm}
                onClick={() => setPaymentFilter(pm)}
                className={`px-3 py-1 text-xs uppercase rounded-md font-semibold transition-all cursor-pointer ${
                  paymentFilter === pm
                    ? "bg-yellow-400 text-amber-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {pm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredSales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-4 transition-all shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            {/* Left Info */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {sale.id}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(sale.date).toLocaleString()}
                </span>
                <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-800 font-semibold">
                  #{sale.customerId} {sale.customerName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                  sale.isComplementary || sale.paymentMethod === "complimentary" || sale.total === 0
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  [{sale.paymentMethod === "complimentary" ? "COMPLIMENTARY" : sale.paymentMethod}]
                </span>
                {sale.workerName && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                    Staff: {sale.workerName}
                  </span>
                )}
              </div>

              {/* Items Summary */}
              <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1 pt-1">
                {sale.items.map((it, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
                  >
                    <strong>{it.productName}</strong> ({it.variantName}) x
                    <span className="text-red-600 font-bold">{it.quantity}</span>
                    {it.isComplementary && (
                      <span className="ml-1 text-[10px] text-emerald-700 font-bold">
                        [FREE]
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Financials & Actions */}
            <div className="flex items-center gap-4 self-end md:self-center">
              <div className="text-right">
                {sale.discount > 0 && (
                  <span className="text-[11px] text-red-600 block font-medium">
                    Disc: -₹{sale.discount.toFixed(0)}
                  </span>
                )}
                {sale.isComplementary || sale.paymentMethod === "complimentary" || sale.total === 0 ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    FREE (₹0)
                  </span>
                ) : (
                  <span className="text-lg font-bold text-red-600 tabular-nums">
                    ₹{sale.total.toFixed(0)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenReceipt(sale)}
                  className="pixel-btn-yellow px-3 py-2 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete sale ${sale.id}?`)) {
                      onDeleteSale(sale.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-300 cursor-pointer"
                  title="Delete Sale"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredSales.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
            <p className="text-base text-red-600 font-bold">No sales match this criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
