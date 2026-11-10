import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
    }

    if (promo.expiresAt < new Date()) {
      return NextResponse.json({ error: "This promotion has expired" }, { status: 400 });
    }

    if (promo.timesUsed >= promo.usageLimit) {
      return NextResponse.json({ error: "Promo code usage limit has been reached" }, { status: 400 });
    }

    if (subtotal < promo.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value of ₹${promo.minOrderValue / 100} required` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * promo.discountValue) / 100);
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = promo.discountValue;
    }

    return NextResponse.json({
      valid: true,
      promoId: promo.id,
      code: promo.code,
      discountAmount,
      description: promo.description,
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}
