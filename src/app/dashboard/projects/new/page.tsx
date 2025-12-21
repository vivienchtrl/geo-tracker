import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/backend/services/user-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, Folder } from "lucide-react"
import Link from "next/link"

export default async function NewProjectPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/sign-in')

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new project to track your website&apos;s AI visibility and traffic.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Project Details
          </CardTitle>
          <CardDescription>
            Enter the basic information for your new project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="My Awesome Website"
            />
            <p className="text-xs text-muted-foreground">
              A friendly name to identify your project.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-url">Website URL</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 border rounded-l-md bg-muted">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="project-url"
                placeholder="https://example.com"
                className="rounded-l-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The main domain you want to track for AI mentions and traffic.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button disabled>
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="py-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">What happens next?</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              After creating your project, you&apos;ll be able to add keywords to track,
              configure ICP profiles for AI search analysis, and connect integrations
              like Google Analytics and Search Console.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

