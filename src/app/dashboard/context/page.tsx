import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthGuard } from "@/components/auth-guard";
import { getKeywordsByProject } from "@/backend/services/keywords.service";
import { getIcpProfilesByProject } from "@/backend/services/keywords.service"; // Ideally move this to icp.service.ts
import { getCurrentUser } from "@/backend/services/user-service";
import { getProjectByUserId } from "@/backend/services/project-service";
import { KeywordsManager } from "@/features/keywords/components/keywords-manager";
import { IcpManager } from "@/features/icp/components/icp-manager";
import { redirect } from "next/navigation";

// Server Component: Fetches Data
async function ContextPageContent() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/sign-in')

  const project = await getProjectByUserId(user.id)
  if (!project) return <div>No project found</div>

  // Parallel fetching on server
  const [keywords, icpProfiles] = await Promise.all([
    getKeywordsByProject(project.id),
    // Note: ensure getIcpProfilesByProject is implemented correctly in service
    // For now I assume it returns Promise<IcpProfile[]>
    getIcpProfilesByProject(project.id) 
  ])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Context Management</h2>
          <p className="text-muted-foreground">
            Configure keywords and ICP profiles for AI-powered searches and analysis.
          </p>
        </div>
      </div>

      <Tabs defaultValue="keywords" className="space-y-4">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="icp">ICP Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
            <KeywordsManager initialKeywords={keywords} />
        </TabsContent>

        <TabsContent value="icp" className="space-y-4">
            <IcpManager initialIcpProfiles={icpProfiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ContextPage() {
  return (
    <AuthGuard>
      <ContextPageContent />
    </AuthGuard>
  );
}
