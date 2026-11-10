"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { SUPPORTED_CITIES } from "@/lib/constants";
import {
  MapPin,
  Search,
  User as UserIcon,
  Film,
  Ticket,
  LogOut,
  Shield,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const [selectedCity, setSelectedCity] = useState("Delhi");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gold-500/20 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-700 flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition duration-300">
              <Sparkles className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <span className="text-2xl font-serif font-black tracking-widest text-white group-hover:text-gold-300 transition">
                LUMIÈRE
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-gold-400/90 font-mono">
                Cinema Beyond The Screen
              </span>
            </div>
          </Link>

          {/* City Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/70 hover:border-gold-500/50 text-xs text-neutral-300 hover:text-white transition"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span className="font-medium">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-xl glass-panel-elevated py-2 shadow-2xl z-50 animate-fadeIn border border-gold-500/25">
                <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Select City
                </div>
                {SUPPORTED_CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city.name);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gold-500/10 hover:text-gold-300 transition ${
                      selectedCity === city.name ? "text-gold-400 font-semibold bg-gold-500/5" : "text-neutral-300"
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-neutral-500">{city.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/movies"
            className="text-sm font-medium text-neutral-300 hover:text-gold-400 transition"
          >
            Movies
          </Link>
          <Link
            href="/cinemas"
            className="text-sm font-medium text-neutral-300 hover:text-gold-400 transition"
          >
            Cinemas
          </Link>
          <Link
            href="/experiences"
            className="text-sm font-medium text-neutral-300 hover:text-gold-400 transition"
          >
            3D Experiences
          </Link>
          <Link
            href="/offers"
            className="text-sm font-medium text-neutral-300 hover:text-gold-400 transition"
          >
            Offers
          </Link>
        </nav>

        {/* Right Section: Search & Auth */}
        <div className="flex items-center gap-4">
          <Link
            href="/movies"
            className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition"
            title="Search Movies"
          >
            <Search className="w-4 h-4" />
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-gold-500/40 hover:border-gold-400 text-xs text-white transition shadow-gold-glow"
              >
                <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[100px] truncate">{user.name}</span>
                {user.role === "ADMIN" && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-950 border border-red-500 text-red-300 uppercase font-bold">
                    Admin
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel-elevated py-2 shadow-2xl z-50 animate-fadeIn border border-gold-500/25">
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/30">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href="/dashboard/bookings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition"
                  >
                    <Ticket className="w-4 h-4 text-gold-400" />
                    My Bookings & QR Tickets
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition"
                  >
                    <UserIcon className="w-4 h-4 text-gold-400" />
                    Patron Profile
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-300 hover:text-red-200 hover:bg-red-950/40 transition font-semibold"
                    >
                      <Shield className="w-4 h-4 text-red-400" />
                      Executive Admin Portal
                    </Link>
                  )}

                  <div className="border-t border-neutral-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-neutral-800/40 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="px-5 py-2 rounded-full font-button text-xs font-bold tracking-wider uppercase text-neutral-950 bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 hover:brightness-110 active:scale-95 transition duration-200 shadow-gold-glow"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
