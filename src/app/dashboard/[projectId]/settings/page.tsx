import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MembersTab } from "@/features/project/components/members-tab"
import { ApiKeysTab } from "@/features/ai-crawlers/components/api-keys-tab"
import { CreditCard, Globe } from "lucide-react"
import { getProjectMembers, getPendingInvitations } from "@/backend/services/project-members.service"
import { getProjectWithRole } from "@/backend/services/project-service"
import { getCurrentUser } from "@/backend/services/user-service"
import { getApiKeysByProject } from "@/backend/services/api-keys.service"
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

  // Get project with role
  const projectData = await getProjectWithRole(projectId, user.id)
  if (!projectData) notFound()

  const { project, role } = projectData

  // Fetch Data in Parallel
  const [membersRaw, invitationsRaw, apiKeysRaw] = await Promise.all([
    getProjectMembers(projectId),
    getPendingInvitations(projectId),
    role === 'owner' ? getApiKeysByProject(projectId) : Promise.resolve([]),
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

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section - Endless Borders */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Project Settings</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Configuration & Team Management
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Container - No lateral padding to reach sidebar border */}
      <div className="flex-1">
        <Tabs defaultValue={defaultTab} className="space-y-0 flex flex-col">
          <div className="px-8 py-4 border-b border-dashed border-border/80 bg-muted/5">
            <TabsList className="bg-transparent border-dashed border border-border/60 p-1">
              <TabsTrigger value="general" className="uppercase text-[10px] tracking-widest font-bold px-8">General</TabsTrigger>
              <TabsTrigger value="team" className="uppercase text-[10px] tracking-widest font-bold px-8">Team</TabsTrigger>
              <TabsTrigger value="api-keys" className="uppercase text-[10px] tracking-widest font-bold px-8">API Keys</TabsTrigger>
              <TabsTrigger value="billing" className="uppercase text-[10px] tracking-widest font-bold px-8">Billing</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1">
            {/* General Tab */}
            <TabsContent value="general" className="outline-none m-0">
              <div className="grid gap-0 lg:grid-cols-12 min-h-full border-b border-dashed border-border/80">
                <div className="lg:col-span-12">
                  <Card variant="bento" className="border-0 bg-transparent px-8 py-8">
                    <CardHeader className="px-0 pb-8">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Project Information</CardTitle>
                      <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Basic identification for your project</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-8">
                      <div className="grid gap-12 md:grid-cols-2">
                        <div className="space-y-4">
                          <Label htmlFor="project-name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Project Name</Label>
                          <Input
                            id="project-name"
                            defaultValue={project.name}
                            disabled={!isOwner}
                            className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label htmlFor="project-url" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Website URL</Label>
                          <div className="flex">
                            <div className="flex items-center px-4 border border-r-0 border-dashed border-border/80 bg-muted/20 text-muted-foreground">
                              <Globe className="h-4 w-4" />
                            </div>
                            <Input
                              id="project-url"
                              defaultValue={project.url}
                              disabled={!isOwner}
                              className="rounded-none border-dashed h-12 flex-1 uppercase text-xs font-bold tracking-tight"
                            />
                          </div>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex justify-end pt-4">
                          <Button className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">Save Changes</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {isOwner && (
                  <div className="lg:col-span-12 border-t border-dashed border-border/80">
                    <Card variant="bento" className="border-0 bg-transparent px-8 py-8">
                      <CardHeader className="px-0 pb-8">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive/80">Danger Zone</CardTitle>
                        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0">
                        <div className="flex flex-col sm:flex-row items-center justify-between p-8 border border-dashed border-destructive/40 bg-destructive/5 gap-6">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">Delete this project</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                              Once deleted, all data will be permanently removed.
                            </p>
                          </div>
                          <Button variant="destructive" className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">
                            Delete Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="outline-none m-0">
              <div className="min-h-full border-b border-dashed border-border/80">
                <MembersTab
                  projectId={projectId}
                  members={members}
                  invitations={invitations}
                  currentUserRole={role}
                />
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="outline-none m-0">
              <div className="min-h-full border-b border-dashed border-border/80">
                <ApiKeysTab
                  projectId={projectId}
                  apiKeys={apiKeysRaw}
                  isOwner={isOwner}
                />
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="outline-none m-0">
              <div className="min-h-full border-b border-dashed border-border/80">
                <Card variant="bento" className="border-0 bg-transparent px-8 py-16">
                  <CardContent className="px-0 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="flex h-16 w-16 items-center justify-center border border-dashed border-primary/40 bg-primary/5 text-primary">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold uppercase tracking-tighter">Stripe Integration Coming Soon</h3>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        We are currently integrating Stripe for seamless billing management. 
                      </p>
                    </div>
                    <div className="border border-dashed border-border/80 p-8 bg-muted/5 max-w-md w-full text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary/80">Architecture Plan:</p>
                      <ul className="space-y-3">
                        {['Subscription tracking via Stripe Webhooks', 'Usage limits based on Plan (Free/Pro/Enterprise)', 'PostHog Cohorts based on Plan Status'].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            <div className="h-1 w-1 bg-primary mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

