import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const language = searchParams.get("language");
    const search = searchParams.get("q");

    const where: any = {};
    if (status) where.status = status;
    if (language) where.language = language;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { genre: { contains: search } },
        { cast: { contains: search } },
        { director: { contains: search } },
      ];
    }

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { releaseDate: "desc" },
      include: {
        showtimes: {
          take: 4,
          where: { startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          include: {
            screen: {
              include: {
                cinema: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error("Fetch movies error:", error);
    return NextResponse.json(
      { error: "Failed to load movie collection" },
      { status: 500 }
    );
  }
}
