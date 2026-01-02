import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MembersTab } from "@/features/project/components/members-tab"
import { LlmSettings } from "@/features/project/components/llm-settings"
import { Globe } from "lucide-react"
import { getProjectMembers, getPendingInvitations } from "@/backend/services/project-members.service"
import { getProjectWithRole } from "@/backend/services/project-service"
import { getCurrentUser } from "@/backend/services/user-service"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { LlmService } from "@/backend/validators/project.validators"

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
  const [membersRaw, invitationsRaw] = await Promise.all([
    getProjectMembers(projectId),
    getPendingInvitations(projectId),
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

                <div className="lg:col-span-12 border-t border-dashed border-border/80">
                  <LlmSettings
                    projectId={projectId}
                    currentEnabledLlm={(project.enabledLlm || ['chatgpt', 'perplexity']) as LlmService[]}
                    isOwner={isOwner}
                  />
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
          </div>
        </Tabs>
      </div>
    </div>
  )
}

