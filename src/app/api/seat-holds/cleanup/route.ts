import { NextResponse } from "next/server";
import { expireOldHolds } from "@/lib/holdService";

export async function POST() {
  try {
    const expiredCount = await expireOldHolds();
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${expiredCount} expired hold(s)`,
      expiredCount,
    });
  } catch (error) {
    console.error("Hold cleanup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cleanup expired holds" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
