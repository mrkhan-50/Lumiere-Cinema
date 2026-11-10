import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPaise } from "@/lib/utils";
import { Tag, Sparkles, Copy, CheckCircle2, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function OffersPage() {
  const promoCodes = await prisma.promoCode.findMany({
    where: { isActive: true },
    orderBy: { discountValue: "desc" },
  });

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      {/* Header Banner */}
      <section className="relative w-full border-b border-gold-500/20 bg-neutral-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-xs text-gold-400 font-medium mb-3">
            <Tag className="w-3.5 h-3.5" />
            EXCLUSIVE PATRON PRIVILEGES
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-white">
            Special <span className="gold-text-gradient">Offers & Rewards</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl">
            Enjoy luxury cinema perks, seasonal discount codes, and celebration rewards applicable at checkout.
          </p>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {promoCodes.map((promo) => (
          <div
            key={promo.id}
            className="rounded-3xl glass-panel-elevated p-8 border border-neutral-800 hover:border-gold-500/50 transition duration-300 flex flex-col justify-between hover:shadow-gold-glow"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-mono font-bold">
                  {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `FLAT ${formatPaise(promo.discountValue)}`}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono text-neutral-500">PROMO CODE</p>
                  <p className="text-xl font-mono font-bold text-white tracking-widest">{promo.code}</p>
                </div>
              </div>

              <h3 className="text-base font-serif font-bold text-white mb-2">
                {promo.description || "Exclusive LUMIÈRE Patron Discount"}
              </h3>

              <ul className="space-y-1.5 text-xs text-neutral-400 mt-4">
                <li>• Minimum order value: {formatPaise(promo.minOrderValue)}</li>
                {promo.maxDiscount && (
                  <li>• Maximum discount capped at: {formatPaise(promo.maxDiscount)}</li>
                )}
                <li>• Valid for luxury recliners, IMAX, and Dolby auditoriums</li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <Link
                href="/movies"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 hover:brightness-110 active:scale-95 transition font-button font-bold text-xs uppercase tracking-wider text-neutral-950 shadow-gold-glow flex items-center justify-center gap-2"
              >
                <span>Apply Code On Movies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
