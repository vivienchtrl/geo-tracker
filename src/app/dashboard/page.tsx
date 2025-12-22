import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/backend/services/user-service'
import { getUserProjects } from '@/backend/services/project-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Folder, Globe, Users, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/sign-in')

  const projects = await getUserProjects(user.id)

  // Only redirect to onboarding if it's a TRULY new user 
  // (no projects AND no profile setup yet)
  if (projects.length === 0 && !user.firstName) {
    redirect('/auth/onboarding')
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section - Endless Borders */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Your Projects</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Select a project to view analytics
            </p>
          </div>
        </div>
        <Button variant="dashed" size="sm" className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">
          <Link href="/dashboard/projects/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Projects Grid Section */}
      <div className="flex-1 px-8 py-12">
        {projects.length > 0 ? (
          <div className="grid gap-0 border border-dashed border-border/80 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(({ project, role }) => (
              <Link 
                key={project.id} 
                href={`/dashboard/${project.id}`}
                className="group border-r border-b border-dashed border-border/80 last:border-r-0 lg:nth-[3n]:border-r-0 md:nth-[2n]:border-r-0"
              >
                <Card variant="bento" className="h-full border-0 transition-all duration-300 hover:bg-primary/5 group/card p-8">
                  <CardHeader className="p-0 pb-8">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center border border-dashed border-primary/40 bg-primary/5 text-primary group-hover/card:border-primary/60 transition-colors">
                        <Folder className="h-6 w-6" />
                      </div>
                      <Badge 
                        variant={role === 'owner' ? 'default' : 'secondary'}
                        className="text-[8px] uppercase font-black tracking-widest px-2"
                      >
                        {role}
                      </Badge>
                    </div>
                    <CardTitle className="mt-6 text-xl uppercase font-bold tracking-tight group-hover/card:text-primary transition-colors">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-1 font-mono text-[9px] uppercase tracking-widest mt-2 flex items-center gap-2">
                      <Globe className="h-3 w-3 text-primary/60" />
                      {project.url}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">
                      <span className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-border" />
                        {role === 'owner' ? 'Administrator' : 'Collaborator'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-2 transition-all group-hover/card:opacity-100 group-hover/card:translate-x-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border/80 bg-muted/5">
            <div className="flex h-16 w-16 items-center justify-center border border-dashed border-border/60 bg-background text-muted-foreground/40 mb-6">
              <Folder className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">No Active Projects</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-3 mb-10 text-center max-w-[280px] leading-relaxed">
              Your command center is currently empty. Initialize a project to begin monitoring.
            </p>
            <Button variant="dashed" className="uppercase text-[10px] font-bold tracking-widest px-10 h-12">
              <Link href="/dashboard/projects/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Project
              </Link>
            </Button>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mt-12">
          <Card variant="bento" className="border-dashed bg-muted/5 p-12">
            <CardContent className="p-0 flex flex-col items-center justify-center text-center">
              <div className="mb-6 border border-dashed border-border/60 bg-background p-4">
                <Folder className="h-6 w-6 text-primary/60" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tighter">
                {projects.length} Project{projects.length > 1 ? 's' : ''} Connected
              </h3>
              <p className="mt-3 max-w-sm text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
                Your unified interface for AI Engines, Google Search, and Web Traffic. 
                Select a project above to enter the command center.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
