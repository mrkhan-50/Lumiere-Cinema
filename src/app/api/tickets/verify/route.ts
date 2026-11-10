import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { tokenOrRef } = await req.json();

    if (!tokenOrRef) {
      return NextResponse.json({ error: "Missing token or booking reference" }, { status: 400 });
    }

    const cleanInput = tokenOrRef.trim();

    // Find ticket by secureToken OR bookingReference
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { secureToken: cleanInput },
          { booking: { bookingReference: cleanInput } },
        ],
      },
      include: {
        booking: {
          include: {
            showtime: {
              include: {
                movie: true,
                screen: {
                  include: { cinema: true },
                },
              },
            },
            seats: {
              include: { seat: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found or invalid token" }, { status: 404 });
    }

    if (ticket.checkInStatus === "CHECKED_IN") {
      return NextResponse.json({
        valid: false,
        alreadyCheckedIn: true,
        checkedInAt: ticket.checkedInAt,
        message: `This ticket was already checked in at ${new Date(ticket.checkedInAt!).toLocaleTimeString()}`,
        ticket,
      });
    }

    // Mark as checked in
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        checkInStatus: "CHECKED_IN",
        checkedInAt: new Date(),
      },
    });

    return NextResponse.json({
      valid: true,
      message: "Patron gate admission verified and checked in!",
      ticket: {
        ...ticket,
        checkInStatus: updatedTicket.checkInStatus,
        checkedInAt: updatedTicket.checkedInAt,
      },
    });
  } catch (error) {
    console.error("Ticket verification error:", error);
    return NextResponse.json({ error: "Verification server error" }, { status: 500 });
  }
}
