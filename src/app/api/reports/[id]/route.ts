import { NextRequest, NextResponse } from "next/server";

// Shared in-memory store reference (in real app use database)
// This is a simplified demo version

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Replace with Supabase update
    // const supabase = await createClient();
    // const { data, error } = await supabase
    //   .from("reports")
    //   .update({ status: body.status, admin_notes: body.admin_notes })
    //   .eq("id", id)
    //   .select()
    //   .single();

    return NextResponse.json({
      data: {
        id,
        ...body,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // TODO: Fetch single report from Supabase
  return NextResponse.json({
    data: { id, message: "Replace with real fetch" },
  });
}
