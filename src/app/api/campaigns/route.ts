import { NextRequest, NextResponse } from "next/server";
import { campaignStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ data: campaignStore.getAll() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, templateId, templateName, channel, subject, targets } = body;

    if (!name || !templateId) {
      return NextResponse.json(
        { error: "name and templateId are required" },
        { status: 400 }
      );
    }

    const demoTargets = targets?.length
      ? targets
      : [
          { email: "employee1@demo.com", name: "Adebayo" },
          { email: "employee2@demo.com", name: "Chioma" },
          { email: "employee3@demo.com", name: "Emeka" },
        ];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const results = demoTargets.map((user: any) => {
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      return {
        email: user.email,
        name: user.name,
        token,
        trackingUrl: `${baseUrl}/sim/${token}`,
        opened: false,
        clicked: false,
        reported: false,
      };
    });

    const campaign = {
      id: crypto.randomUUID(),
      name,
      templateId,
      templateName: templateName || "Unknown Template",
      channel: channel || "email",
      status: "draft",
      results,
      created_at: new Date().toISOString(),
    };

    campaignStore.add(campaign);

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
