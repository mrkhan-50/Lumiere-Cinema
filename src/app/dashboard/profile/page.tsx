import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Mail, Phone, Shield, Sparkles, Ticket } from "lucide-react";

export const revalidate = 0;

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();

  const user = sessionUser
    ? await prisma.user.findUnique({
        where: { id: sessionUser.userId },
        include: { bookings: true },
      })
    : await prisma.user.findFirst({
        where: { role: "USER" },
        include: { bookings: true },
      });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-lumiere-text">
        <p>Please log in to view profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-lumiere-text pb-24">
      <section className="relative w-full border-b border-gold-500/20 bg-neutral-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-xs text-gold-400 font-medium mb-3">
            <User className="w-3.5 h-3.5" />
            PATRON PRIVILEGE PROFILE
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-white">
            {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            LUMIÈRE Member since {new Date(user.createdAt).getFullYear()} • {user.role} Privilege Tier
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
        <div className="rounded-3xl glass-panel-elevated p-8 border border-neutral-800">
          <h2 className="text-lg font-serif font-bold text-white mb-6 pb-3 border-b border-neutral-800">
            Account Credentials & Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-neutral-500 block mb-1">Full Legal Name</span>
              <p className="text-white font-bold text-sm">{user.name}</p>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">Email Address</span>
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400" />
                {user.email}
              </p>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">Registered Phone</span>
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400" />
                {user.phone || "+91 98765 43212"}
              </p>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">Role / Privilege Level</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/40">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl glass-panel p-8 border border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Confirmed Cinema Bookings</h3>
            <p className="text-xs text-neutral-400 mt-1">
              You have {user.bookings.length} reservations on file.
            </p>
          </div>
          <Link
            href="/dashboard/bookings"
            className="px-5 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-neutral-950 font-button font-bold text-xs uppercase tracking-wider shadow-gold-glow transition"
          >
            View Tickets
          </Link>
        </div>
      </section>
    </div>
  );
}
