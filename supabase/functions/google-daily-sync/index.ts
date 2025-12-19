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

    console.log(`Starting DAILY SYNC for ALL PROJECTS`);

    // Calculate Sync Range (2 days window: Today - 2 to Today - 1)
    const end = new Date();
    end.setDate(end.getDate() - 1);
    const endDateStr = end.toISOString().split("T")[0];

    const start = new Date();
    start.setDate(start.getDate() - 2);
    const startDateStr = start.toISOString().split("T")[0];

    console.log(`Range: ${startDateStr} to ${endDateStr}`);

    // 1. Fetch ALL Google Integrations
    const { data: integrations, error: fetchError } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .eq("provider", "google");

    if (fetchError) throw fetchError;
    console.log(`Processing ${integrations.length} integrations...`);

    const results = [];

    // 2. Loop through each integration
    for (const integration of integrations) {
      try {
        const accessToken = await refreshGoogleToken(integration.refresh_token);

        // --- PART A: GA4 ---
        if (integration.metadata?.ga4_property_id) {
          await syncGA4Data(
            supabaseAdmin,
            accessToken,
            integration.metadata.ga4_property_id,
            integration.project_id,
            startDateStr,
            endDateStr,
          );
        }

        // --- PART B: GSC ---
        if (integration.metadata?.gsc_site_url) {
          await syncGSCData(
            supabaseAdmin,
            accessToken,
            integration.metadata.gsc_site_url,
            integration.project_id,
            startDateStr,
            endDateStr,
          );
        }

        results.push({ projectId: integration.project_id, status: "success" });
      } catch (err) {
        console.error(
          `Error processing project ${integration.project_id}:`,
          err,
        );
        results.push({
          projectId: integration.project_id,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        type: "daily-sync",
        range: { start: startDateStr, end: endDateStr },
        processed: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(`Daily sync error:`, error);
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
