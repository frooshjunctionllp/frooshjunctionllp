"use client";

import React, { useState, useEffect } from "react";
import { CustomerPass } from "@/types";
import { storageService } from "@/services/storageService";
import { InstagramIcon } from "@/components/icons";
import {
  X,
  Phone,
  User,
  ArrowRight,
  Train,
  Sparkles,
  CheckCircle2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface CustomerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPass: CustomerPass | null;
  onPassUpdated: (pass: CustomerPass | null) => void;
  onRedirectToMenu: () => void;
}

export const CustomerRegisterModal: React.FC<CustomerRegisterModalProps> = ({
  isOpen,
  onClose,
  currentPass,
  onPassUpdated,
  onRedirectToMenu,
}) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentPass) {
      setName(currentPass.name || "");
      setPhone(currentPass.phone || "");
      setInstagramId(currentPass.instagramId ? currentPass.instagramId.replace(/^@/, "") : "");
    }
  }, [currentPass]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const cleanName = name.trim();

    if (!cleanPhone) {
      setErrorMessage("Please enter your phone number to continue.");
      return;
    }

    if (cleanPhone.length < 7) {
      setErrorMessage("Please enter a valid phone number (at least 7 digits).");
      return;
    }

    if (!cleanName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const pass = storageService.registerCustomer(
        cleanName,
        cleanPhone,
        instagramId.trim() ? instagramId.trim() : undefined
      );

      onPassUpdated(pass);
      setIsSubmitting(false);
      onClose();
      // Redirect straight to Menu page!
      onRedirectToMenu();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "Failed to save registration.");
    }
  };

  const handleSignOut = () => {
    storageService.setCurrentCustomerPass(null);
    onPassUpdated(null);
    setName("");
    setPhone("");
    setInstagramId("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-amber-50 rounded-2xl shadow-2xl border-4 border-slate-900 overflow-hidden my-6 font-mono">
        {/* Header */}
        <div className="bg-slate-900 text-amber-400 p-4 flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wider uppercase">
                {currentPass ? "Your account" : "Your Froosh account"}
              </h3>
              <p className="text-[11px] text-amber-200/80">
                Froosh Junction • Pure Juices & Shakes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {currentPass ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono">
                    Logged In
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    ID: {currentPass.pnr}
                  </span>
                </div>
                <div className="text-lg font-black">{currentPass.name}</div>
                <div className="text-xs font-sans text-emerald-800 space-y-1">
                  <div>📱 Phone: {currentPass.phone || "Not set"}</div>
                  {currentPass.instagramId && (
                    <div>📸 Instagram: {currentPass.instagramId}</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRedirectToMenu();
                  }}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_#000] text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Switch or Log out"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Switch</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">Already have an account? <a className="text-red-600 underline" href="/login">Sign in</a></p>
              <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="font-sans leading-relaxed">
                  Add your name and phone number to save your details for future orders. You can also browse the menu and enter these at checkout.
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Phone Field */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
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
                <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-700" />
                  <span>Your Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Instagram ID (Optional) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
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

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] hover:shadow-none transition-all text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{isSubmitting ? "Connecting..." : "Continue to Drink Menu"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-slate-500 font-sans flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your drink habits & stats will be remembered on this device.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
