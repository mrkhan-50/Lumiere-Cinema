import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTime, formatDate } from "@/lib/utils";
import {
  Film,
  Search,
  Star,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";

export const revalidate = 0;

interface MoviesPageProps {
  searchParams: Promise<{
    q?: string;
    language?: string;
    genre?: string;
    status?: string;
  }>;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { q, language, genre, status } = await searchParams;

  const where: any = {};
  if (status) where.status = status;
  if (language && language !== "ALL") where.language = language;
  if (genre && genre !== "ALL") {
    where.genre = { contains: genre };
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { cast: { contains: q } },
      { director: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const movies = await prisma.movie.findMany({
    where,
    orderBy: { rating: "desc" },
    include: {
      showtimes: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
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

  const languages = ["ALL", "English", "Hindi", "Telugu", "Tamil"];
  const genres = ["ALL", "Sci-Fi", "Action", "Drama", "History", "Adventure"];

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      {/* Header Banner */}
      <section className="relative w-full border-b border-gold-500/20 bg-neutral-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-xs text-gold-400 font-medium mb-3">
              <Film className="w-3.5 h-3.5" />
              LUMIÈRE PREMIERE CATALOGUE
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-white">
              Discover <span className="gold-text-gradient">Blockbuster Cinema</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl">
              Experience the pinnacle of audio-visual artistry in IMAX Laser, 70mm, and Dolby Atmos.
            </p>
          </div>

          {/* Search Form */}
          <form method="GET" action="/movies" className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                name="q"
                defaultValue={q || ""}
                placeholder="Search movies, actors, directors..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-neutral-950 font-button font-bold text-xs uppercase tracking-wider transition shadow-gold-glow"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Filter Pills */}
        <div className="max-w-7xl mx-auto mt-8 flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-500 mr-2 flex items-center gap-1 font-mono uppercase">
            <Filter className="w-3 h-3" /> Language:
          </span>
          {languages.map((lang) => (
            <Link
              key={lang}
              href={`/movies?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(genre ? { genre } : {}),
                language: lang,
              }).toString()}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                (language || "ALL") === lang
                  ? "bg-gold-500 text-neutral-950 font-bold shadow-md"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {lang}
            </Link>
          ))}
        </div>
      </section>

      {/* Movies Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {movies.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl p-8 border border-neutral-800">
            <Film className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-white mb-2">No Movies Found</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
              No matching titles found for your search query. Try clearing your search or switching languages.
            </p>
            <Link
              href="/movies"
              className="px-6 py-2.5 rounded-full bg-gold-500 text-neutral-950 text-xs font-bold font-button shadow-gold-glow"
            >
              View All Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group rounded-3xl overflow-hidden glass-panel border border-neutral-800 hover:border-gold-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-gold-glow"
              >
                <div>
                  {/* Poster Image with Meta Overlay */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={movie.bannerUrl || movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-gold-500/40 text-gold-300 text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>

                    {/* Certification */}
                    <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-neutral-900/90 text-neutral-300 border border-neutral-700 text-[10px] font-semibold uppercase">
                      {movie.certification}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[11px] font-mono text-gold-400 uppercase tracking-widest font-semibold">
                        {movie.language} • {movie.genre}
                      </span>
                      <h2 className="text-2xl font-serif font-black text-white group-hover:text-gold-300 transition">
                        {movie.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 mb-4">
                      {movie.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-neutral-400 mb-6">
                      <p>
                        <span className="text-neutral-500">Director:</span>{" "}
                        <span className="text-neutral-300 font-medium">{movie.director}</span>
                      </p>
                      <p className="line-clamp-1">
                        <span className="text-neutral-500">Cast:</span>{" "}
                        <span className="text-neutral-300 font-medium">{movie.cast}</span>
                      </p>
                      <p>
                        <span className="text-neutral-500">Formats:</span>{" "}
                        <span className="text-gold-400 font-mono">{movie.formats}</span>
                      </p>
                    </div>

                    {/* Showtimes Strip */}
                    <div className="border-t border-neutral-800 pt-4">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
                        <span>Upcoming Showtimes:</span>
                        <span className="text-gold-400 font-bold">{movie.showtimes.length} Scheduled</span>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {movie.showtimes.slice(0, 4).map((show) => (
                          <Link
                            key={show.id}
                            href={`/booking/${show.id}`}
                            className="px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-gold-500 hover:text-neutral-950 border border-neutral-700/80 hover:border-gold-400 text-xs font-semibold text-neutral-200 transition duration-150 flex flex-col items-center group/btn"
                          >
                            <span>{formatTime(show.startsAt)}</span>
                            <span className="text-[9px] text-neutral-500 group-hover/btn:text-neutral-900 font-mono">
                              {show.format}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="p-6 pt-0">
                  {movie.showtimes[0] ? (
                    <Link
                      href={`/booking/${movie.showtimes[0].id}`}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 hover:brightness-110 active:scale-[0.99] transition duration-200 font-button font-bold text-xs uppercase tracking-wider text-neutral-950 shadow-gold-glow flex items-center justify-center gap-2"
                    >
                      <span>Select Showtime & 3D Seats</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-neutral-800 text-neutral-500 font-button font-bold text-xs uppercase cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
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
