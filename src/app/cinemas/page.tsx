import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/utils";
import { MapPin, Sparkles, Tv, Shield, ArrowRight, Film } from "lucide-react";

export const revalidate = 0;

export default async function CinemasPage() {
  const cinemas = await prisma.cinema.findMany({
    include: {
      screens: {
        include: {
          showtimes: {
            where: { startsAt: { gte: new Date() } },
            take: 4,
            include: {
              movie: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      {/* Header Banner */}
      <section className="relative w-full border-b border-gold-500/20 bg-neutral-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-xs text-gold-400 font-medium mb-3">
            <MapPin className="w-3.5 h-3.5" />
            FLAGSHIP LUXURY DESTINATIONS
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-white">
            Premiere <span className="gold-text-gradient">Cinema Palace Locations</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl">
            Explore our state-of-the-art cinema properties across Delhi, Noida, Mumbai, and Bengaluru featuring motorized recliners and gourmet butler service.
          </p>
        </div>
      </section>

      {/* Cinema Cards List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        {cinemas.map((cinema) => (
          <div
            key={cinema.id}
            className="rounded-3xl glass-panel-elevated p-8 border border-neutral-800 hover:border-gold-500/40 transition duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-500/15 text-gold-400 border border-gold-500/30 font-mono uppercase">
                    {cinema.city}
                  </span>
                  <span className="text-xs text-neutral-500">•</span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Operational Today
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {cinema.name}
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  {cinema.address}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">Amenities:</span>
                {cinema.facilities.split(",").map((fac, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300"
                  >
                    {fac.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Screens & Showtimes */}
            <div className="mt-6 space-y-6">
              {cinema.screens.map((screen) => (
                <div key={screen.id} className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 flex items-center justify-center">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{screen.name}</h3>
                        <p className="text-[11px] text-gold-400 font-mono">{screen.format} • {screen.totalSeats} Luxury Seats</p>
                      </div>
                    </div>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {screen.showtimes.map((show) => (
                      <Link
                        key={show.id}
                        href={`/booking/${show.id}`}
                        className="p-3 rounded-xl bg-neutral-950/90 hover:bg-gold-500 hover:text-neutral-950 border border-neutral-800 hover:border-gold-400 transition group flex flex-col justify-between gap-2"
                      >
                        <div>
                          <p className="text-[11px] text-neutral-400 group-hover:text-neutral-900 font-mono truncate">
                            {show.movie.title}
                          </p>
                          <p className="text-sm font-bold text-white group-hover:text-neutral-950">
                            {formatTime(show.startsAt)}
                          </p>
                        </div>
                        <span className="text-[10px] text-gold-400 group-hover:text-neutral-900 font-semibold uppercase flex items-center justify-between">
                          <span>{show.format}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
