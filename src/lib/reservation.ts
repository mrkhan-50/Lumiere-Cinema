import { prisma } from "./prisma";
import { HOLD_DURATION_SECONDS } from "./constants";

/**
 * ConcurrencyLockManager provides atomic in-memory mutex locks per showtime seat
 * to guarantee that even under heavy concurrent traffic, race conditions are prevented
 * before transaction commit.
 */
class ConcurrencyLockManager {
  private inFlightLocks: Map<string, number> = new Map();

  private getLockKey(showtimeId: string, seatId: string): string {
    return `${showtimeId}:${seatId}`;
  }

  /**
   * Attempts to acquire exclusive locks for a set of seats.
   * Returns true if all locks were acquired, false if any seat is already locked.
   */
  acquireLocks(showtimeId: string, seatIds: string[]): boolean {
    const now = Date.now();
    // Clean up stale in-flight locks (> 15 seconds)
    for (const [key, timestamp] of this.inFlightLocks.entries()) {
      if (now - timestamp > 15000) {
        this.inFlightLocks.delete(key);
      }
    }

    // Check if any seat is already locked
    for (const seatId of seatIds) {
      const key = this.getLockKey(showtimeId, seatId);
      if (this.inFlightLocks.has(key)) {
        return false;
      }
    }

    // Acquire all locks
    for (const seatId of seatIds) {
      const key = this.getLockKey(showtimeId, seatId);
      this.inFlightLocks.set(key, now);
    }

    return true;
  }

  releaseLocks(showtimeId: string, seatIds: string[]) {
    for (const seatId of seatIds) {
      const key = this.getLockKey(showtimeId, seatId);
      this.inFlightLocks.delete(key);
    }
  }
}

export const lockManager = new ConcurrencyLockManager();

export interface SeatHoldResult {
  success: boolean;
  holdToken?: string;
  expiresAt?: Date;
  error?: string;
  unavailableSeatIds?: string[];
}

/**
 * Creates a concurrency-safe 5-minute hold on a set of seats for a given showtime.
 */
export async function holdSeats(params: {
  showtimeId: string;
  seatIds: string[];
  userId?: string;
}): Promise<SeatHoldResult> {
  const { showtimeId, seatIds, userId } = params;

  if (!seatIds || seatIds.length === 0) {
    return { success: false, error: "No seats selected" };
  }

  // 1. In-memory atomic lock check
  const acquired = lockManager.acquireLocks(showtimeId, seatIds);
  if (!acquired) {
    return {
      success: false,
      error: "One or more seats are currently being selected by another patron. Please select another seat.",
    };
  }

  try {
    const now = new Date();

    // 2. Clear expired holds from database first
    await prisma.seatHold.updateMany({
      where: {
        showtimeId,
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: { status: "EXPIRED" },
    });

    // 3. Query all permanently booked seats for this showtime
    const bookedSeats = await prisma.bookingSeat.findMany({
      where: {
        seatId: { in: seatIds },
        booking: {
          showtimeId,
          status: { in: ["CONFIRMED", "PENDING"] },
        },
      },
      select: { seatId: true },
    });

    if (bookedSeats.length > 0) {
      return {
        success: false,
        error: "Some seats are already booked.",
        unavailableSeatIds: bookedSeats.map((b) => b.seatId),
      };
    }

    // 4. Query any active holds for these seats
    const activeHolds = await prisma.seatHoldItem.findMany({
      where: {
        seatId: { in: seatIds },
        hold: {
          showtimeId,
          status: "ACTIVE",
          expiresAt: { gt: now },
        },
      },
      select: { seatId: true },
    });

    if (activeHolds.length > 0) {
      return {
        success: false,
        error: "Some seats are temporarily reserved by another patron.",
        unavailableSeatIds: activeHolds.map((h) => h.seatId),
      };
    }

    // 5. Create new hold with expiration
    const holdToken = `HOLD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_SECONDS * 1000);

    const seatHold = await prisma.seatHold.create({
      data: {
        showtimeId,
        userId: userId || null,
        holdToken,
        expiresAt,
        status: "ACTIVE",
        items: {
          create: seatIds.map((seatId) => ({ seatId })),
        },
      },
    });

    return {
      success: true,
      holdToken: seatHold.holdToken,
      expiresAt: seatHold.expiresAt,
    };
  } catch (error) {
    console.error("Seat hold error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while reserving seats.",
    };
  } finally {
    // Release in-flight mutex locks
    lockManager.releaseLocks(showtimeId, seatIds);
  }
}

/**
 * Validates whether an active hold exists and is owned by this token
 */
export async function validateHold(holdToken: string, showtimeId: string) {
  const now = new Date();
  const hold = await prisma.seatHold.findUnique({
    where: { holdToken },
    include: {
      items: {
        include: {
          seat: true,
        },
      },
    },
  });

  if (!hold) return { valid: false, error: "Reservation not found." };
  if (hold.showtimeId !== showtimeId) return { valid: false, error: "Mismatched showtime." };
  if (hold.status !== "ACTIVE") return { valid: false, error: `Reservation is ${hold.status.toLowerCase()}.` };
  if (hold.expiresAt <= now) {
    await prisma.seatHold.update({
      where: { id: hold.id },
      data: { status: "EXPIRED" },
    });
    return { valid: false, error: "Reservation has expired." };
  }

  return { valid: true, hold };
}

/**
 * Releases a hold voluntarily (e.g. user navigates away or unselects)
 */
export async function releaseHold(holdToken: string) {
  try {
    await prisma.seatHold.update({
      where: { holdToken },
      data: { status: "RELEASED" },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
