"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, ShieldCheck } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode with parent when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || "Authentication failed");
        }
      } else {
        const res = await register(name, email, password, phone);
        if (!res.success) {
          setError(res.error || "Registration failed");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: "admin" | "staff" | "patron") => {
    setMode("login");
    setError(null);
    if (role === "admin") {
      setEmail("admin@lumiere.com");
      setPassword("Admin@123");
    } else if (role === "staff") {
      setEmail("staff@lumiere.com");
      setPassword("Staff@123");
    } else {
      setEmail("alex@example.com");
      setPassword("Patron@123");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl glass-panel-elevated p-8 text-neutral-100 shadow-gold-glow border border-gold-500/30 overflow-hidden">
        {/* Ambient Top Glow Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-xs text-gold-400 font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            LUMIÈRE PRIVILEGE
          </div>
          <h2 className="text-2xl font-serif font-bold tracking-wide text-white">
            {mode === "login" ? "Welcome Back to Lumière" : "Create Patron Account"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            {mode === "login"
              ? "Access your reserved luxury seats, digital tickets, and concierge"
              : "Join our exclusive cinema circle for VIP privileges and early bookings"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-neutral-900/80 p-1 mb-6 border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
              mode === "login"
                ? "bg-gold-500 text-neutral-950 shadow-md font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
              mode === "register"
                ? "bg-gold-500 text-neutral-950 shadow-md font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <span className="font-semibold text-red-400">Notice:</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Julian Stark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="patron@lumiere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg font-button font-bold text-sm tracking-wide bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-neutral-950 hover:brightness-110 active:scale-[0.99] transition duration-200 shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
            ) : mode === "login" ? (
              "Enter Lumière Experience"
            ) : (
              "Complete Privilege Registration"
            )}
          </button>
        </form>

        {/* Demo Fast-Login Strip */}
        <div className="mt-6 pt-5 border-t border-neutral-800">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            Quick Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin")}
              className="px-2 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/60 text-[11px] text-gold-300 font-medium transition text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("staff")}
              className="px-2 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/60 text-[11px] text-amber-200 font-medium transition text-center"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("patron")}
              className="px-2 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/60 text-[11px] text-emerald-300 font-medium transition text-center"
            >
              Patron
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
