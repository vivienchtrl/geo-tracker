import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// --- GA4 REST API ---
// Doc: https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport

export async function syncGA4Data(
  supabaseAdmin: SupabaseClient,
  accessToken: string,
  propertyId: string,
  projectId: string,
  startDate: string,
  endDate: string,
) {
  console.log(
    `[GA4] Syncing project ${projectId} for property ${propertyId} from ${startDate} to ${endDate}...`,
  );

  const baseUrl =
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // 1. Traffic Sources (Dynamic)
  const sourcesRes = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: "date" },
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    }),
  });

  if (!sourcesRes.ok) {
    console.error(`[GA4] Traffic API Error: ${await sourcesRes.text()}`);
    return;
  }

  const sourcesData = await sourcesRes.json();
  const sourceRows = sourcesData.rows || [];

  for (const row of sourceRows) {
    const rowDate = row.dimensionValues?.[0].value;
    const formattedDate = `${rowDate.substring(0, 4)}-${
      rowDate.substring(4, 6)
    }-${rowDate.substring(6, 8)}`;
    const source = row.dimensionValues?.[1].value || "(unknown)";
    const medium = row.dimensionValues?.[2].value || "(unknown)";
    const sessions = parseInt(row.metricValues?.[0].value || "0", 10);
    const totalUsers = parseInt(row.metricValues?.[1].value || "0", 10);

    const { error } = await supabaseAdmin.from("traffic_sources").upsert({
      project_id: projectId,
      date: formattedDate,
      source,
      medium,
      visits: sessions,
      visitors: totalUsers,
    }, { onConflict: "project_id,date,source,medium" });

    if (error) {
      console.error(`[GA4] Error inserting traffic source: ${error.message}`);
    }
  }

  // 2. Global Metrics
  const metricsRes = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    }),
  });

  if (!metricsRes.ok) {
    console.error(`[GA4] Metrics API Error: ${await metricsRes.text()}`);
    return;
  }

  const metricsData = await metricsRes.json();
  const metricRows = metricsData.rows || [];

  for (const mRow of metricRows) {
    const rowDate = mRow.dimensionValues?.[0].value;
    const formattedDate = `${rowDate.substring(0, 4)}-${
      rowDate.substring(4, 6)
    }-${rowDate.substring(6, 8)}`;

    const { error } = await supabaseAdmin.from("analytics_metrics").upsert({
      project_id: projectId,
      date: formattedDate,
      sessions: parseInt(mRow.metricValues?.[0].value || "0"),
      total_users: parseInt(mRow.metricValues?.[1].value || "0"),
      active_users: parseInt(mRow.metricValues?.[2].value || "0"),
      new_users: parseInt(mRow.metricValues?.[3].value || "0"),
      screen_page_views: parseInt(mRow.metricValues?.[4].value || "0"),
      engagement_rate: parseFloat(mRow.metricValues?.[5].value || "0"),
      average_session_duration: parseFloat(mRow.metricValues?.[6].value || "0"),
      bounce_rate: parseFloat(mRow.metricValues?.[7].value || "0"),
    }, { onConflict: "project_id,date" });

    if (error) {
      console.error(
        `[GA4] Error inserting metrics for ${formattedDate}: ${error.message}`,
      );
    }
  }
}
