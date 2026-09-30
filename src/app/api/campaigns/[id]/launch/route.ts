import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get campaign + results
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        campaign_results (
          id, email, name, token, tracking_url, opened, clicked, reported
        )
      `)
      .eq("id", id)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const results = campaign.campaign_results || [];

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No targets found for this campaign" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "PhishGuard Simulation <onboarding@resend.dev>";

    // Real sending with Resend
    if (resendApiKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      const sendResults = [];

      for (const target of results) {
        try {
          const html = buildSimulationEmail({
            name: target.name || "User",
            trackingUrl: target.tracking_url,
            templateName: campaign.name,
          });

          const { data, error: sendError } = await resend.emails.send({
            from: fromEmail,
            to: target.email,
            subject: getSubject(campaign.name),
            html,
          });

          sendResults.push({
            email: target.email,
            success: !sendError,
            id: data?.id,
            error: sendError?.message,
          });
        } catch (err: any) {
          sendResults.push({
            email: target.email,
            success: false,
            error: err.message,
          });
        }
      }

      // Update campaign status
      await supabase
        .from("campaigns")
        .update({ status: "active" })
        .eq("id", id);

      const successCount = sendResults.filter((r) => r.success).length;

      return NextResponse.json({
        success: true,
        mode: "resend",
        message: `Campaign launched. ${successCount}/${sendResults.length} emails sent.`,
        results: sendResults,
      });
    }

    // Fallback if no Resend key (still updates status)
    await supabase
      .from("campaigns")
      .update({ status: "active" })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      mode: "manual",
      message: "Campaign activated. No Resend API key found – share tracking links manually.",
      trackingLinks: results.map((r: any) => ({
        name: r.name,
        email: r.email,
        url: r.tracking_url,
      })),
    });
  } catch (error: any) {
    console.error("Launch campaign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to launch campaign" },
      { status: 500 }
    );
  }
}

function getSubject(templateName: string): string {
  if (templateName.includes("FIRS")) {
    return "Urgent: Outstanding Tax Liability – Action Required";
  }
  if (templateName.includes("BEC") || templateName.includes("CEO")) {
    return "Urgent Payment Request – Confidential";
  }
  if (templateName.includes("Bank")) {
    return "ALERT: Your account has been temporarily restricted";
  }
  return "Important Security Notice";
}

function buildSimulationEmail({
  name,
  trackingUrl,
  templateName,
}: {
  name: string;
  trackingUrl: string;
  templateName: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 560px;">
  <p>Dear ${name},</p>
  
  <p>This is a simulated security message related to: <strong>${templateName}</strong>.</p>
  
  <p>Please review the details using the secure link below:</p>
  
  <p style="margin: 24px 0;">
    <a href="${trackingUrl}" 
       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Review Details
    </a>
  </p>
  
  <p style="font-size: 13px; color: #64748b;">
    If you believe this message is suspicious, report it through your organisation's security app instead of clicking unknown links.
  </p>
</body>
</html>
  `.trim();
}
