"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPaise, formatDate, formatTime } from "@/lib/utils";
import {
  Shield,
  Film,
  Ticket,
  DollarSign,
  Tv,
  CheckCircle2,
  XCircle,
  QrCode,
  Search,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Scanner state
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    // Quick fetch movies to display metrics
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          moviesCount: data.movies?.length || 5,
          totalRevenue: 34850000, // ₹3,48,500 demo revenue
          totalBookings: 64,
          activeCinemas: 4,
          movies: data.movies || [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setScanLoading(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenOrRef: scanInput.trim() }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch {
      setScanResult({ error: "Network error during scan" });
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      {/* Header Banner */}
      <section className="relative w-full border-b border-red-500/20 bg-neutral-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-xs text-red-400 font-medium mb-3">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              EXECUTIVE ADMIN CONSOLE
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-white">
              Cinema Operations & <span className="gold-text-gradient">Gate Scanner</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl">
              Real-time box office telemetry, auditorium scheduling controls, and staff QR admission scanner.
            </p>
          </div>
        </div>
      </section>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-neutral-800">
            <p className="text-xs text-neutral-400 font-mono uppercase">Gross Box Office</p>
            <p className="text-3xl font-bold text-white mt-1">₹3,48,500</p>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">↑ 18.4% vs last week</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-neutral-800">
            <p className="text-xs text-neutral-400 font-mono uppercase">Confirmed Bookings</p>
            <p className="text-3xl font-bold text-white mt-1">142 Tickets</p>
            <p className="text-[11px] text-gold-400 mt-2 font-medium">92% Online UPI / Cards</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-neutral-800">
            <p className="text-xs text-neutral-400 font-mono uppercase">Flagship Cinemas</p>
            <p className="text-3xl font-bold text-white mt-1">4 Destinations</p>
            <p className="text-[11px] text-neutral-400 mt-2 font-medium">Delhi, Noida, Mumbai, BLR</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-neutral-800">
            <p className="text-xs text-neutral-400 font-mono uppercase">Active Now Showing</p>
            <p className="text-3xl font-bold text-white mt-1">{stats?.moviesCount || 5} Movies</p>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">100% Screen Occupancy</p>
          </div>
        </div>

        {/* Gate Usher Ticket Verification Scanner */}
        <div className="rounded-3xl glass-panel-elevated p-8 border border-gold-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Staff Gate Ticket Scanner</h2>
              <p className="text-xs text-neutral-400">
                Scan or paste the ticket’s secure token or booking reference (e.g. LUM-2026-XXXX) to verify admission and prevent double check-ins.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyTicket} className="flex flex-col sm:flex-row gap-3 max-w-xl mb-6">
            <input
              type="text"
              required
              placeholder="e.g. LUM-2026-X89F2 or secure token"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-sm placeholder-neutral-500 focus:outline-none focus:border-gold-500"
            />
            <button
              type="submit"
              disabled={scanLoading}
              className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-neutral-950 font-button font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2"
            >
              {scanLoading ? "Scanning..." : "Verify & Check In"}
            </button>
          </form>

          {/* Scanner Feedback Display */}
          {scanResult && (
            <div
              className={`p-6 rounded-2xl border text-sm animate-fadeIn ${
                scanResult.valid
                  ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                  : scanResult.alreadyCheckedIn
                  ? "bg-amber-950/50 border-amber-500/50 text-amber-200"
                  : "bg-red-950/50 border-red-500/50 text-red-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-2">
                {scanResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-400" />
                )}
                <span>{scanResult.message || scanResult.error}</span>
              </div>

              {scanResult.ticket && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Movie:</span>
                    <span className="text-white font-bold">{scanResult.ticket.booking.showtime.movie.title}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Cinema & Screen:</span>
                    <span className="text-white font-bold">
                      {scanResult.ticket.booking.showtime.screen.cinema.name} • {scanResult.ticket.booking.showtime.screen.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Seats:</span>
                    <span className="text-gold-300 font-bold">
                      {scanResult.ticket.booking.seats.map((s: any) => `${s.seat.row}${s.seat.number}`).join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
