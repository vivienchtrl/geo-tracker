import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Récupérer les intégrations GSC actives
    const { data: integrations, error: intError } = await supabase
      .from("integrations")
      .select("*")
      .eq("provider", "google"); // Ou 'search_console' selon ta nomenclature

    if (intError) throw intError;
    if (!integrations?.length) {
      return new Response(
        JSON.stringify({ message: "No GSC integrations found" }),
        { headers: corsHeaders },
      );
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const results = [];

    for (const integ of integrations) {
      // 2. Refresh Token (Important !)
      // TODO: Implémenter la logique de refresh token ici ou via une lib partagée
      const accessToken = integ.access_token;

      // 3. Appel API Search Console
      const siteUrl = integ.metadata?.site_url; // Il faut avoir stocké l'URL du site GSC
      if (!siteUrl) continue;

      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${
          encodeURIComponent(siteUrl)
        }/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: today, // GSC a un délai de 2-3 jours souvent, ajuster la date
            endDate: today,
            dimensions: ["date"],
            rowLimit: 1,
          }),
        },
      );

      if (!response.ok) {
        console.error(
          `GSC Error for ${integ.project_id}:`,
          await response.text(),
        );
        continue;
      }

      const data = await response.json();
      const row = data.rows?.[0];

      if (row) {
        // 4. Sauvegarde
        await supabase
          .from("gsc_stats_daily")
          .upsert({
            project_id: integ.project_id,
            date: today,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
          }, { onConflict: "project_id, date" });

        results.push({ projectId: integ.project_id, clicks: row.clicks });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
