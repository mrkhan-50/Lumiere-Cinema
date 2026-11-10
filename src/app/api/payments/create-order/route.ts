import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHold } from "@/lib/reservation";
import { getCurrentUser } from "@/lib/auth";
import { generateBookingReference } from "@/lib/utils";
import { CONVENIENCE_FEE_PAISE, GST_RATE } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { holdToken, showtimeId, promoCodeId, customerName, customerEmail, customerPhone } = body;

    if (!holdToken || !showtimeId) {
      return NextResponse.json({ error: "Missing holdToken or showtimeId" }, { status: 400 });
    }

    // 1. Validate hold
    const holdValidation = await validateHold(holdToken, showtimeId);
    if (!holdValidation.valid || !holdValidation.hold) {
      return NextResponse.json(
        { error: holdValidation.error || "Reservation is no longer valid" },
        { status: 400 }
      );
    }

    const hold = holdValidation.hold;
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
    });
    if (!showtime) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    // 2. Server-side price calculation
    const multiplier = showtime.priceMultiplier || 1.0;
    let subtotalAmount = 0;
    const seatPrices = hold.items.map((item) => {
      const finalPrice = Math.round(item.seat.basePrice * multiplier);
      subtotalAmount += finalPrice;
      return {
        seatId: item.seatId,
        finalPrice,
      };
    });

    const convenienceFee = CONVENIENCE_FEE_PAISE * hold.items.length; // ₹20 per ticket
    const taxAmount = Math.round((subtotalAmount + convenienceFee) * GST_RATE); // GST on subtotal + fee

    // 3. Discount calculation
    let discountAmount = 0;
    if (promoCodeId) {
      const promo = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
      if (promo && promo.isActive && promo.expiresAt >= new Date()) {
        if (subtotalAmount >= promo.minOrderValue) {
          if (promo.discountType === "PERCENTAGE") {
            discountAmount = Math.round((subtotalAmount * promo.discountValue) / 100);
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
              discountAmount = promo.maxDiscount;
            }
          } else {
            discountAmount = promo.discountValue;
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotalAmount + convenienceFee + taxAmount - discountAmount);
    const bookingReference = generateBookingReference();

    // 4. Create Pending Booking in database
    const finalUserId = user?.userId || hold.userId;
    let bookingUserId = finalUserId;
    if (!bookingUserId) {
      const defaultPatron = await prisma.user.findFirst({ where: { role: "USER" } });
      if (defaultPatron) {
        bookingUserId = defaultPatron.id;
      } else {
        const guestUser = await prisma.user.create({
          data: {
            name: customerName || "Cinema Guest",
            email: customerEmail || `guest_${Date.now()}@lumiere.com`,
            passwordHash: "GUEST_ACCOUNT",
            role: "USER",
          },
        });
        bookingUserId = guestUser.id;
      }
    }

    const gatewayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const booking = await prisma.booking.create({
      data: {
        userId: bookingUserId,
        showtimeId,
        bookingReference,
        status: "PENDING",
        subtotalAmount,
        convenienceFee,
        taxAmount,
        discountAmount,
        totalAmount,
        promoCodeId: promoCodeId || null,
        customerName: customerName || user?.name || "Cinema Patron",
        customerEmail: customerEmail || user?.email || "patron@lumiere.com",
        customerPhone: customerPhone || null,
        seats: {
          create: seatPrices.map((sp) => ({
            seatId: sp.seatId,
            finalPrice: sp.finalPrice,
          })),
        },
        payments: {
          create: {
            gatewayOrderId,
            amount: totalAmount,
            currency: "INR",
            status: "CREATED",
          },
        },
      },
      include: {
        payments: true,
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      gatewayOrderId,
      amount: totalAmount,
      currency: "INR",
      razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_lumiere12345",
      subtotalAmount,
      convenienceFee,
      taxAmount,
      discountAmount,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment order" },
      { status: 500 }
    );
  }
}
