import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MembersTab } from "@/features/project/components/members-tab"
import { KeywordsManager } from "@/features/keywords/components/keywords-manager"
import { IcpManager } from "@/features/icp/components/icp-manager"
import { Users, CreditCard, Database, Target, Settings as SettingsIcon, Globe } from "lucide-react"
import { getProjectMembers, getPendingInvitations } from "@/backend/services/project-members.service"
import { getKeywordsByProject } from "@/backend/services/keywords.service"
import { getIcpProfilesByProject } from "@/backend/services/icp-profiles"
import { getProjectWithRole } from "@/backend/services/project-service"
import { getCurrentUser } from "@/backend/services/user-service"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface SettingsPageProps {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { projectId } = await params
  const { tab } = await searchParams
  const defaultTab = tab || "general"

  const user = await getCurrentUser()
  if (!user) notFound()

  // Get project with role (layout already validated access, but we need the data)
  const projectData = await getProjectWithRole(projectId, user.id)
  if (!projectData) notFound()

  const { project, role } = projectData

  // Fetch Data in Parallel
  const [membersRaw, invitationsRaw, keywordsData, icpData] = await Promise.all([
    getProjectMembers(projectId),
    getPendingInvitations(projectId),
    getKeywordsByProject(projectId),
    getIcpProfilesByProject(projectId)
  ])

  // Transform Members Data for UI
  const members = membersRaw.map(m => ({
    id: m.userId,
    email: m.user.email,
    role: m.role as "owner" | "editor" | "viewer",
    joinedAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString()
  }))

  const invitations = invitationsRaw.map(i => ({
    id: i.id,
    email: i.email,
    role: i.role as "owner" | "editor" | "viewer",
    createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : new Date().toISOString()
  }))

  const isOwner = role === 'owner'
  const canEdit = role === 'owner' || role === 'editor'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your project configuration, keywords, ICP profiles, and team.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="general" className="flex gap-2 py-3">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex gap-2 py-3">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Keywords</span>
          </TabsTrigger>
          <TabsTrigger value="icp" className="flex gap-2 py-3">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">ICP</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex gap-2 py-3">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex gap-2 py-3">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Basic information about your project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    defaultValue={project.name}
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-url">Website URL</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 border rounded-l-md bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="project-url"
                      defaultValue={project.url}
                      disabled={!isOwner}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              {isOwner && (
                <div className="flex justify-end">
                  <Button disabled>Save Changes</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isOwner && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium">Delete this project</p>
                    <p className="text-sm text-muted-foreground">
                      Once deleted, all data will be permanently removed.
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    Delete Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-4 mt-6">
          <Suspense fallback={<SettingsSkeleton />}>
            <KeywordsManager initialKeywords={keywordsData} />
          </Suspense>
        </TabsContent>

        {/* ICP Tab */}
        <TabsContent value="icp" className="space-y-4 mt-6">
          <Suspense fallback={<SettingsSkeleton />}>
            <IcpManager initialIcpProfiles={icpData} />
          </Suspense>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4 mt-6">
          <MembersTab
            projectId={projectId}
            members={members}
            invitations={invitations}
            currentUserRole={role}
          />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>Manage your plan and payment methods.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="p-3 bg-muted rounded-full">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Stripe Integration Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We are currently integrating Stripe for seamless billing management. 
                    You will be able to manage your invoices, upgrade your plan, and view usage history here.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground border p-4 rounded-lg bg-muted/50 max-w-md">
                  <p className="font-semibold mb-2">Architecture Plan:</p>
                  <ul className="list-disc list-inside text-left space-y-1">
                    <li>Subscription tracking via Stripe Webhooks</li>
                    <li>Usage limits based on Plan (Free/Pro/Enterprise)</li>
                    <li>PostHog Cohorts based on Plan Status</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

