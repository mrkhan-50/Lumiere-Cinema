"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { formatPaise, formatTime, formatDate } from "@/lib/utils";
import { SEAT_CATEGORIES, CONVENIENCE_FEE_PAISE, GST_RATE } from "@/lib/constants";
import {
  Sparkles,
  Tv,
  Clock,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  ArrowRight,
  Printer,
  ChevronLeft,
} from "lucide-react";

// Dynamically import 3D Canvas
const Cinema3DAuditorium = dynamic(
  () => import("@/components/cinema3d/Cinema3DAuditorium").then((mod) => mod.Cinema3DAuditorium),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gold-400 font-mono">Loading 3D Auditorium...</p>
      </div>
    ),
  }
);

export default function BookingPage() {
  const params = useParams();
  const showtimeId = params.showtimeId as string;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("2d"); // Default to clean 2D with 1-click 3D toggle
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds

  // Checkout & Promo
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Payment & Success
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Fetch showtime and seats
  const fetchSeats = async () => {
    try {
      const res = await fetch(`/api/showtimes/${showtimeId}/seats`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [showtimeId]);

  // Countdown timer for seat hold
  useEffect(() => {
    if (!holdExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setHoldToken(null);
        setHoldExpiresAt(null);
        setSelectedSeatIds([]);
        alert("Your 5-minute seat reservation has expired. Please reselect your seats.");
        fetchSeats();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-lumiere-text">
        <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-serif text-gold-300">Loading Cinema Seating & Auditorium...</p>
      </div>
    );
  }

  if (!data?.showtime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-lumiere-text">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Showtime Not Found</h2>
        <p className="text-xs text-neutral-400 mb-6">The requested screening does not exist or has passed.</p>
        <Link href="/movies" className="px-6 py-2.5 rounded-full bg-gold-500 text-neutral-950 font-bold text-xs uppercase">
          Back to Movies
        </Link>
      </div>
    );
  }

  const { showtime, bookedSeatIds, heldSeatIds } = data;
  const seats = showtime.screen.seats;

  // Handle seat click
  const toggleSeat = (seat: any) => {
    if (bookedSeatIds.includes(seat.id) || heldSeatIds.includes(seat.id)) return;

    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  // Calculations
  const selectedSeats = seats.filter((s: any) => selectedSeatIds.includes(s.id));
  const multiplier = showtime.priceMultiplier || 1.0;
  const subtotal = selectedSeats.reduce((acc: number, s: any) => acc + Math.round(s.basePrice * multiplier), 0);
  const convenienceFee = selectedSeatIds.length > 0 ? CONVENIENCE_FEE_PAISE * selectedSeatIds.length : 0;
  const tax = Math.round((subtotal + convenienceFee) * GST_RATE);
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal + convenienceFee + tax - discount);

  // Reserve Hold
  const handleReserveSeats = async () => {
    if (selectedSeatIds.length === 0) return;
    try {
      const res = await fetch("/api/seat-holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showtimeId, seatIds: selectedSeatIds }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to reserve seats");
        fetchSeats();
        return;
      }
      setHoldToken(json.holdToken);
      setHoldExpiresAt(new Date(json.expiresAt));
    } catch {
      alert("Error contacting reservation server");
    }
  };

  // Validate Promo Code
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput, subtotal }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPromoError(json.error || "Invalid promo code");
      } else {
        setAppliedPromo(json);
      }
    } catch {
      setPromoError("Failed to validate code");
    } finally {
      setPromoLoading(false);
    }
  };

  // Complete Payment (Razorpay Test Mode / Direct Verification)
  const handlePayNow = async () => {
    if (!holdToken) {
      await handleReserveSeats();
    }
    setIsProcessingPayment(true);

    try {
      // 1. Create Order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdToken: holdToken || "TEMP",
          showtimeId,
          promoCodeId: appliedPromo?.promoId,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.error || "Payment creation failed");
        setIsProcessingPayment(false);
        return;
      }

      // 2. Simulate Razorpay checkout verification
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: orderData.bookingId,
          gatewayOrderId: orderData.gatewayOrderId,
          paymentMethod: "UPI",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        alert(verifyData.error || "Payment verification failed");
      } else {
        setConfirmedBooking({
          bookingReference: verifyData.bookingReference,
          ticketId: verifyData.ticketId,
          qrCodeData: verifyData.qrCodeData,
          movie: showtime.movie.title,
          cinema: showtime.screen.cinema.name,
          screen: showtime.screen.name,
          startsAt: showtime.startsAt,
          seats: selectedSeats.map((s: any) => `${s.row}${s.number}`).join(", "),
          totalAmount: total,
        });
      }
    } catch {
      alert("Payment processing error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Group seats by row for 2D map
  const rowsMap: Record<string, any[]> = {};
  seats.forEach((seat: any) => {
    if (!rowsMap[seat.row]) rowsMap[seat.row] = [];
    rowsMap[seat.row].push(seat);
  });

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      {/* Top Screening Info Bar */}
      <div className="border-b border-gold-500/20 bg-neutral-950/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/movies"
              className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/30">
                  {showtime.format}
                </span>
                <span className="text-xs text-neutral-400">
                  {showtime.screen.cinema.name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5">
                {showtime.movie.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold-400" />
              <span>{formatDate(showtime.startsAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold-400" />
              <span className="text-white font-bold">{formatTime(showtime.startsAt)}</span>
            </div>

            {/* View Mode Toggle Button */}
            <div className="flex items-center rounded-xl bg-neutral-900 p-1 border border-neutral-800">
              <button
                onClick={() => setViewMode("2d")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                  viewMode === "2d" ? "bg-gold-500 text-neutral-950 font-bold shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                2D Map
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1 ${
                  viewMode === "3d" ? "bg-gold-500 text-neutral-950 font-bold shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3 text-gold-400" />
                3D Auditorium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Seat Selection & Checkout Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: 2D or 3D Seat Selector */}
        <div className="lg:col-span-2 space-y-6">
          {viewMode === "3d" ? (
            <div>
              <Cinema3DAuditorium
                onSeatSelect={(seat) => {
                  const dbSeat = seats.find((s: any) => s.row === seat.row && s.number === seat.number);
                  if (dbSeat) toggleSeat(dbSeat);
                }}
                selectedSeatIds={selectedSeats.map((s: any) => `${s.row}-${s.number}`)}
                bookedSeatIds={seats.filter((s: any) => bookedSeatIds.includes(s.id)).map((s: any) => `${s.row}-${s.number}`)}
                heldSeatIds={seats.filter((s: any) => heldSeatIds.includes(s.id)).map((s: any) => `${s.row}-${s.number}`)}
              />
            </div>
          ) : (
            <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-gold-500/30">
              {/* Curved Cinema Screen Graphic */}
              <div className="mb-12 text-center">
                <div className="relative w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-full shadow-screen-glow"></div>
                <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-neutral-500 mt-2">
                  CURVED SILVER SCREEN
                </p>
              </div>

              {/* 2D Seats Grid */}
              <div className="space-y-3 overflow-x-auto pb-4">
                {Object.keys(rowsMap).map((rowLetter) => (
                  <div key={rowLetter} className="flex items-center justify-center gap-2 min-w-[500px]">
                    <span className="w-6 text-xs font-mono font-bold text-neutral-400 text-center">
                      {rowLetter}
                    </span>

                    <div className="flex items-center gap-2">
                      {rowsMap[rowLetter].map((seat: any) => {
                        const isBooked = bookedSeatIds.includes(seat.id);
                        const isHeld = heldSeatIds.includes(seat.id);
                        const isSelected = selectedSeatIds.includes(seat.id);

                        let colorClass = "bg-neutral-800 text-neutral-300 hover:border-gold-500 hover:text-white";
                        if (isBooked) {
                          colorClass = "bg-neutral-900 text-neutral-600 border-neutral-900 cursor-not-allowed";
                        } else if (isHeld) {
                          colorClass = "bg-amber-950/80 text-amber-500 border-amber-600/50 cursor-not-allowed";
                        } else if (isSelected) {
                          colorClass = "bg-gold-500 text-neutral-950 font-bold border-gold-400 shadow-gold-glow scale-105";
                        } else if (seat.category === "RECLINER") {
                          colorClass = "bg-gold-950/40 text-gold-300 border-gold-500/40 hover:bg-gold-500 hover:text-neutral-950";
                        } else if (seat.category === "EXECUTIVE") {
                          colorClass = "bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-500 hover:text-neutral-950";
                        } else if (seat.category === "PREMIUM") {
                          colorClass = "bg-blue-950/40 text-blue-300 border-blue-500/40 hover:bg-blue-500 hover:text-neutral-950";
                        } else {
                          colorClass = "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-neutral-950";
                        }

                        return (
                          <React.Fragment key={seat.id}>
                            {/* Insert aisle gap after seat 5 */}
                            {seat.number === 6 && <div className="w-8"></div>}
                            <button
                              disabled={isBooked || isHeld}
                              onClick={() => toggleSeat(seat)}
                              className={`w-8 h-8 rounded-lg border text-[11px] font-semibold transition duration-150 flex items-center justify-center ${colorClass}`}
                              title={`${seat.row}${seat.number} • ${seat.category} • ${formatPaise(seat.basePrice)}`}
                            >
                              {seat.number}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <span className="w-6 text-xs font-mono font-bold text-neutral-400 text-center">
                      {rowLetter}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500/40 border border-emerald-500"></span>
                  <span>Regular ({formatPaise(28000)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-blue-500/40 border border-blue-500"></span>
                  <span>Premium ({formatPaise(38000)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-purple-500/40 border border-purple-500"></span>
                  <span>Executive ({formatPaise(48000)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-gold-500/40 border border-gold-400"></span>
                  <span>Recliner ({formatPaise(65000)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-neutral-900 border border-neutral-700"></span>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Summary & Booking Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl glass-panel-elevated p-6 border border-gold-500/30">
            <h2 className="text-lg font-serif font-bold text-white mb-4 pb-3 border-b border-neutral-800 flex items-center justify-between">
              <span>Booking Summary</span>
              {holdToken && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold animate-pulse">
                  ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              )}
            </h2>

            {/* Selected Seats Pill List */}
            {selectedSeats.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4 text-center">
                Select your seats from the 2D layout or 3D auditorium.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((seat: any) => (
                    <span
                      key={seat.id}
                      className="px-2.5 py-1 rounded-lg bg-gold-500/20 border border-gold-500/40 text-gold-300 font-mono text-xs font-bold flex items-center gap-1.5"
                    >
                      {seat.row}{seat.number}
                      <button
                        onClick={() => toggleSeat(seat)}
                        className="text-neutral-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs pt-4 border-t border-neutral-800 text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span>Seats Subtotal ({selectedSeats.length} seats):</span>
                    <span className="text-white font-medium">{formatPaise(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Convenience Fee:</span>
                    <span className="text-white font-medium">{formatPaise(convenienceFee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST (18%):</span>
                    <span className="text-white font-medium">{formatPaise(tax)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span>Promo Discount ({appliedPromo.code}):</span>
                      <span>-{formatPaise(appliedPromo.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-base font-bold text-white pt-3 border-t border-neutral-800">
                    <span>Final Payable Amount:</span>
                    <span className="text-gold-400">{formatPaise(total)}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. LUMIERE50)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gold-300 font-button font-bold text-xs uppercase"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-red-400 mt-1">{promoError}</p>}
                  {appliedPromo && (
                    <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Code applied successfully!
                    </p>
                  )}
                </div>

                {/* Pay Action Button */}
                <button
                  onClick={handlePayNow}
                  disabled={isProcessingPayment || selectedSeats.length === 0}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 hover:brightness-110 active:scale-[0.99] font-button font-bold text-xs uppercase tracking-wider text-neutral-950 shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span className="inline-block w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Securely {formatPaise(total)}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmed Ticket Modal with QR Code */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel-elevated p-8 border border-gold-500/50 shadow-gold-glow-lg text-white">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                BOOKING CONFIRMED & ISSUED
              </div>
              <h2 className="text-2xl font-serif font-black text-white">
                Your Digital Cinema Ticket
              </h2>
              <p className="text-xs text-gold-400 font-mono mt-1 font-bold">
                REF: {confirmedBooking.bookingReference}
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{confirmedBooking.movie}</h3>
                  <p className="text-xs text-neutral-400">{confirmedBooking.cinema}</p>
                  <p className="text-xs text-gold-400 font-mono">{confirmedBooking.screen}</p>
                </div>
                {/* QR Code */}
                {confirmedBooking.qrCodeData && (
                  <div className="p-2 rounded-xl bg-white shadow-md">
                    <img
                      src={confirmedBooking.qrCodeData}
                      alt="Ticket QR Code"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-neutral-800 text-neutral-400">
                <div>
                  <span className="text-neutral-500">Seats:</span>
                  <p className="text-white font-bold text-sm">{confirmedBooking.seats}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Showtime:</span>
                  <p className="text-white font-bold text-sm">
                    {formatDate(confirmedBooking.startsAt)}, {formatTime(confirmedBooking.startsAt)}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500">Total Paid:</span>
                  <p className="text-gold-400 font-bold text-sm">
                    {formatPaise(confirmedBooking.totalAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500">Gate Check-in:</span>
                  <p className="text-emerald-400 font-bold text-xs">Ready for Scan</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-button font-bold text-xs uppercase flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <Link
                href="/dashboard/bookings"
                className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-neutral-950 font-button font-bold text-xs uppercase tracking-wider text-center shadow-gold-glow transition"
              >
                View in My Bookings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
