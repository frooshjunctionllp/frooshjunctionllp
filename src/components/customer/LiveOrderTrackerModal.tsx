"use client";

import React, { useEffect } from "react";
import { OnlineOrder } from "@/types";
import { audioService } from "@/lib/audioService";
import {
  X,
  Train,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Volume2,
  Bell,
  MapPin,
} from "lucide-react";

interface LiveOrderTrackerModalProps {
  order: OnlineOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAGES = [
  { key: "new", label: "Ticket Issued", desc: "Order recorded on platform ledger" },
  { key: "accepted", label: "Station Verified", desc: "Kitchen acknowledged order" },
  { key: "preparing", label: "Blenders Running", desc: "Fresh fruits & shakes in prep" },
  { key: "ready", label: "Ready for Boarding", desc: "Collect at Platform Counter!" },
  { key: "completed", label: "Delivered", desc: "Pure fresh journey enjoyed" },
];

export const LiveOrderTrackerModal: React.FC<LiveOrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const currentStageIndex = STAGES.findIndex((s) => s.key === order.orderStatus);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const isReady = order.orderStatus === "ready";

  useEffect(() => {
    if (isReady) {
      audioService.playStationChime();
    }
  }, [isReady]);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Froosh Junction Ticket #${order.id}*\nPassenger: ${order.customerName} (PNR: ${order.pnr})\nStatus: ${order.orderStatus.toUpperCase()}\nItems: ${order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}\nTotal: ₹${order.total}\nLocation: Bihar Bus Stand, Entally, Kolkata`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleTestChime = () => {
    audioService.playStationChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-amber-50 rounded-2xl shadow-2xl border-4 border-slate-900 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-amber-400 p-4 flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-mono text-base font-black tracking-wide uppercase">
                Platform Live Tracking
              </h3>
              <p className="text-[10px] text-amber-200/80 font-mono">
                Ticket: {order.id} • PNR: {order.pnr}
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

        <div className="p-5 space-y-4">
          {/* LED Platform Signboard Status */}
          <div className="bg-slate-950 border-3 border-slate-900 rounded-xl p-4 text-center font-mono relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTestChime}
                className="p-1 rounded bg-slate-800 text-amber-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                title="Play Railway Station Chime"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Chime</span>
              </button>
            </div>

            <span className="text-[10px] tracking-widest text-amber-400/80 uppercase block">
              PLATFORM STATUS DISPLAY
            </span>
            <div className="text-2xl font-black text-amber-400 uppercase tracking-wider my-1">
              {STAGES[activeIndex]?.label}
            </div>
            <p className="text-xs text-amber-200/90 font-sans">
              {STAGES[activeIndex]?.desc}
            </p>

            {isReady && (
              <div className="mt-3 bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg animate-bounce flex items-center justify-center gap-1.5">
                <Bell className="w-4 h-4" />
                <span>PLEASE COLLECT YOUR DRINK AT COUNTER!</span>
              </div>
            )}
          </div>

          {/* Stepper Progress */}
          <div className="space-y-3 font-mono">
            {STAGES.map((stage, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              return (
                <div key={stage.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                        isPast
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : isCurrent
                          ? "bg-amber-400 text-slate-950 border-slate-900 ring-4 ring-amber-300/60"
                          : "bg-slate-200 text-slate-500 border-slate-300"
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div
                        className={`w-0.5 h-6 my-0.5 ${
                          idx < activeIndex ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <div
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-slate-950 font-black text-sm"
                          : isPast
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans">
                      {stage.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Stub */}
          <div className="border-2 border-dashed border-slate-400 bg-white rounded-xl p-3 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-600 border-b pb-1">
              <span>Passenger: {order.customerName}</span>
              <span>₹{order.total} • {order.paymentMethod.toUpperCase()}</span>
            </div>
            <div className="space-y-0.5 pt-1">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-slate-800">
                  <span>
                    {i.quantity}x {i.productName} ({i.variantName})
                  </span>
                  <span>₹{i.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location info */}
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-sans bg-amber-100 p-2.5 rounded-lg border border-amber-300">
            <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Froosh Junction Counter:</strong> Padma Pukur, Bihar Bus Stand, Entally, Kolkata – 700014
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
