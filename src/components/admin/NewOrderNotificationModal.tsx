"use client";

import React, { useState, useEffect } from "react";
import { OnlineOrder, AuthSession, OrderStatus } from "@/types";
import { audioService } from "@/lib/audioService";
import { InstagramIcon } from "@/components/icons";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Edit3,
  Phone,
  User,
  Clock,
  Sparkles,
  MapPin,
  Plus,
  Minus,
  Trash2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from "lucide-react";

interface NewOrderNotificationModalProps {
  orders: OnlineOrder[];
  currentUser: AuthSession | null;
  onConfirmOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string, reason?: string) => void;
  onModifyOrder: (
    orderId: string,
    modifications: { items: any[]; total: number; notes?: string }
  ) => void;
}

export const NewOrderNotificationModal: React.FC<NewOrderNotificationModalProps> = ({
  orders,
  currentUser,
  onConfirmOrder,
  onRejectOrder,
  onModifyOrder,
}) => {
  // Pending new orders that need action
  const newOrders = orders.filter((o) => o.orderStatus === "new");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedItems, setModifiedItems] = useState<any[]>([]);
  const [staffNote, setStaffNote] = useState("");
  const [rejectPrompt, setRejectPrompt] = useState(false);

  // Play audio chime when a new order arrives
  useEffect(() => {
    if (newOrders.length > 0) {
      try {
        audioService.playStationChime();
      } catch (e) {}
    }
  }, [newOrders.length]);

  // Adjust index if list shrinks
  useEffect(() => {
    if (currentIndex >= newOrders.length) {
      setCurrentIndex(Math.max(0, newOrders.length - 1));
      setIsModifying(false);
      setRejectPrompt(false);
    }
  }, [newOrders.length, currentIndex]);

  const activeOrder = newOrders[currentIndex];

  useEffect(() => {
    if (activeOrder) {
      setModifiedItems(JSON.parse(JSON.stringify(activeOrder.items || [])));
      setStaffNote(activeOrder.notes || "");
      setIsModifying(false);
      setRejectPrompt(false);
    }
  }, [activeOrder?.id]);

  if (!activeOrder || newOrders.length === 0) return null;

  const isAdmin = currentUser?.role === "admin";
  const isWorker = currentUser?.role === "worker";

  // Item quantity modifiers for "Modify" mode
  const handleItemQtyChange = (index: number, delta: number) => {
    const updated = [...modifiedItems];
    const item = updated[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      const unit = item.unitPrice || item.total / item.quantity;
      item.quantity = newQty;
      item.total = unit * newQty;
    }
    setModifiedItems(updated);
  };

  const modifiedTotal = modifiedItems.reduce((acc, i) => acc + (i.total || 0), 0);

  const handleSaveModification = () => {
    onModifyOrder(activeOrder.id, {
      items: modifiedItems,
      total: modifiedTotal,
      notes: staffNote,
    });
    setIsModifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-amber-50 rounded-2xl shadow-2xl border-4 border-red-600 overflow-hidden my-6 font-mono animate-in fade-in zoom-in-95 duration-200">
        {/* Flashing Top Notification Banner */}
        <div className="bg-red-600 text-white p-4 flex items-center justify-between border-b-4 border-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-red-600 rounded-xl animate-bounce shadow-md">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-950 text-amber-300 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  Live Dispatch
                </span>
                <span className="text-xs font-mono font-bold text-red-100">
                  Ticket #{activeOrder.id}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
                New Order Received!
              </h2>
            </div>
          </div>

          {/* Multiple Orders Queue Counter */}
          {newOrders.length > 1 && (
            <div className="flex items-center gap-1 bg-red-700 border border-red-500 rounded-lg px-2 py-1 text-xs font-bold">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                {currentIndex + 1} / {newOrders.length}
              </span>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(newOrders.length - 1, prev + 1))
                }
                disabled={currentIndex === newOrders.length - 1}
                className="disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Customer Details Box: PRIVACY FILTER BASED ON ROLE */}
          <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 shadow-[2px_2px_0px_#000] space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                <span className="text-sm font-black text-slate-950">
                  {activeOrder.customerName}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">
                {activeOrder.orderType.replace("_", " ")}
              </span>
            </div>

            {/* Admin View vs Worker View */}
            {isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                <div className="flex items-center gap-2 text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold">
                    {activeOrder.customerPhone || "No phone recorded"}
                  </span>
                </div>
                {activeOrder.customerInstagram && (
                  <div className="flex items-center gap-2 text-slate-800">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span className="font-mono font-bold text-pink-600">
                      {activeOrder.customerInstagram}
                    </span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 font-mono sm:col-span-2">
                  PNR: {activeOrder.pnr} • Placed:{" "}
                  {new Date(activeOrder.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-2 text-[11px] text-slate-600 font-sans flex items-center justify-between">
                <span>Worker View Active (Contact details restricted to Admin)</span>
                <span className="font-mono font-bold text-slate-800">
                  PNR: {activeOrder.pnr}
                </span>
              </div>
            )}
          </div>

          {/* Ordered Drink Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-900">
              <span>Ordered Drinks ({activeOrder.items.length})</span>
              <span>Total: ₹{isModifying ? modifiedTotal : activeOrder.total}</span>
            </div>

            {/* Normal Item View vs Modify Mode */}
            {!isModifying ? (
              <div className="space-y-2">
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-slate-900 rounded-xl p-3 flex items-center justify-between text-xs shadow-sm"
                  >
                    <div>
                      <div className="font-black text-slate-950 flex items-center gap-2">
                        <span className="text-red-600">{item.quantity}x</span>
                        <span>{item.productName}</span>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {item.variantName}
                        </span>
                      </div>
                      {item.customization && (
                        <div className="text-[10px] text-slate-600 font-sans mt-0.5">
                          Sugar: {item.customization.sugarLevel} • Ice: {item.customization.iceLevel}
                          {item.customization.addons.length > 0 && (
                            <span className="text-amber-800 font-bold ml-1">
                              (+{item.customization.addons.join(", ")})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{item.total}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* Inline Modify Mode */
              <div className="space-y-2 bg-amber-100/70 p-3 rounded-xl border-2 border-dashed border-amber-600">
                <span className="text-[11px] font-black uppercase text-amber-900 block">
                  Modify Items & Quantities:
                </span>
                {modifiedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-900 rounded-lg p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <span className="font-bold text-slate-950 block">
                        {item.productName} ({item.variantName})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ₹{item.total}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(idx, -1)}
                        className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black w-5 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(idx, 1)}
                        className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold uppercase text-slate-700">
                    Staff Modification Note:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Substituted fruit flavor per call"
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    className="w-full bg-white border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-sans focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reject Confirmation Box */}
          {rejectPrompt && (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 text-xs space-y-2">
              <span className="font-bold text-red-900 block">
                Are you sure you want to reject this order?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onRejectOrder(activeOrder.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Yes, Reject Order
                </button>
                <button
                  onClick={() => setRejectPrompt(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Confirm, Reject, Modify */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {!isModifying ? (
              <>
                {/* 1. Confirm */}
                <button
                  onClick={() => onConfirmOrder(activeOrder.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_#000] text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm</span>
                </button>

                {/* 2. Modify */}
                <button
                  onClick={() => setIsModifying(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_#000] text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modify</span>
                </button>

                {/* 3. Reject */}
                <button
                  onClick={() => setRejectPrompt(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_#000] text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveModification}
                  className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_#000] text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Confirm</span>
                </button>
                <button
                  onClick={() => setIsModifying(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl border-2 border-slate-900 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
