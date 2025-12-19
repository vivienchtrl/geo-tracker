import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// --- GSC REST API ---
// Doc: https://developers.google.com/webmaster-tools/v1/searchanalytics/query

export async function syncGSCData(
  supabaseAdmin: SupabaseClient,
  accessToken: string,
  siteUrl: string,
  projectId: string,
  startDate: string,
  endDate: string,
) {
  console.log(
    `[GSC] Syncing project ${projectId} for site ${siteUrl} from ${startDate} to ${endDate}...`,
  );

  // L'URL du site doit être encodée pour l'API REST
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url =
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;

  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["date"], // Group by date
    }),
  });

  if (!res.ok) {
    console.error(`[GSC] API Error: ${await res.text()}`);
    return;
  }

  const data = await res.json();
  const rows = data.rows || [];

  for (const sRow of rows) {
    const rowDate = sRow.keys?.[0]; // Dimension 'date' is the first key

    if (rowDate) {
      const { error } = await supabaseAdmin.from("search_console_metrics")
        .upsert({
          project_id: projectId,
          date: rowDate,
          clicks: sRow.clicks || 0,
          impressions: sRow.impressions || 0,
          ctr: sRow.ctr || 0,
          position: sRow.position || 0,
        }, { onConflict: "project_id,date" });

      if (error) {
        console.error(
          `[GSC] Error inserting metrics for ${rowDate}: ${error.message}`,
        );
      }
    }
  }
}
