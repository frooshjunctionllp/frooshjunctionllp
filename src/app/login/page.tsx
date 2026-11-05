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
  Shield,
  ChefHat,
} from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successText, setSuccessText] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setErrorMsg("Please enter your mobile phone number, PNR, or Staff/Admin ID.");
      return;
    }

    setIsLoading(true);

    try {
      storageService.init();

      // Check if user entered admin or worker username directly on this page
      const lower = cleanInput.toLowerCase();
      if (lower === "admin" || lower === "asad@froosh.com") {
        setSuccessText("Admin credentials recognized. Redirecting to Admin Security Console...");
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/admin";
        }, 700);
        return;
      }
      if (lower === "worker1" || lower === "worker2" || lower.startsWith("wrk")) {
        setSuccessText("Staff account recognized. Redirecting to Staff Terminal...");
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/staff";
        }, 700);
        return;
      }

      const cleanPhone = cleanInput.replace(/[\s-]/g, "");

      // 1. Check local storage passes first for instant zero-latency match
      const localPasses = storageService.getCustomerPasses();
      const localMatch = localPasses.find(
        (p) =>
          p.phone?.replace(/[\s-]/g, "") === cleanPhone ||
          p.pnr.toLowerCase() === cleanInput.toLowerCase() ||
          p.customerId?.toLowerCase() === cleanInput.toLowerCase()
      );

      if (localMatch) {
        storageService.setCurrentCustomerPass(localMatch);
        setSuccessText(`Welcome back, ${localMatch.name}! Retrieving your drink journal...`);
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/?tab=menu";
        }, 800);
        return;
      }

      // 2. Query MongoDB Atlas customers by phone
      const res = await fetch(`/api/customers?phone=${encodeURIComponent(cleanPhone)}`);
      const data = await res.json();

      if (data.success && data.customer) {
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
        setSuccessText(`Welcome back, ${c.name}! Opening menu...`);
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/?tab=menu";
        }, 800);
        return;
      }

      setErrorMsg(
        "No customer pass found with this phone number. Please register your pass below."
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
          <span>Back to Menu</span>
        </Link>
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-900 bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-full">
          <Ticket className="w-3.5 h-3.5 text-amber-700" />
          <span>Passenger Sign In</span>
        </div>
      </header>

      {/* Main Login Card */}
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
              Sign In to Your Pass
            </h1>
            <p className="text-xs text-slate-600 font-mono mt-1">
              Enter your registered mobile phone number to open your drink pass
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
                Logged In Successfully!
              </h2>
              <p className="text-xs text-emerald-700 font-bold max-w-xs mx-auto">
                {successText || "Retrieving your pass & loading menu..."}
              </p>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full animate-pulse" style={{ width: "85%" }} />
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

              {/* Phone / Identifier Input */}
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
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Enter the phone number used when ordering or registering.
                </p>
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
                    <span>Checking Passenger Pass...</span>
                  </div>
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

              {/* Store Operations Access */}
              <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-mono">
                <Link
                  href="/staff"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 hover:underline"
                >
                  <ChefHat className="w-3 h-3 text-emerald-600" />
                  <span>Staff Terminal</span>
                </Link>
                <span>•</span>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-red-700 hover:underline"
                >
                  <Shield className="w-3 h-3 text-red-600" />
                  <span>Admin Console</span>
                </Link>
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
