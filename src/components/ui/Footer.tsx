import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-neutral-950 border-t border-gold-500/20 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-amber-700 flex items-center justify-center shadow-gold-glow">
              <Sparkles className="w-4 h-4 text-neutral-950" />
            </div>
            <span className="text-xl font-serif font-black tracking-widest text-white">
              LUMIÈRE
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Experience Cinema Beyond the Screen. Ultra-luxury 3D auditoriums, Dolby Atmos laser projections, and seamless digital concierge ticketing.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">
            Cinematic Experiences
          </h4>
          <ul className="space-y-2 text-xs">
            <li><span className="hover:text-white transition cursor-pointer">The Sovereign IMAX 70mm</span></li>
            <li><span className="hover:text-white transition cursor-pointer">Dolby Cinema Royal Hall</span></li>
            <li><span className="hover:text-white transition cursor-pointer">4DX Sensorial Motion</span></li>
            <li><span className="hover:text-white transition cursor-pointer">Director’s Cut Recliner Lounge</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">
            Premier Locations
          </h4>
          <ul className="space-y-2 text-xs">
            <li><span className="hover:text-white transition cursor-pointer">Connaught Place, Delhi</span></li>
            <li><span className="hover:text-white transition cursor-pointer">DLF Mall of India, Noida</span></li>
            <li><span className="hover:text-white transition cursor-pointer">Bandra West, Mumbai</span></li>
            <li><span className="hover:text-white transition cursor-pointer">Koramangala, Bengaluru</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">
            Platform Assurance
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5 text-neutral-300">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <span>Razorpay Verified Sandbox</span>
            </li>
            <li className="flex items-center gap-1.5 text-neutral-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Collision Seat Reservation</span>
            </li>
            <li className="flex items-center gap-1.5 text-neutral-300">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <span>HMAC Signed QR Tickets</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} LUMIÈRE Cinemas International. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for elite cinema patrons.
        </p>
      </div>
    </footer>
  );
}
