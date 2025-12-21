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

  // If user has only one project, redirect directly to it
  if (projects.length === 1) {
    redirect(`/dashboard/${projects[0].project.id}`)
  }

  // If user has no projects, redirect to onboarding
  if (projects.length === 0) {
    redirect('/auth/onboarding')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-muted-foreground mt-1">
            Select a project to view its dashboard and analytics
          </p>
        </div>
        <Button variant="outline">
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(({ project, role }) => (
          <Link 
            key={project.id} 
            href={`/dashboard/${project.id}`}
            className="group"
          >
            <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md group-hover:bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Folder className="h-5 w-5" />
                  </div>
                  <Badge 
                    variant={role === 'owner' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {role}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{project.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  <Globe className="mr-1 inline h-3 w-3" />
                  {project.url}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                  <span className="flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats / Welcome Section */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Folder className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">
            {projects.length} Project{projects.length > 1 ? 's' : ''} Available
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Select a project above to view its analytics, manage keywords, 
            configure integrations, and track AI traffic.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
