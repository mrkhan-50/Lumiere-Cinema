import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: showtimeId } = await params;
    const now = new Date();

    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: true,
        screen: {
          include: {
            cinema: true,
            seats: {
              orderBy: [{ row: "asc" }, { number: "asc" }],
            },
          },
        },
      },
    });

    if (!showtime) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    // 1. Get booked seats
    const bookedSeats = await prisma.bookingSeat.findMany({
      where: {
        booking: {
          showtimeId,
          status: { in: ["CONFIRMED", "PENDING"] },
        },
      },
      select: { seatId: true },
    });

    // 2. Get active holds
    const activeHolds = await prisma.seatHoldItem.findMany({
      where: {
        hold: {
          showtimeId,
          status: "ACTIVE",
          expiresAt: { gt: now },
        },
      },
      select: { seatId: true },
    });

    return NextResponse.json({
      showtime,
      bookedSeatIds: bookedSeats.map((b) => b.seatId),
      heldSeatIds: activeHolds.map((h) => h.seatId),
    });
  } catch (error) {
    console.error("Get showtime seats error:", error);
    return NextResponse.json(
      { error: "Failed to load seats" },
      { status: 500 }
    );
  }
}
