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
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthSession | null;
  workers: WorkerUser[];
  onLoginSuccess: (user: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  workers,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "quickSwitch">("login");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!username.trim() || !pin.trim()) {
      setErrorMsg("Please enter both login ID and password/PIN");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin: pin.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || "Invalid credentials. Please try again.");
      }
    } catch {
      // Local fallback check
      const matched = workers.find(
        (w) =>
          (w.username.toLowerCase() === username.trim().toLowerCase() ||
            w.id.toLowerCase() === username.trim().toLowerCase()) &&
          w.pin === pin.trim()
      );
      if (matched) {
        if (!matched.isActive) {
          setErrorMsg("This account is inactive. Contact store admin.");
        } else {
          onLoginSuccess({
            id: matched.id,
            username: matched.username,
            name: matched.name,
            role: matched.role,
          });
          onClose();
        }
      } else {
        setErrorMsg("Incorrect login ID or password/PIN");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (worker: WorkerUser) => {
    setUsername(worker.username);
    setPin(worker.pin);
    setActiveTab("login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-red-600 font-black">
              FJ
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">
                Staff Authentication
              </h3>
              <p className="text-xs text-slate-500">
                Switch between Admin & Worker shifts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Current status pill */}
        {currentUser && (
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  currentUser.role === "admin" ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
              <div>
                <p className="text-xs text-slate-500 font-medium">Currently active as</p>
                <p className="text-sm font-bold text-slate-900">
                  {currentUser.name}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    ({currentUser.role.toUpperCase()})
                  </span>
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {currentUser.id}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Login Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quickSwitch")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "quickSwitch"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terminal Accounts
          </button>
        </div>

        {activeTab === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Worker ID / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or ID"
                  autoCapitalize="none"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password / 4-Digit PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your password or PIN"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? "Verifying..." : "Sign In to Terminal"}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <p className="text-xs text-slate-500 mb-2">
              Select an account below to pre-fill credentials for this POS terminal:
            </p>
            {workers.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => handleQuickSelect(w)}
                className="w-full p-2.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      w.role === "admin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {w.role === "admin" ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <Briefcase className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">
                      {w.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ID: {w.username} • Role: {w.role}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
