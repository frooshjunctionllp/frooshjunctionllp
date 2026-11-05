"use client";

import React, { useState, useEffect } from "react";
import { CustomerPass, RewardVoucher } from "@/types";
import { storageService } from "@/services/storageService";
import { InstagramIcon } from "@/components/icons";
import {
  X,
  Train,
  Sparkles,
  Award,
  Ticket,
  QrCode,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronRight,
  Flame,
  CheckCircle2,
  Milk,
  GlassWater,
  Phone,
  User,
  ArrowRight,
} from "lucide-react";

interface PassengerRailPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPass: CustomerPass | null;
  onPassUpdated: (pass: CustomerPass | null) => void;
  vouchers: RewardVoucher[];
  onRedeemVoucher?: (voucherId: string) => void;
  onRedirectToMenu?: () => void;
}

export const PassengerRailPassModal: React.FC<PassengerRailPassModalProps> = ({
  isOpen,
  onClose,
  currentPass,
  onPassUpdated,
  vouchers,
  onRedeemVoucher,
  onRedirectToMenu,
}) => {
  const [passengerName, setPassengerName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [mode, setMode] = useState<"create" | "restore">("create");
  const [restoreInput, setRestoreInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedPnr, setCopiedPnr] = useState(false);

  useEffect(() => {
    if (currentPass) {
      setPassengerName(currentPass.name);
      setPhone(currentPass.phone || "");
      setInstagramId(currentPass.instagramId ? currentPass.instagramId.replace(/^@/, "") : "");
    }
  }, [currentPass]);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const cleanName = passengerName.trim();

    if (!cleanPhone || cleanPhone.length < 7) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }
    if (!cleanName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    const newPass = storageService.registerCustomer(
      cleanName,
      cleanPhone,
      instagramId.trim() ? instagramId.trim() : undefined
    );

    onPassUpdated(newPass);
    setErrorMessage("");
    onClose();
    if (onRedirectToMenu) {
      onRedirectToMenu();
    }
  };

  const handleRestore = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = restoreInput.trim().replace(/[\s-]/g, "");
    if (!cleanInput) {
      setErrorMessage("Enter your Phone Number or PNR code (e.g. FJ-1001)");
      return;
    }

    const passes = storageService.getCustomerPasses();
    const pass = passes.find(
      (p) =>
        (p.phone && p.phone.replace(/[\s-]/g, "") === cleanInput) ||
        p.pnr.toUpperCase() === cleanInput.toUpperCase() ||
        p.name.toLowerCase() === cleanInput.toLowerCase()
    );

    if (pass) {
      storageService.setCurrentCustomerPass(pass);
      onPassUpdated(pass);
      setErrorMessage("");
      onClose();
      if (onRedirectToMenu) {
        onRedirectToMenu();
      }
    } else {
      setErrorMessage("No passenger found with this Phone Number or PNR. Please verify or register below.");
    }
  };

  const handleCopyPnr = (pnr: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pnr);
      setCopiedPnr(true);
      setTimeout(() => setCopiedPnr(false), 2000);
    }
  };

  const handleSignOut = () => {
    storageService.setCurrentCustomerPass(null);
    onPassUpdated(null);
    setPassengerName("");
    setPhone("");
    setInstagramId("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-amber-50 rounded-2xl shadow-2xl border-4 border-slate-900 overflow-hidden my-6">
        {/* Header - Railway Style */}
        <div className="bg-slate-900 text-amber-400 p-4 flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-base font-black tracking-wider uppercase">
                Froosh Rail Pass • Passenger Lounge
              </h3>
              <p className="text-[11px] text-amber-200/80 font-mono">
                Pure Juices & Shakes • Daily Drink Habit Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* If No Pass Active: Simple, 3-field Registration */}
          {!currentPass ? (
            <div className="space-y-4 font-mono">
              <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="font-sans leading-relaxed">
                  <strong className="block font-bold mb-0.5 font-mono">
                    Instant Passenger Boarding:
                  </strong>
                  Add your <strong>Phone Number</strong>, <strong>Name</strong>, and optional{" "}
                  <strong>Instagram ID</strong>. Your login session will be remembered and you&apos;ll be directed straight to the menu!
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex border-2 border-slate-900 rounded-lg overflow-hidden p-0.5 bg-slate-200 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode("create");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-1.5 font-bold transition-colors cursor-pointer ${
                    mode === "create"
                      ? "bg-slate-900 text-amber-400 shadow-sm"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  Register New Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("restore");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-1.5 font-bold transition-colors cursor-pointer ${
                    mode === "restore"
                      ? "bg-slate-900 text-amber-400 shadow-sm"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  Find by Phone / PNR
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-300">
                  {errorMessage}
                </div>
              )}

              {mode === "create" ? (
                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Phone Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-red-600" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border-2 border-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      <span>Your Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full bg-white border-2 border-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Instagram ID (Optional) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                        <span>Instagram ID</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-sans font-bold">
                        (Optional)
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                        @
                      </span>
                      <input
                        type="text"
                        placeholder="frooshfan"
                        value={instagramId}
                        onChange={(e) => setInstagramId(e.target.value)}
                        className="w-full bg-white border-2 border-slate-900 rounded-xl pl-7 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-mono font-black py-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] hover:shadow-none transition-all uppercase text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    <span>Board & View Drink Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRestore} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-800">
                      Phone Number or PNR Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210 or FJ-8921"
                      value={restoreInput}
                      onChange={(e) => setRestoreInput(e.target.value)}
                      className="w-full bg-white border-2 border-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono font-bold py-2.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Restore Drink Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Active Pass View: The Vintage Platform Ticket Card */
            <div className="space-y-4">
              <div className="border-3 border-slate-900 bg-amber-300 rounded-xl p-4 shadow-[4px_4px_0px_#0f172a] relative overflow-hidden font-mono text-slate-950">
                {/* Railway Pass Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-slate-950" />
                    <span className="font-black text-xs uppercase tracking-wider">
                      FROOSH JUNCTION • DIGITAL RAIL PASS
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-bold">
                    VALID 2026-27
                  </span>
                </div>

                {/* Passenger Info */}
                <div className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-700 block">
                      PASSENGER NAME
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wide">
                      {currentPass.name}
                    </h2>
                    <div className="text-xs text-slate-800 font-sans mt-0.5">
                      <span>📱 {currentPass.phone || "No phone"}</span>
                      {currentPass.instagramId && (
                        <span className="ml-2 font-bold text-slate-900">
                          {currentPass.instagramId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PNR Code */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-700 block">
                      PNR NUMBER
                    </span>
                    <div className="text-base font-black bg-slate-950 text-amber-300 px-2 py-1 rounded">
                      {currentPass.pnr}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPnr(currentPass.pnr)}
                      className="text-[10px] text-slate-800 hover:underline mt-1 block text-right w-full cursor-pointer"
                    >
                      {copiedPnr ? "Copied!" : "Copy PNR"}
                    </button>
                  </div>
                </div>

                {/* Real-time Drink Tracker Summary */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-slate-900 text-xs">
                  <div className="bg-slate-950 text-amber-300 rounded-lg p-2 text-center">
                    <div className="text-[10px] uppercase font-bold">Pure Juices</div>
                    <div className="text-lg font-black text-white">
                      {currentPass.stats.totalJuices}
                    </div>
                  </div>
                  <div className="bg-slate-950 text-amber-300 rounded-lg p-2 text-center">
                    <div className="text-[10px] uppercase font-bold">Thick Shakes</div>
                    <div className="text-lg font-black text-red-400">
                      {currentPass.stats.totalShakes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onRedirectToMenu) onRedirectToMenu();
                  }}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_#000] text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                >
                  <GlassWater className="w-4 h-4" />
                  <span>Go to Menu</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Switch User</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
