import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google-oauth";
import { createOrUpdateIntegration } from "@/backend/services/integrations.service";
import { revalidateTag } from "next/cache";
import { google } from "googleapis";
import { db } from "@/lib/db";
import { project } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

// Helper pour normaliser les URLs (retirer https, www, slashes, et prefixe sc-domain) pour la comparaison
function normalizeUrl(url: string) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/^sc-domain:/, '') // Fix pour Search Console Domain Properties
    .replace(/\/$/, '')
    .toLowerCase();
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const projectId = req.nextUrl.searchParams.get("state"); 
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=${error}`);
  }

  if (!code || !projectId) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  try {
    // 1. Échange du code contre les tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Récupérer l'URL du projet pour le matching
    const projectData = await db.query.project.findFirst({
        where: eq(project.id, projectId)
    });

    if (!projectData) throw new Error("Project not found");
    const projectDomain = normalizeUrl(projectData.url);

    // 3. AUTO-MATCHING GA4
    let matchedGA4Id = null;
    try {
        const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth: oauth2Client });
        // Lister les comptes
        const accounts = await analyticsAdmin.accounts.list();
        
        console.log("---- DEBUG GA4 MATCHING ----");
        console.log("Project Domain to match:", projectDomain);

        if (accounts.data.accounts) {
            for (const account of accounts.data.accounts) {
                const properties = await analyticsAdmin.properties.list({ filter: `parent:${account.name}` });
                
                if (properties.data.properties) {
                    for (const prop of properties.data.properties) {
                        const dataStreams = await analyticsAdmin.properties.dataStreams.list({ parent: prop.name! });
                        
                        console.log(`Checking Property: ${prop.displayName} (${prop.name})`);
                        
                        const matchingStream = dataStreams.data.dataStreams?.find(ds => {
                            const streamUri = ds.webStreamData?.defaultUri;
                            if (!streamUri) return false;
                            
                            const normalizedStream = normalizeUrl(streamUri);
                            const isMatch = normalizedStream.includes(projectDomain) || projectDomain.includes(normalizedStream);
                            
                            console.log(`   - Stream: ${streamUri} (Normalized: ${normalizedStream}) -> Match? ${isMatch}`);
                            return isMatch;
                        });

                        if (matchingStream) {
                            matchedGA4Id = prop.name?.split('/')[1]; 
                            console.log("   >>> MATCH FOUND! ID:", matchedGA4Id);
                            break;
                        }
                    }
                }
                if (matchedGA4Id) break;
            }
        }
    } catch (e) {
        console.warn("Failed to auto-match GA4 property:", e);
    }

    // 4. AUTO-MATCHING SEARCH CONSOLE
    let matchedGSCUrl = null;
    try {
        const searchConsole = google.webmasters({ version: 'v3', auth: oauth2Client });
        const sites = await searchConsole.sites.list();
        
        console.log("---- DEBUG GSC MATCHING ----");
        if (sites.data.siteEntry) {
             const foundSite = sites.data.siteEntry?.find(s => {
                const normalizedSite = normalizeUrl(s.siteUrl!);
                const isMatch = normalizedSite.includes(projectDomain) || projectDomain.includes(normalizedSite);
                
                console.log(`Checking Site: ${s.siteUrl} (Normalized: ${normalizedSite}) -> Match? ${isMatch}`);
                return isMatch;
            });

            if (foundSite) {
                matchedGSCUrl = foundSite.siteUrl;
                 console.log("   >>> MATCH FOUND! URL:", matchedGSCUrl);
            }
        } else {
            console.log("No sites found in Search Console.");
        }
       
    } catch (e) {
         console.warn("Failed to auto-match GSC site:", e);
    }

    // 5. Sauvegarde avec les Metadata trouvées
    await createOrUpdateIntegration({
      projectId,
      provider: "google",
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date!),
      metadata: { 
          scopes: tokens.scope,
          ga4_property_id: matchedGA4Id, // Sera null si pas trouvé (l'UI pourra demander de choisir manuellement)
          gsc_site_url: matchedGSCUrl
      }
    });

    revalidateTag("integrations", "page");

    const params = new URLSearchParams();
    params.set("success", "true");
    if (matchedGA4Id) params.set("ga4_matched", "true");
    if (matchedGSCUrl) params.set("gsc_matched", "true");

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?${params.toString()}`);

  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=oauth_failed`);
  }
}
