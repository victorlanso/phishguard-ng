export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateId, targets } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    // Only use templateId if it looks like a real UUID
    const isValidUUID = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        name,
        template_id: isValidUUID(templateId) ? templateId : null,
        status: "draft",
        created_by: user.id,
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      throw campaignError || new Error("Failed to create campaign");
    }

    // Prepare targets
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const finalTargets = targets?.length ? targets : [];

    const resultsToInsert = finalTargets.map((t: any) => {
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      return {
        campaign_id: campaign.id,
        user_id: t.user_id || null,
        email: t.email,
        name: t.name || t.email?.split("@")[0] || "User",
        token,
        tracking_url: `${baseUrl}/sim/${token}`,
        opened: false,
        clicked: false,
        reported: false,
      };
    });

    if (resultsToInsert.length > 0) {
      const { error: resultsError } = await supabase
        .from("campaign_results")
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;
    }

    // Return the full campaign with results
    const { data: fullCampaign } = await supabase
      .from("campaigns")
      .select(`
        *,
        campaign_results (
          id, email, name, token, tracking_url, opened, clicked, reported, user_id
        )
      `)
      .eq("id", campaign.id)
      .single();

    return NextResponse.json({ data: fullCampaign }, { status: 201 });
  } catch (error: any) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}
