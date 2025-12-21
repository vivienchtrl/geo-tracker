'use server'

import { revalidateTag } from "next/cache";
import { deleteIntegration, getIntegrationsByProject } from "@/backend/services/integrations.service";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/backend/db/db";
import { project } from "@/backend/db/tables/project";
import { eq } from "drizzle-orm";

export async function getIntegrationStatusAction(projectId: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const results = await getIntegrationsByProject(projectId);

  return {
    google: results.some((i) => i.provider === "google"),
    searchConsole: results.some(
      (i) =>
        i.provider === "google" &&
        i.metadata &&
        (i.metadata as { scopes?: string[] }).scopes?.includes("webmasters")
    ),
    analytics: results.some(
      (i) =>
        i.provider === "google" &&
        i.metadata &&
        (i.metadata as { scopes?: string[] }).scopes?.includes("analytics")
    ),
  };
}

export async function disconnectIntegrationAction(projectId: string, provider: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteIntegration(projectId, provider);
    revalidateTag("integrations", "pages");
    return { success: true };
  } catch (error) {
    console.error("Failed to disconnect integration:", error);
    return { success: false, error: "Failed to disconnect integration" };
  }
}

export async function connectGoogleAction(projectId: string) {
    // This is a server action, but we need to redirect to the auth URL.
    redirect(`/api/auth/google/connect?projectId=${projectId}`);
}

export async function generateApiKey(projectId: string) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const apiKey = "pk_" + Math.random().toString(36).substring(2) + Date.now().toString(36); 
    
    await db.update(project)
        .set({ url: apiKey }) // Assuming 'url' is being used as the api key field based on previous code context
        .where(eq(project.id, projectId));
        
    return apiKey;
}
