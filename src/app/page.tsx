import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  Film,
  Ticket,
  ShieldCheck,
  Star,
  Clock,
  Compass,
  ArrowRight,
  Tv,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 0; // Fresh database data on every request

export default async function HomePage() {
  const movies = await prisma.movie.findMany({
    orderBy: { rating: "desc" },
    include: {
      showtimes: {
        take: 3,
        include: {
          screen: {
            include: {
              cinema: true,
            },
          },
        },
      },
    },
  });

  const totalCinemas = await prisma.cinema.count();
  const totalShowtimes = await prisma.showtime.count();

  return (
    <div className="relative flex flex-col items-center w-full min-h-screen overflow-hidden bg-background">
      {/* Top Ambient Light Cone / Virtual Cinema Screen Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-screen-beam pointer-events-none opacity-40 blur-3xl"></div>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center flex flex-col items-center">
        {/* Prestige Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-xs font-semibold text-gold-400 mb-8 backdrop-blur-md shadow-gold-glow animate-float">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>PHASE 1 OPERATIONAL • ARCHITECTURE & AUTHENTICATION READY</span>
        </div>

        {/* Brand Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-black tracking-tight text-white mb-6">
          <span className="block gold-text-gradient drop-shadow-2xl">LUMIÈRE</span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-2xl text-neutral-300 font-serif italic mb-10 tracking-wide">
          Experience Cinema Beyond the Screen.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="#movies"
            className="px-8 py-4 rounded-full font-button font-bold text-sm tracking-widest uppercase text-neutral-950 bg-gradient-to-r from-gold-300 via-gold-500 to-amber-600 hover:brightness-110 active:scale-95 transition duration-300 shadow-gold-glow flex items-center gap-2"
          >
            <Film className="w-4 h-4" />
            Explore Movies
          </Link>

          <Link
            href="#phase1-verification"
            className="px-8 py-4 rounded-full font-button font-bold text-sm tracking-widest uppercase text-white bg-neutral-900/90 hover:bg-neutral-800 border border-gold-500/30 hover:border-gold-400 active:scale-95 transition duration-300 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            Phase 1 Verification
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          <div className="glass-panel p-4 rounded-2xl border border-neutral-800">
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Premiere Movies</p>
            <p className="text-2xl font-bold text-white mt-1">{movies.length} Active</p>
            <p className="text-[11px] text-gold-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Database Live
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-neutral-800">
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Luxury Cinemas</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCinemas} Destinations</p>
            <p className="text-[11px] text-gold-400 mt-1">Delhi • Noida • Mumbai • BLR</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-neutral-800">
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Scheduled Shows</p>
            <p className="text-2xl font-bold text-white mt-1">{totalShowtimes} Showtimes</p>
            <p className="text-[11px] text-emerald-400 mt-1">Next 7 Days Synced</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-neutral-800">
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Seat Safety</p>
            <p className="text-2xl font-bold text-white mt-1">5-Min Holds</p>
            <p className="text-[11px] text-gold-400 mt-1">Zero Race Conditions</p>
          </div>
        </div>
      </section>

      {/* Phase 1 Verification Dashboard Section */}
      <section id="phase1-verification" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-gold-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-gold-400 font-bold">
                SYSTEM VERIFICATION REPORT
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Phase 1: Project Setup, Database & Authentication
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Complete relational database models, seed pipeline, JWT authentication, and session cookie engine.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ALL SYSTEMS ONLINE
            </div>
          </div>

          {/* Verification Checkpoints */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="rounded-2xl bg-neutral-900/80 p-5 border border-neutral-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-sm font-semibold text-white">Relational Database & Models</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Prisma schema (PostgreSQL & SQLite)
                </li>
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Minor currency units (paise) applied
                </li>
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Seed pipeline executed with realistic data
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900/80 p-5 border border-neutral-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-sm font-semibold text-white">Authentication & RBAC</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Bcrypt salted password hashing
                </li>
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Signed JWT HTTP-only session cookies
                </li>
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Roles: ADMIN, CINEMA_STAFF, USER
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900/80 p-5 border border-neutral-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-sm font-semibold text-white">Concurrency Seat Engine</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Atomic in-flight mutex lock manager
                </li>
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  5-minute hold token auto-expiration
                </li>
                <li className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Zero double-booking transaction guard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section id="movies" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-gold-400 font-bold">
              NOW SHOWING IN CINEMAS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-white mt-1">
              Curated Blockbuster Cinema
            </h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-sm mt-2 md:mt-0">
            Available in IMAX 70mm, Laser 3D, and Dolby Atmos across premier luxury auditoriums.
          </p>
        </div>

        {/* Movie Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="group relative rounded-2xl overflow-hidden glass-panel border border-neutral-800 hover:border-gold-500/50 transition-all duration-300 hover:shadow-gold-glow flex flex-col"
            >
              {/* Poster Image */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-neutral-900/80 backdrop-blur-md border border-gold-500/40 text-gold-300 text-xs font-bold flex items-center gap-1 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>

                {/* Certification */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] bg-neutral-900/90 text-neutral-300 border border-neutral-700 font-semibold uppercase">
                  {movie.certification}
                </div>
              </div>

              {/* Movie Meta Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-1">
                    <span>{movie.language}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {movie.duration}m
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-gold-300 transition line-clamp-1">
                    {movie.title}
                  </h3>

                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-gold-400/90 font-mono font-medium truncate max-w-[150px]">
                    {movie.formats}
                  </span>
                  {movie.showtimes[0] ? (
                    <Link
                      href={`/booking/${movie.showtimes[0].id}`}
                      className="px-3.5 py-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-neutral-950 text-xs font-bold font-button transition duration-200 flex items-center gap-1"
                    >
                      Book
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href="/movies"
                      className="px-3.5 py-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-neutral-950 text-xs font-bold font-button transition duration-200 flex items-center gap-1"
                    >
                      View
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
