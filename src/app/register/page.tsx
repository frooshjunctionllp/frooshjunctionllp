"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storageService } from "@/services/storageService";
import { InstagramIcon } from "@/components/icons";
import {
  Train,
  Ticket,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const cleanInsta = instagram.trim().replace(/^@/, "");

    if (!cleanName) {
      setErrorMsg("Please enter your name.");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setIsLoading(true);

    try {
      storageService.init();
      const pass = storageService.registerCustomer(
        cleanName,
        cleanPhone,
        cleanInsta ? `@${cleanInsta}` : undefined
      );

      // Persist to MongoDB Atlas directly
      try {
        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: pass.customerId || pass.pnr,
            name: cleanName,
            phone: cleanPhone,
            instagramId: cleanInsta ? `@${cleanInsta}` : "",
            gender: "other",
            createdAt: new Date().toISOString(),
          }),
        });
      } catch (apiErr) {
        console.warn("MongoDB sync warning on register:", apiErr);
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/?tab=menu");
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create pass. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-900 bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-full">
          <Ticket className="w-3.5 h-3.5 text-amber-700" />
          <span>Passenger Registration</span>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white border-3 border-slate-900 rounded-3xl shadow-[6px_6px_0px_#0f172a] p-6 sm:p-8 relative overflow-hidden">
          {/* Logo Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <img
                src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png"
                alt="Froosh Junction"
                className="h-16 w-auto object-contain drop-shadow-sm"
              />
            </div>
            <h1 className="font-mono text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Create Your Drink Pass
            </h1>
            <p className="text-xs text-slate-600 font-mono mt-1">
              Join the Froosh Club • Track what you drink & get loyalty perks
            </p>
          </div>

          {/* Success Banner */}
          {isSuccess ? (
            <div className="text-center py-8 space-y-4 font-mono animate-in fade-in zoom-in-95 duration-300">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-red-600 animate-spin" />
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center border-2 border-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Pass Activated!
              </h2>
              <p className="text-xs text-emerald-700 font-bold">
                Welcome aboard, {name}. Directing you to the juice menu...
              </p>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full animate-pulse" style={{ width: "80%" }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono">
              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mobile Phone Number *</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={13}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Used to save your drink history and match your orders.
                </p>
              </div>

              {/* Instagram Handle (Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram ID</span>
                  </label>
                  <span className="text-[10px] text-slate-400 italic">Optional</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="yourhandle"
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Perks Pill */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-[11px] text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Your Drink Pass includes:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[10.5px]">
                  <li>Personal drink journal & habit analytics</li>
                  <li>Exclusive station discounts & milestone perks</li>
                  <li>Zero password hassle — 100% phone linked</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-sm uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0f172a] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Activating Pass...</span>
                  </div>
                ) : (
                  <>
                    <span>Register & Go to Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Already registered switch */}
              <div className="pt-3 text-center border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Already have a pass or registered before?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                  >
                    Login with Phone
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full text-center py-3 text-[11px] text-slate-500 font-mono">
        <p>Froosh Junction • Padma Pukur, Entally, Kolkata – 700014</p>
      </footer>
    </div>
  );
}
