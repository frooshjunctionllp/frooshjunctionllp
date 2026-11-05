"use client";

import React, { useState } from "react";
import { AuthSession, WorkerUser } from "@/types";
import {
  Lock,
  User,
  LogIn,
  KeyRound,
  ArrowRight,
  AlertCircle,
  ChefHat,
  CheckCircle2,
} from "lucide-react";

interface StaffLoginFormProps {
  onLoginSuccess: (user: AuthSession) => void;
  workers: WorkerUser[];
  onBackToCustomer?: () => void;
}

export const StaffLoginForm: React.FC<StaffLoginFormProps> = ({
  onLoginSuccess,
  workers,
  onBackToCustomer,
}) => {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const inputUser = username.trim();
    const inputPin = pin.trim();

    if (!inputUser || !inputPin) {
      setErrorMsg("Please enter both Worker ID/Username and PIN.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUser, pin: inputPin }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setIsSuccess(true);
        onLoginSuccess(data.user);
        setTimeout(() => {
          window.location.href = "/staff";
        }, 700);
        return;
      } else {
        setErrorMsg(data.message || "Invalid Worker credentials. Check ID and PIN.");
        setIsLoading(false);
      }
    } catch {
      // Local fallback check
      const matched = workers.find(
        (w) =>
          (w.username.toLowerCase() === inputUser.toLowerCase() ||
            w.id.toLowerCase() === inputUser.toLowerCase()) &&
          w.pin === inputPin
      );

      if (matched) {
        if (!matched.isActive) {
          setErrorMsg("Account is currently disabled. Contact Admin.");
        } else {
          const session = {
            id: matched.id,
            username: matched.username,
            name: matched.name,
            role: matched.role,
          };
          setIsSuccess(true);
          onLoginSuccess(session);
          setTimeout(() => {
            window.location.href = "/staff";
          }, 700);
          return;
        }
      } else {
        setErrorMsg("Incorrect Worker ID or PIN.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative selection:bg-amber-300 selection:text-amber-950">
      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img
              src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png"
              alt="Froosh Junction"
              className="h-16 w-auto object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="font-mono text-base font-black text-slate-900 uppercase tracking-tight">
            Staff & Barista Terminal
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Order Intake & Orders Dispatch
          </p>
          {onBackToCustomer && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToCustomer}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                <span>← Back to Customer Platform</span>
              </button>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white border-3 border-slate-900 rounded-3xl shadow-[5px_5px_0px_#0f172a] p-6 sm:p-8">
          {isSuccess ? (
            /* High-End Sleek Branded Redirect Loader */
            <div className="text-center py-6 space-y-4 font-mono animate-in fade-in zoom-in-95 duration-200">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-emerald-600 animate-spin" />
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center border-2 border-emerald-500">
                  <ChefHat className="w-7 h-7" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  Shift Active
                </h2>
                <p className="text-xs text-emerald-700 font-bold">
                  Opening Register & Orders Board...
                </p>
              </div>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: "90%" }} />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-mono">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Shift Sign In</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Staff members can punch in orders and confirm live tickets. Sales & financial reports are restricted.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 font-mono">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Username / Worker ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Worker ID / Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Worker ID or username"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* PIN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Security PIN</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white tracking-widest"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-sm uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0f172a] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Shift...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Clock In & Open Register</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
