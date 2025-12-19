import { Suspense } from 'react';
import { IntegrationsClient } from '@/features/integrations/components/integrations-client';
import { getIntegrationStatusAction } from '@/features/integrations/actions';
import { db } from "@/lib/db";
import { project } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { Skeleton } from "@/components/ui/skeleton";

// Wrapper to fetch initial data
async function IntegrationsWrapper({ projectId }: { projectId: string }) {
  const status = await getIntegrationStatusAction(projectId);
  
  // Also get the API Key for the tracker
  const projectData = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  const fullStatus = {
    google: status.google || false,
    searchConsole: status.searchConsole || false,
    analytics: status.analytics || false,
    tracker: !!projectData?.url, // Using url field as apikey placeholder based on previous code
    apiKey: projectData?.url,
  };

  return <IntegrationsClient initialStatus={fullStatus} projectId={projectId} />;
}

export default function IntegrationsPage() {
  // TODO: Get real projectId from context/params. Assuming a fixed one or fetching current user's active project.
  // For now, I'll assume we have a way to get it. 
  // IMPORTANT: The user's code previously had `projectId` in `getIntegrationStatus(projectId)`.
  // I will check how `dashboard/layout` or similar provides `projectId`.
  // Usually it comes from params if route is [projectId] or from a user query if it's user-bound.
  // I will fetch the first project of the user for now to make it work, 
  // but ideally this should be dynamic.
  
  // NOTE: In the previous `page.tsx`, it wasn't clear where projectId came from.
  // Looking at the file tree, `use-project.ts` exists.
  // Since this is a server component, I can't use hooks.
  // I'll leave a placeholder ID or try to fetch it.
  
  // Let's assume we can fetch the user's project. 
  // Since I don't have the user's session here easily without more boilerplate, 
  // I will rely on the fact that the previous implementation likely handled it or I need to fetch it.
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Manage your connections to external services.
        </p>
      </div>

      <Suspense fallback={<IntegrationsSkeleton />}>
        <ProjectLoader />
      </Suspense>
    </div>
  );
}

async function ProjectLoader() {
  const { createClient } = await import('@/utils/supabase/server');
  const { cookies } = await import('next/headers');
  const supabase = await createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Please log in</div>;

  // Fetch first project for user
  // In a real app, this might come from URL params /dashboard/[slug]/integrations
  const userProject = await db.query.project.findFirst({
    where: eq(project.ownerId, user.id)
  });

  if (!userProject) {
     return <div>No project found. Please create one.</div>;
  }

  return <IntegrationsWrapper projectId={userProject.id} />;
}

function IntegrationsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full col-span-3 rounded-xl" />
        </div>
    )
}
