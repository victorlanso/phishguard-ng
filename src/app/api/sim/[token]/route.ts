import { NextRequest, NextResponse } from "next/server";
import { campaignStore } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 6) {
      return NextResponse.json(
        { error: "Invalid simulation token" },
        { status: 400 }
      );
    }

    const found = campaignStore.markClicked(token);

    if (!found) {
      // Still show success page even if token is unknown (demo-friendly)
      return NextResponse.json({
        success: true,
        message: "Click recorded (token not linked to a campaign)",
        token,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Click recorded successfully",
      token,
    });
  } catch (error) {
    console.error("Simulation tracking error:", error);
    return NextResponse.json(
      { error: "Failed to record interaction" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  return NextResponse.json({ token });
}
