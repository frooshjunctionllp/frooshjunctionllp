"use client";

import React, { useState } from "react";
import { AuthSession, WorkerUser } from "@/types";
import {
  Lock,
  User,
  Shield,
  LogIn,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface AdminLoginFormProps {
  onLoginSuccess: (user: AuthSession) => void;
  workers: WorkerUser[];
  onBackToCustomer?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  onLoginSuccess,
  workers,
  onBackToCustomer,
}) => {
  const [username, setUsername] = useState("admin");
  const [pin, setPin] = useState("admin123");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const inputUser = username.trim();
    const inputPin = pin.trim();

    if (!inputUser || !inputPin) {
      setErrorMsg("Please enter Admin ID/Email and password/PIN.");
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
        if (data.user.role !== "admin") {
          setErrorMsg("Access Denied: Worker accounts cannot enter Admin Console. Please use /staff.");
          setIsLoading(false);
          return;
        }
        onLoginSuccess(data.user);
        return;
      } else {
        setErrorMsg(data.message || "Invalid Admin credentials. Check ID and Password.");
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
        if (matched.role !== "admin") {
          setErrorMsg("Access Denied: Worker accounts must log in at /staff.");
        } else if (!matched.isActive) {
          setErrorMsg("Account is currently disabled.");
        } else {
          onLoginSuccess({
            id: matched.id,
            username: matched.username,
            name: matched.name,
            role: matched.role,
          });
          return;
        }
      } else {
        setErrorMsg("Incorrect Admin ID or Password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPin(pass);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative selection:bg-amber-300 selection:text-amber-950">
      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-pixel text-xl text-red-600 tracking-wider">
              FROOSH
            </span>
            <span className="font-pixel text-xl text-slate-900 tracking-wider">
              JUNCTION
            </span>
          </div>
          <h1 className="font-mono text-base font-black text-slate-900 uppercase tracking-tight">
            Master Admin Security Console
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Full Store Operations, Financials, Reports & Worker Controls
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
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 font-mono">
            <div className="flex items-center gap-2 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Restricted Management Gateway</span>
            </div>
            <p className="text-[11px] text-red-700">
              Only authorized store administrators can access sales records, worker management, and pricing controls.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            {errorMsg && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Admin Username / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin Username or Email</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or asad@froosh.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Password / PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Password / Security PIN</span>
              </label>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-0 outline-none transition-all bg-slate-50 focus:bg-white tracking-widest"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-sm uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0f172a] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Enter Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Admin Login */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 font-mono block mb-2 text-center">
              Quick Admin Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin", "admin123")}
                className="p-2 border-2 border-slate-200 hover:border-slate-900 rounded-xl bg-slate-50 hover:bg-white text-left transition-all cursor-pointer font-mono"
              >
                <div className="text-xs font-black text-slate-900">Store Owner</div>
                <div className="text-[10px] text-slate-500">admin • admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("asad@froosh.com", "asad1234")}
                className="p-2 border-2 border-slate-200 hover:border-slate-900 rounded-xl bg-slate-50 hover:bg-white text-left transition-all cursor-pointer font-mono"
              >
                <div className="text-xs font-black text-slate-900">Asad Admin</div>
                <div className="text-[10px] text-slate-500">asad@froosh.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
