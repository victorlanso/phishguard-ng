import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";

// In-memory store for demo purposes (replace with Supabase)
const reports: any[] = [];

export async function GET(request: NextRequest) {
  // TODO: Replace with real Supabase query
  // const supabase = await createClient();
  // const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let filtered = reports;
  if (status) {
    filtered = reports.filter((r) => r.status === status);
  }

  return NextResponse.json({
    data: filtered,
    count: filtered.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { source, message_text, suspected_type, note, screenshot_url } = body;

    if (!message_text || !source) {
      return NextResponse.json(
        { error: "message_text and source are required" },
        { status: 400 }
      );
    }

    const newReport = {
      id: crypto.randomUUID(),
      source,
      message_text,
      suspected_type: suspected_type || "other",
      note: note || null,
      screenshot_url: screenshot_url || null,
      status: "new",
      created_at: new Date().toISOString(),
      user_id: "demo-user", // Replace with real auth user id
    };

    // TODO: Replace with real Supabase insert
    // const supabase = await createClient();
    // const { data, error } = await supabase.from("reports").insert(newReport).select().single();

    reports.unshift(newReport);

    return NextResponse.json({ data: newReport }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
