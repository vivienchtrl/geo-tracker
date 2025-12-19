import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

import { syncGA4Data } from "./services/ga4.service.ts";
import { syncGSCData } from "./services/gsc.service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function refreshGoogleToken(refreshToken: string) {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Google Client ID or Secret in environment variables",
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to refresh Google token: ${errorBody}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Parse request body
    const body: { projectId?: string } = await req.json();
    const projectId = body.projectId;

    if (!projectId) {
      return new Response(JSON.stringify({ error: "Missing projectId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Starting ONBOARDING (3 months) for project: ${projectId}`);

    // Calculate 3 Months Range
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // Latency safety
    const endDateStr = endDate.toISOString().split("T")[0];

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    const startDateStr = startDate.toISOString().split("T")[0];

    console.log(`Range: ${startDateStr} to ${endDateStr}`);

    // 1. Fetch Integration
    const { data: integration, error: fetchError } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .eq("provider", "google")
      .eq("project_id", projectId)
      .single();

    if (fetchError || !integration) {
      throw new Error(`Integration not found for project ${projectId}`);
    }

    // 2. Refresh Token
    const accessToken = await refreshGoogleToken(integration.refresh_token);

    // 3. Sync Data
    const syncResults = { ga4: "skipped", gsc: "skipped" };

    // --- PART A: GA4 ---
    if (integration.metadata?.ga4_property_id) {
      await syncGA4Data(
        supabaseAdmin,
        accessToken,
        integration.metadata.ga4_property_id,
        projectId,
        startDateStr,
        endDateStr,
      );
      syncResults.ga4 = "success";
    }

    // --- PART B: GSC ---
    if (integration.metadata?.gsc_site_url) {
      await syncGSCData(
        supabaseAdmin,
        accessToken,
        integration.metadata.gsc_site_url,
        projectId,
        startDateStr,
        endDateStr,
      );
      syncResults.gsc = "success";
    }

    return new Response(
      JSON.stringify({
        status: "success",
        type: "onboarding",
        projectId,
        range: { start: startDateStr, end: endDateStr },
        results: syncResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(`Onboarding error:`, error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
