import { NextRequest, NextResponse } from "next/server";
import { campaignStore } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = campaignStore.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "PhishGuard Simulation <onboarding@resend.dev>";

    // Real sending with Resend
    if (resendApiKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      const results = [];

      for (const target of campaign.results) {
        try {
          const html = buildSimulationEmail({
            name: target.name,
            trackingUrl: target.trackingUrl,
            templateName: campaign.templateName,
          });

          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: target.email,
            subject: getSubject(campaign.templateName),
            html,
          });

          results.push({
            email: target.email,
            success: !error,
            id: data?.id,
            error: error?.message,
          });
        } catch (err: any) {
          results.push({
            email: target.email,
            success: false,
            error: err.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;

      return NextResponse.json({
        success: true,
        mode: "resend",
        message: `Campaign launched. ${successCount}/${results.length} emails sent.`,
        results,
      });
    }

    // Demo mode
    return NextResponse.json({
      success: true,
      mode: "demo",
      message:
        "Campaign launched in DEMO mode. No real emails sent. Share the tracking links manually.",
      trackingLinks: campaign.results.map((r) => ({
        name: r.name,
        email: r.email,
        url: r.trackingUrl,
      })),
    });
  } catch (error) {
    console.error("Launch campaign error:", error);
    return NextResponse.json(
      { error: "Failed to launch campaign" },
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
  // Simple realistic-looking simulation email
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
