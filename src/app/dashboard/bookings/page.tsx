import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPaise, formatDate, formatTime } from "@/lib/utils";
import { Ticket, Calendar, Clock, MapPin, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function UserBookingsPage() {
  const sessionUser = await getCurrentUser();

  // If user is logged in, show their bookings. Otherwise fallback to demo patron's bookings
  const bookings = await prisma.booking.findMany({
    where: sessionUser
      ? { userId: sessionUser.userId }
      : { user: { role: "USER" } },
    orderBy: { createdAt: "desc" },
    include: {
      showtime: {
        include: {
          movie: true,
          screen: {
            include: { cinema: true },
          },
        },
      },
      seats: {
        include: { seat: true },
      },
      ticket: true,
      payments: true,
    },
  });

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      <section className="relative w-full border-b border-gold-500/20 bg-neutral-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-xs text-gold-400 font-medium mb-3">
            <Ticket className="w-3.5 h-3.5" />
            PATRON ACCESS & PASSES
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-white">
            My <span className="gold-text-gradient">Bookings & Digital Tickets</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl">
            Access your confirmed admission passes, QR codes for gate check-in, and cinema transaction records.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {bookings.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl p-8 border border-neutral-800">
            <Ticket className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-white mb-2">No Bookings Found</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
              You haven’t reserved any tickets yet. Explore now showing blockbusters and choose your luxury seats.
            </p>
            <Link
              href="/movies"
              className="px-6 py-2.5 rounded-full bg-gold-500 text-neutral-950 text-xs font-bold font-button shadow-gold-glow"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-neutral-800 hover:border-gold-500/40 transition duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-neutral-800">
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.showtime.movie.posterUrl}
                      alt={booking.showtime.movie.title}
                      className="w-16 h-24 object-cover rounded-xl shadow-md border border-neutral-800 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/30">
                        {booking.showtime.format}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                        {booking.showtime.movie.title}
                      </h2>
                      <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        {booking.showtime.screen.cinema.name} • {booking.showtime.screen.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                      {booking.status}
                    </span>
                    <p className="text-xs text-neutral-400 mt-2 font-mono">
                      REF: <span className="text-gold-400 font-bold">{booking.bookingReference}</span>
                    </p>
                    <p className="text-sm font-bold text-white mt-1">
                      {formatPaise(booking.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-neutral-400">
                    <div>
                      <span className="text-neutral-500 block">Showtime:</span>
                      <span className="text-white font-bold">
                        {formatDate(booking.showtime.startsAt)}, {formatTime(booking.showtime.startsAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Seats ({booking.seats.length}):</span>
                      <span className="text-gold-400 font-bold">
                        {booking.seats.map((s) => `${s.seat.row}${s.seat.number}`).join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Gate Status:</span>
                      <span className="text-emerald-400 font-bold">
                        {booking.ticket?.checkInStatus || "NOT_CHECKED_IN"}
                      </span>
                    </div>
                  </div>

                  {booking.ticket?.qrCodeData && (
                    <div className="flex items-center gap-4 bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800">
                      <img
                        src={booking.ticket.qrCodeData}
                        alt="QR Ticket"
                        className="w-16 h-16 rounded-lg bg-white p-1"
                      />
                      <div className="text-xs">
                        <p className="text-white font-bold">Gate QR Pass</p>
                        <p className="text-[11px] text-neutral-400">Ready for usher scan</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
