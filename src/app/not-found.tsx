import React from "react";
import Link from "next/link";
import { Film, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-background text-lumiere-text">
      <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-6 shadow-gold-glow">
        <Film className="w-8 h-8 text-gold-400" />
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold mb-2">
        SCENE NOT FOUND • ERROR 404
      </span>

      <h1 className="text-4xl sm:text-5xl font-serif font-black text-white mb-4">
        Lost in the <span className="gold-text-gradient">Auditorium</span>
      </h1>

      <p className="max-w-md text-sm text-neutral-400 mb-8 leading-relaxed">
        The cinematic feature or screening you are looking for has been moved, archived, or does not exist.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-neutral-950 font-button font-bold text-xs uppercase tracking-wider transition shadow-gold-glow flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Return to Premieres
        </Link>
        <Link
          href="/movies"
          className="px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-gold-500/40 font-button font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Catalogue
        </Link>
      </div>
    </div>
  );
}
