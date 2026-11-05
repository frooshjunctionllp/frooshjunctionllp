"use client";

import React, { useRef } from "react";
import { Sale } from "@/types";
import { Printer, X, CheckCircle, Share2, Phone } from "lucide-react";
import { InstagramIcon } from "./icons";

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.date).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-md my-8">
        {/* Action Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-slate-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Sale Completed Successfully!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white rounded-lg border border-slate-200 shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div
          ref={receiptRef}
          className="bg-white text-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 relative"
        >
          {/* Top Brand Info */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
            <div className="font-pixel text-sm sm:text-base text-red-600 tracking-wider">
              FROOSH JUNCTION
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-semibold">
              Fresh Juices • Thick Shakes • Fruit Bowls
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Station Road, Beverage Corner • Mob: 98765-FROOSH
            </p>
            <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <div className="text-xs bg-slate-100 border border-slate-200 rounded-md py-0.5 px-2.5 inline-block text-slate-700 font-medium">
                Invoice: <span className="font-bold text-slate-900">{sale.id}</span>
              </div>
              {(sale.isComplementary || sale.paymentMethod === "complimentary" || sale.total === 0) && (
                <div className="text-xs bg-emerald-50 border border-emerald-300 rounded-md py-0.5 px-2.5 inline-block text-emerald-800 font-bold uppercase tracking-wider">
                  Complimentary • On the House
                </div>
              )}
            </div>
          </div>

          {/* Customer & Timestamp Info */}
          <div className="text-xs border-b border-dashed border-slate-200 pb-3 mb-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-semibold text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Customer ID:</span>
              <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                #{sale.customerId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-semibold uppercase text-slate-800">{sale.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gender:</span>
              <span className="capitalize font-medium text-slate-700">
                {sale.customerGender === "male"
                  ? "Male"
                  : sale.customerGender === "female"
                  ? "Female"
                  : "Other"}
              </span>
            </div>
            {sale.workerName && (
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span className="text-slate-500">Billed By:</span>
                <span className="font-semibold text-slate-800">{sale.workerName}</span>
              </div>
            )}
            {sale.customerPhone && (
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Phone:
                </span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
            {sale.customerInstagram && (
              <div className="flex justify-between items-center text-xs text-pink-600 font-semibold">
                <span className="flex items-center gap-1">
                  <InstagramIcon className="w-3 h-3" /> Insta:
                </span>
                <span>{sale.customerInstagram}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="mb-4">
            <div className="grid grid-cols-12 text-xs font-bold border-b border-slate-200 pb-1.5 mb-2 text-slate-600">
              <span className="col-span-6 uppercase text-[11px]">Item & Variant</span>
              <span className="col-span-2 text-center text-[11px]">Qty</span>
              <span className="col-span-2 text-right text-[11px]">Rate</span>
              <span className="col-span-2 text-right text-[11px]">Amount</span>
            </div>

            <div className="space-y-2 text-xs">
              {sale.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-start py-0.5">
                  <div className="col-span-6 pr-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="font-semibold text-slate-800 leading-tight">
                        {item.productName}
                      </p>
                      {item.isComplementary && (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      [{item.variantName}]
                    </p>
                  </div>
                  <div className="col-span-2 text-center font-bold text-slate-700">
                    x{item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-slate-500 tabular-nums">
                    {item.isComplementary ? "₹0" : `₹${item.unitPrice.toFixed(0)}`}
                  </div>
                  <div className="col-span-2 text-right font-bold tabular-nums">
                    {item.isComplementary ? (
                      <span className="text-emerald-700">₹0</span>
                    ) : (
                      <span className="text-slate-800">₹{item.total.toFixed(0)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="tabular-nums">₹{sale.subtotal.toFixed(0)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>
                  {sale.discount >= sale.subtotal
                    ? "Complementary Waiver (100%):"
                    : "Discount:"}
                </span>
                <span className="tabular-nums">-₹{sale.discount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 text-slate-900">
              <span>Total Paid:</span>
              {sale.isComplementary || sale.paymentMethod === "complimentary" || sale.total === 0 ? (
                <span className="text-emerald-700 text-sm sm:text-base font-black">
                  ₹0 (ON THE HOUSE)
                </span>
              ) : (
                <span className="text-red-600 text-lg tabular-nums">
                  ₹{sale.total.toFixed(0)}
                </span>
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase tracking-wider text-slate-700">
                [{sale.paymentMethod === "complimentary" ? "FREE / COMPLIMENTARY" : sale.paymentMethod}]
              </span>
            </div>
          </div>

          {/* Barcode & Footer */}
          <div className="mt-5 pt-3 border-t border-dashed border-slate-200 text-center">
            {/* Barcode simulation */}
            <div className="flex justify-center items-center gap-0.5 h-7 my-2 overflow-hidden px-4">
              {[3, 1, 4, 1, 5, 2, 6, 2, 1, 3, 4, 2, 1, 5, 2, 4, 3, 1, 2, 6, 1, 3, 2].map(
                (w, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 h-full"
                    style={{ width: `${w * 2}px` }}
                  />
                )
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest">
              *{sale.id}*
            </p>
            <p className="text-xs font-bold text-slate-800 mt-2">
              Thank you for visiting Froosh Junction!
            </p>
            <p className="text-[11px] text-slate-400">
              Tag us on Instagram @froosh_junction for offers!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 pixel-btn-yellow rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-6 pixel-btn-white rounded-xl text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
