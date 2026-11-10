import { NextResponse } from "next/server";
import { z } from "zod";
import { holdSeats, releaseHold, validateHold } from "@/lib/reservation";
import { getCurrentUser } from "@/lib/auth";

const holdRequestSchema = z.object({
  showtimeId: z.string().uuid(),
  seatIds: z.array(z.string().uuid()).min(1, "Select at least 1 seat"),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const validated = holdRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { showtimeId, seatIds } = validated.data;
    const result = await holdSeats({
      showtimeId,
      seatIds,
      userId: user?.userId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          unavailableSeatIds: result.unavailableSeatIds,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Seats reserved successfully for 5 minutes",
      holdToken: result.holdToken,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Hold API error:", error);
    return NextResponse.json(
      { error: "Internal error creating seat hold" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const holdToken = searchParams.get("holdToken");

    if (!holdToken) {
      return NextResponse.json({ error: "Missing holdToken" }, { status: 400 });
    }

    await releaseHold(holdToken);
    return NextResponse.json({ message: "Hold released successfully" });
  } catch (error) {
    console.error("Release hold error:", error);
    return NextResponse.json({ error: "Failed to release hold" }, { status: 500 });
  }
}
