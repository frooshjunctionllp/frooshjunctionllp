"use client";

import React, { useState } from "react";
import { AuthSession, WorkerUser } from "@/types";
import {
  Lock,
  User,
  Shield,
  Briefcase,
  LogIn,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: AuthSession) => void;
  workers: WorkerUser[];
  onBackToCustomer?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  workers,
  onBackToCustomer,
}) => {
  const [loginType, setLoginType] = useState<"employee" | "admin">("employee");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (type: "employee" | "admin") => {
    setLoginType(type);
    setErrorMsg("");
    if (type === "admin") {
      setUsername("asad@froosh.com");
      setPin("asad1234");
    } else {
      setUsername("worker1");
      setPin("1234");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const inputUser = username.trim();
    const inputPin = pin.trim();

    if (!inputUser || !inputPin) {
      setErrorMsg("Please enter both login identifier and password/PIN.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUser, pin: inputPin }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        return;
      } else {
        setErrorMsg(data.message || "Invalid credentials. Please verify your ID and password.");
      }
    } catch {
      // Local fallback for offline/instant mode
      const matched = workers.find(
        (w) =>
          (w.username.toLowerCase() === inputUser.toLowerCase() ||
            w.id.toLowerCase() === inputUser.toLowerCase()) &&
          w.pin === inputPin
      );

      if (matched) {
        if (!matched.isActive) {
          setErrorMsg("Account is currently disabled. Please contact the administrator.");
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
        setErrorMsg("Incorrect ID or Password. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (userLogin: string, userPin: string, type: "employee" | "admin") => {
    setLoginType(type);
    setUsername(userLogin);
    setPin(userPin);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative selection:bg-amber-300 selection:text-amber-950">
      {/* Subtle tasteful radial warm wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md sm:max-w-lg mx-auto relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="font-pixel text-xl sm:text-2xl text-red-600 tracking-wider">
              FROOSH
            </span>
            <span className="font-pixel text-xl sm:text-2xl text-slate-900 tracking-wider">
              JUNCTION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-[42ch] mx-auto leading-relaxed">
            Juice & Shake Management Portal • Select your role to continue
          </p>
          {onBackToCustomer && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToCustomer}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors cursor-pointer"
              >
                <span>← Back to Customer QR Website</span>
              </button>
            </div>
          )}
        </div>

        {/* Elevated Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          {/* Top Role Switcher */}
          <div className="grid grid-cols-2 gap-1.5 mb-6 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTabChange("employee")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginType === "employee"
                  ? "bg-white text-emerald-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Worker Terminal</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("admin")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginType === "admin"
                  ? "bg-white text-red-600 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Store Admin</span>
            </button>
          </div>

          {/* Section Intro */}
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {loginType === "employee" ? "Worker Terminal Sign In" : "Store Admin Portal"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-normal">
              {loginType === "employee"
                ? "Sign in with your Worker ID and PIN to take juice & shake orders."
                : "Full access to sales records, business reports, menu items, and staff accounts."}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200/80 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {loginType === "admin" ? "Admin Email or Username" : "Worker ID / Username"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    loginType === "admin" ? "asad@froosh.com" : "e.g. worker1 or WRK-001"
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {loginType === "admin" ? "Admin Password" : "PIN / Password"}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={loginType === "admin" ? "asad1234" : "e.g. 1234"}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white font-semibold rounded-xl text-sm transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                loginType === "admin"
                  ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                  : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isLoading
                  ? "Authenticating..."
                  : loginType === "admin"
                  ? "Log In to Admin Dashboard"
                  : "Open Worker Dashboard"}
              </span>
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick 1-Tap Logins:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  fillQuickCredentials("asad@froosh.com", "asad1234", "admin")
                }
                className="p-2.5 text-left bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border border-slate-200/80 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold text-slate-900 block group-hover:text-red-600 transition-colors">
                    Admin (Asad)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    asad@froosh.com
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() =>
                  fillQuickCredentials("worker1", "1234", "employee")
                }
                className="p-2.5 text-left bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border border-slate-200/80 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold text-slate-900 block group-hover:text-emerald-700 transition-colors">
                    Worker (Aakash)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    worker1 • 1234
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-5 text-xs text-slate-500">
          <p>
            Connected to <strong>MongoDB Atlas</strong> • Role-Protected Terminals
          </p>
        </div>
      </div>
    </div>
  );
};
