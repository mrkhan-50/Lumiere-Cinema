"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Eye,
  Tv,
  Volume2,
  Maximize2,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

// Dynamically load the 3D Canvas with ssr: false to prevent WebGL server-side issues
const Cinema3DAuditorium = dynamic(
  () => import("@/components/cinema3d/Cinema3DAuditorium").then((mod) => mod.Cinema3DAuditorium),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-3xl glass-panel-elevated border border-gold-500/20 flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="w-12 h-12 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-serif text-gold-300">
          Initializing LUMIÈRE 3D WebGL Cinema Engine...
        </p>
        <span className="text-xs text-neutral-500">
          Loading spatial audio coordinates, curved silver screen, and luxury seat meshes.
        </span>
      </div>
    ),
  }
);

export default function ExperiencesPage() {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [lastSelectedSeat, setLastSelectedSeat] = useState<any>(null);

  const handleSeatSelect = (seat: any) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
    setLastSelectedSeat(seat);
  };

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      {/* Top Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-xs font-semibold text-gold-400 mb-6 backdrop-blur-md shadow-gold-glow animate-float">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>INTERACTIVE 3D VIRTUAL TOUR & SEATING SIMULATOR</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white mb-4">
            Step Inside <span className="gold-text-gradient">The Sovereign Auditorium</span>
          </h1>

          <p className="max-w-3xl text-sm sm:text-base text-neutral-300 font-sans leading-relaxed mb-8">
            Experience the architectural majesty of LUMIÈRE before booking. Rotate through 360° of luxury seating, preview the exact viewing angle from any seat toward our curved silver screen, and explore world-class formats.
          </p>
        </div>

        {/* 3D Canvas Container */}
        <div className="w-full my-6">
          <Cinema3DAuditorium
            onSeatSelect={handleSeatSelect}
            selectedSeatIds={selectedSeatIds}
          />
        </div>

        {/* Dynamic Selection Bar */}
        {selectedSeatIds.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl glass-panel-elevated border border-gold-500/40 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-gold-400 font-bold">
                Virtual Preview Selection
              </p>
              <p className="text-sm text-white font-medium">
                {selectedSeatIds.length} seat(s) selected: {selectedSeatIds.join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedSeatIds([])}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition"
              >
                Clear Selection
              </button>
              <Link
                href="/movies"
                className="px-6 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-neutral-950 font-button font-bold text-xs tracking-wider uppercase transition shadow-gold-glow flex items-center gap-2"
              >
                Proceed to Book Movie
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Cinematic Formats Comparison Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-mono tracking-widest text-gold-400 font-bold">
            UNRIVALED PROJECTION & SOUND
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white mt-1">
            Choose Your Cinematic Dimension
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mt-2">
            Every LUMIÈRE screen is acoustically isolated and calibrated to industry-leading THX and Dolby standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Format 1: IMAX 70mm */}
          <div className="glass-panel p-6 rounded-3xl border border-neutral-800 hover:border-gold-500/40 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center mb-5">
                <Maximize2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                IMAX with Laser & 70mm
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Massive curved silver screens delivering up to 40% more picture, ultra-sharp 4K dual-laser clarity, and earth-shattering deep bass tuning.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-[11px] text-gold-400 font-mono">
              Available at Connaught Place & DLF Mall
            </div>
          </div>

          {/* Format 2: Dolby Atmos */}
          <div className="glass-panel p-6 rounded-3xl border border-neutral-800 hover:border-gold-500/40 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                Dolby Cinema & Atmos
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                64 discrete audio channels wrapping around you in three-dimensional space, paired with Dolby Vision dynamic HDR contrast.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-[11px] text-blue-400 font-mono">
              Available in all 4 premiere cities
            </div>
          </div>

          {/* Format 3: Luxury Recliner Lounge */}
          <div className="glass-panel p-6 rounded-3xl border border-neutral-800 hover:border-gold-500/40 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                Director’s Cut Recliner
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Fully motorized Italian leather recliners with personal charging ports, swivel cocktail tables, and discreet in-seat butler dining.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-[11px] text-amber-400 font-mono">
              Row G in all flagship auditoriums
            </div>
          </div>

          {/* Format 4: 4DX Sensorial Motion */}
          <div className="glass-panel p-6 rounded-3xl border border-neutral-800 hover:border-gold-500/40 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                4DX Sensorial Motion
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Synchronized motion seats, atmospheric wind, scent, and environmental fog effects that transport you directly into the narrative.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-[11px] text-red-400 font-mono">
              Available at Noida Pinnacle
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
