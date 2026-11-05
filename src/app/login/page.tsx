"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storageService } from "@/services/storageService";
import { CustomerPass } from "@/types";
import {
  Train,
  Ticket,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanInput = phone.trim().replace(/[\s-]/g, "");
    if (!cleanInput || cleanInput.length < 5) {
      setErrorMsg("Please enter your registered mobile number or PNR.");
      return;
    }

    setIsLoading(true);

    try {
      storageService.init();

      // 1. Check local storage passes first for instant zero-latency match
      const localPasses = storageService.getCustomerPasses();
      const localMatch = localPasses.find(
        (p) =>
          p.phone?.replace(/[\s-]/g, "") === cleanInput ||
          p.pnr.toLowerCase() === cleanInput.toLowerCase() ||
          p.customerId?.toLowerCase() === cleanInput.toLowerCase()
      );

      if (localMatch) {
        storageService.setCurrentCustomerPass(localMatch);
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/?tab=menu");
        }, 700);
        return;
      }

      // 2. Query MongoDB Atlas customers
      const res = await fetch(`/api/customers?phone=${encodeURIComponent(cleanInput)}`);
      const data = await res.json();

      if (data.success && data.customer) {
        // Customer exists in MongoDB Atlas! Create / restore pass locally
        const c = data.customer;
        const restoredPass: CustomerPass = {
          id: `pass-${c.id}`,
          pnr: `FJ-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: c.id,
          name: c.name,
          phone: c.phone,
          instagramId: c.instagramId || undefined,
          pin: "1234",
          stats: {
            totalJuices: 0,
            totalShakes: 0,
            totalOrders: 0,
            totalSpent: 0,
          },
          createdAt: c.createdAt || new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };

        storageService.saveCustomerPass(restoredPass);
        storageService.setCurrentCustomerPass(restoredPass);
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/?tab=menu");
        }, 700);
        return;
      }

      // If not found in DB or local passes:
      setErrorMsg(
        "No customer pass found with this phone number. Please register your pass first."
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please try again.");
    } finally {
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
          <span>Back to Froosh Platform</span>
        </Link>
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-900 bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-full">
          <Ticket className="w-3.5 h-3.5 text-amber-700" />
          <span>Passenger Sign In</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white border-3 border-slate-900 rounded-3xl shadow-[6px_6px_0px_#0f172a] p-6 sm:p-8 relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-400 text-slate-950 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-3">
              <Train className="w-6 h-6" />
            </div>
            <h1 className="font-mono text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Customer Sign In
            </h1>
            <p className="text-xs text-slate-600 font-mono mt-1">
              Enter your mobile phone number to open your drink pass
            </p>
          </div>

          {/* Success Banner */}
          {isSuccess ? (
            <div className="text-center py-8 space-y-3 font-mono animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full border-2 border-emerald-500 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Logged In Successfully!
              </h2>
              <p className="text-xs text-emerald-700 font-bold">
                Retrieving your pass & loading menu...
              </p>
              <div className="pt-2">
                <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 font-mono">
              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-1.5 bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition-colors mt-1"
                  >
                    <span>Create New Drink Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Phone Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mobile Phone Number</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Enter the phone number you used when ordering or registering.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-sm uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0f172a] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Checking Passenger Pass...</span>
                ) : (
                  <>
                    <span>Sign In & Open Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Register Callout */}
              <div className="pt-3 text-center border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Don&apos;t have a drink pass yet?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                  >
                    Register here in 10 seconds
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
