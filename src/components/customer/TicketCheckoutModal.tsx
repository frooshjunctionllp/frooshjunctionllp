"use client";

import React, { useState } from "react";
import {
  CustomerPass,
  OnlineOrderItem,
  OnlineOrder,
  RewardVoucher,
} from "@/types";
import { storageService } from "@/services/storageService";
import {
  X,
  Ticket,
  QrCode,
  IndianRupee,
  Train,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";

interface TicketCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OnlineOrderItem[];
  onUpdateCart: (items: OnlineOrderItem[]) => void;
  currentPass: CustomerPass | null;
  onOpenPassModal: () => void;
  onOrderPlaced: (order: OnlineOrder) => void;
  vouchers: RewardVoucher[];
}

export const TicketCheckoutModal: React.FC<TicketCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateCart,
  currentPass,
  onOpenPassModal,
  onOrderPlaced,
  vouchers,
}) => {
  const [orderType, setOrderType] = useState<"counter_pickup" | "dine_in" | "delivery">("counter_pickup");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cash">("upi");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountNotice, setDiscountNotice] = useState("");
  const [passengerNameInput, setPassengerNameInput] = useState("");
  const [passengerPhoneInput, setPassengerPhoneInput] = useState("");
  const [passengerInstaInput, setPassengerInstaInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "EXPRESS20") {
      const disc = Math.round(subtotal * 0.2);
      setDiscountAmount(disc);
      setDiscountNotice("20% Platform Express discount applied!");
    } else {
      setDiscountNotice("Invalid coupon code.");
    }
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty <= 0) {
      const updated = cartItems.filter((_, i) => i !== index);
      onUpdateCart(updated);
    } else {
      const updated = [...cartItems];
      const item = updated[index];
      const unit = item.total / item.quantity;
      item.quantity = newQty;
      item.total = unit * newQty;
      onUpdateCart(updated);
    }
  };

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) return;
    setPhoneError("");

    // Ensure customer has a pass or register with phone & name
    let passToUse = currentPass;
    if (!passToUse) {
      const cleanPhone = passengerPhoneInput.trim().replace(/[\s-]/g, "");
      const cleanName = passengerNameInput.trim();

      if (!cleanPhone || cleanPhone.length < 7) {
        setPhoneError("Please enter your phone number to place the order.");
        return;
      }
      if (!cleanName) {
        setPhoneError("Please enter your name.");
        return;
      }

      passToUse = storageService.registerCustomer(
        cleanName,
        cleanPhone,
        passengerInstaInput.trim() || undefined
      );
    }

    setIsSubmitting(true);

    const ticketNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OnlineOrder = {
      id: ticketNumber,
      customerId: passToUse.customerId || passToUse.pnr,
      pnr: passToUse.pnr,
      customerName: passToUse.name,
      customerPhone: passToUse.phone,
      customerInstagram: passToUse.instagramId,
      orderType,
      deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
      notes: orderType === "dine_in" ? `Table #${tableNumber}` : undefined,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
      orderStatus: "new",
      createdAt: new Date().toISOString(),
      estimatedMinutes: 8,
    };

    const saved = storageService.createOnlineOrder(newOrder);
    onUpdateCart([]);
    setIsSubmitting(false);
    onOrderPlaced(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-amber-50 rounded-2xl shadow-2xl border-4 border-slate-900 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-amber-400 p-4 flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-mono text-base font-black tracking-wide uppercase">
                Order Review & Checkout
              </h3>
              <p className="text-[10px] text-amber-200/80 font-mono">
                Platform Counter • Padma Pukur, Entally
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-xs">
              Your ticket cart is empty. Add fresh juices or shakes from the menu!
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-900 font-mono block">
                Selected Drinks ({cartItems.length})
              </span>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="bg-white border-2 border-slate-900 rounded-xl p-2.5 flex items-center justify-between shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {item.variantName}
                      </div>
                      {item.customization && (
                        <div className="text-[10px] text-slate-500">
                          {item.customization.sugarLevel} • {item.customization.iceLevel}
                          {item.customization.addons.length > 0 && (
                            <span className="text-amber-800 font-bold block">
                              + {item.customization.addons.join(", ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-900 rounded bg-amber-50">
                        <button
                          onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                          className="px-1.5 py-0.5 hover:bg-amber-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                          className="px-1.5 py-0.5 hover:bg-amber-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right font-mono min-w-14">
                        <span className="text-xs font-black text-slate-950">
                          ₹{item.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passenger Identity Block */}
          <div className="border-2 border-slate-900 bg-amber-100/90 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-700 font-mono block mb-1">
              BOARDING PASSENGER
            </span>
            {currentPass ? (
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-slate-950 text-sm">
                    {currentPass.name}
                  </span>
                  <span className="text-slate-600 font-mono block text-[11px]">
                    📱 {currentPass.phone || "No phone"} • ID: {currentPass.pnr}
                  </span>
                </div>
                <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  PASS ACTIVE
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {phoneError && (
                  <div className="text-[11px] font-bold text-red-600 bg-red-100 p-1.5 rounded border border-red-300">
                    {phoneError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number (e.g. 9876543210)*"
                    value={passengerPhoneInput}
                    onChange={(e) => setPassengerPhoneInput(e.target.value)}
                    className="w-full bg-white border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Aarav Sharma)*"
                    value={passengerNameInput}
                    onChange={(e) => setPassengerNameInput(e.target.value)}
                    className="w-full bg-white border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="Instagram ID (Optional)"
                    value={passengerInstaInput}
                    onChange={(e) => setPassengerInstaInput(e.target.value)}
                    className="w-full bg-white border border-slate-900 rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-sans">Saves session & logs your drinks</span>
                  <button
                    type="button"
                    onClick={onOpenPassModal}
                    className="text-red-700 underline font-bold"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fulfillment Type */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-900 font-mono mb-1.5">
              Fulfillment Type
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setOrderType("counter_pickup")}
                className={`p-2 rounded-lg border-2 font-bold transition-all cursor-pointer ${
                  orderType === "counter_pickup"
                    ? "bg-slate-950 text-amber-300 border-slate-950 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                Counter Pickup
              </button>
              <button
                type="button"
                onClick={() => setOrderType("dine_in")}
                className={`p-2 rounded-lg border-2 font-bold transition-all cursor-pointer ${
                  orderType === "dine_in"
                    ? "bg-slate-950 text-amber-300 border-slate-950 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                Table / Dine-In
              </button>
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`p-2 rounded-lg border-2 font-bold transition-all cursor-pointer ${
                  orderType === "delivery"
                    ? "bg-slate-950 text-amber-300 border-slate-950 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                Local Delivery
              </button>
            </div>

            {orderType === "dine_in" && (
              <input
                type="text"
                placeholder="Platform Table / Bench # (e.g. 4)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="mt-2 w-full bg-white border-2 border-slate-900 rounded-lg p-2 text-xs font-mono"
              />
            )}
            {orderType === "delivery" && (
              <input
                type="text"
                placeholder="Delivery Address in Entally / Central Kolkata"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="mt-2 w-full bg-white border-2 border-slate-900 rounded-lg p-2 text-xs font-sans"
              />
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-900 font-mono mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`p-2.5 rounded-lg border-2 flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  paymentMethod === "upi"
                    ? "bg-slate-950 text-amber-300 border-slate-950 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI QR (Scan & Pay)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-2.5 rounded-lg border-2 flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  paymentMethod === "cash"
                    ? "bg-slate-950 text-amber-300 border-slate-950 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                <IndianRupee className="w-4 h-4" />
                <span>Cash at Counter</span>
              </button>
            </div>

            {paymentMethod === "upi" && (
              <div className="mt-2 bg-white border-2 border-slate-900 rounded-xl p-3 flex items-center gap-3">
                <div className="p-1.5 bg-slate-900 text-amber-400 rounded-lg text-center shrink-0">
                  <QrCode className="w-10 h-10" />
                </div>
                <div className="text-xs text-slate-800">
                  <span className="font-bold block text-slate-950">
                    UPI: frooshjunction@upi
                  </span>
                  Scan on GPay, PhonePe, or Paytm upon pickup or online.
                </div>
              </div>
            )}
          </div>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="Coupon code (e.g. EXPRESS20)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 bg-white border-2 border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase"
            />
            <button
              type="submit"
              className="bg-slate-900 text-amber-400 font-mono font-bold text-xs px-3 py-1.5 rounded-lg border-2 border-slate-900 cursor-pointer"
            >
              Apply
            </button>
          </form>
          {discountNotice && (
            <p className="text-[11px] font-bold text-emerald-700">{discountNotice}</p>
          )}

          {/* Price Breakdown */}
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-3 text-xs space-y-1 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-950 font-black text-sm pt-1 border-t border-slate-300">
              <span>Ticket Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Submit Order Button */}
        <div className="bg-slate-900 p-4 border-t-2 border-amber-400 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-200/80 font-mono block">
              FINAL PAYABLE
            </span>
            <div className="text-xl font-black text-amber-400 font-mono">
              ₹{total}
            </div>
          </div>
          <button
            type="button"
            disabled={cartItems.length === 0 || isSubmitting}
            onClick={handleSubmitOrder}
            className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 border-2 border-slate-950 font-mono font-black px-6 py-2.5 rounded-lg shadow-[3px_3px_0px_#000] hover:shadow-none transition-all uppercase text-xs cursor-pointer flex items-center gap-1.5"
          >
            <Train className="w-4 h-4" />
            <span>Generate Ticket & Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
