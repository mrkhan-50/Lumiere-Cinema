import crypto from 'crypto';
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

/**
 * Create a seat hold for a user.
 * Returns the created SeatHold record.
 */
export async function createSeatHold({
  userId,
  showtimeId,
  seatIds,
}: {
  userId: string;
  showtimeId: string;
  seatIds: string[]; // e.g. ["A5", "A6"]
}) {
  // Generate a secure token (32 hex chars)
  const holdToken = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Transaction ensures atomicity and prevents double booking
  return await prisma.$transaction(async (tx) => {
    // Verify that each seat belongs to the showtime and is free
    // Join Seat -> Screen -> Showtime
    const seats = await tx.seat.findMany({
      where: {
        id: { in: seatIds },
        screen: {
          showtimes: { some: { id: showtimeId } },
        },
        // No existing bookings
        bookingSeats: { none: {} },
        // No active holds on the same seats
        seatHoldItems: {
          none: {
            hold: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
          },
        },
      },
      select: { id: true },
    });

    if (seats.length !== seatIds.length) {
      // some seats are invalid or already taken
      const missing = seatIds.filter((id) => !seats.find((s) => s.id === id));
      const error: any = new Error('One or more seats are unavailable');
      error.code = 'SEAT_UNAVAILABLE';
      error.unavailableSeats = missing;
      throw error;
    }

    // Create the hold
    const hold = await tx.seatHold.create({
      data: {
        user: { connect: { id: userId } },
        showtime: { connect: { id: showtimeId } },
        holdToken,
        expiresAt,
        status: 'ACTIVE',
        items: {
          create: seatIds.map((sid) => ({ seat: { connect: { id: sid } } })),
        },
      },
    });

    return hold;
  });
}

/** Release a hold (by token) – only owner may release */
export async function releaseSeatHold({
  userId,
  holdToken,
}: { userId: string; holdToken: string }) {
  // Find the hold and verify ownership
  const hold = await prisma.seatHold.findUnique({
    where: { holdToken },
    include: { items: true },
  });

  if (!hold) {
    const err: any = new Error('Hold not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (hold.userId !== userId) {
    const err: any = new Error('Forbidden');
    err.code = 'FORBIDDEN';
    throw err;
  }
  if (hold.status !== 'ACTIVE') {
    const err: any = new Error('Hold is not active');
    err.code = 'INVALID_STATE';
    throw err;
  }

  // Update status and delete items
  await prisma.$transaction([
    prisma.seatHold.update({
      where: { holdToken },
      data: { status: 'RELEASED' },
    }),
    prisma.seatHoldItem.deleteMany({ where: { holdId: hold.id } }),
  ]);

  return { released: true };
}

/** Get current seat availability for a showtime */
export async function getSeatAvailability(showtimeId: string) {
  // Booked seats
  const bookedSeats = await prisma.bookingSeat.findMany({
    where: { booking: { showtimeId } },
    select: { seat: { select: { id: true } } },
  });
  const booked = bookedSeats.map((bs) => bs.seat.id);

  // Held seats (active only)
  const holds = await prisma.seatHold.findMany({
    where: {
      showtimeId,
      status: 'ACTIVE',
      expiresAt: { gt: new Date() },
    },
    include: { items: { select: { seatId: true } } },
  });
  const held = holds.flatMap((h) => h.items.map((i) => i.seatId));

  return { booked, held };
}

/** Cleanup expired holds – to be called by a background task */
export async function expireOldHolds() {
  const now = new Date();
  const expired = await prisma.seatHold.findMany({
    where: { status: 'ACTIVE', expiresAt: { lt: now } },
  });
  if (expired.length === 0) return 0;

  await prisma.$transaction([
    prisma.seatHold.updateMany({
      where: { id: { in: expired.map((h) => h.id) } },
      data: { status: 'EXPIRED' },
    }),
    prisma.seatHoldItem.deleteMany({
      where: { holdId: { in: expired.map((h) => h.id) } },
    }),
  ]);
  return expired.length;
}

/** Helper to fetch a hold by token */
export async function getHoldByToken(holdToken: string) {
  return prisma.seatHold.findUnique({
    where: { holdToken },
    include: { items: true },
  });
}
