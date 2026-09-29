import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // make sure this exists

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Limit size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    // --- Supabase Storage Upload ---
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Convert File → Uint8Array
    const fileBuffer = new Uint8Array(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("report-screenshots")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("report-screenshots")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      url: publicData.publicUrl,
      path: uploadData.path,
    });

  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
