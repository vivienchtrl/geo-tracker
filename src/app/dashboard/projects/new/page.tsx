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
    <div className="flex flex-col min-h-full">
      {/* Header Section - Endless Borders */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard" 
              className="flex h-8 w-8 items-center justify-center border border-dashed border-border/80 bg-background text-muted-foreground hover:text-primary hover:border-primary transition-all group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Back to Projects</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Initialize New Project</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Deployment Registry
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-12 max-w-4xl">
        <div className="grid gap-0 border border-dashed border-border/80">
          <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
            <CardHeader className="px-0 pb-8">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-3">
                <Folder className="h-3.5 w-3.5" />
                Project Specifications
              </CardTitle>
              <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                Enter the core parameters for the new analytical instance
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-10">
              <div className="space-y-4">
                <Label htmlFor="project-name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Project Identifier</Label>
                <Input
                  id="project-name"
                  placeholder="E.G. GLOBAL EXPANSION 2025"
                  className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                />
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  Unique name for project identification in the system registry.
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="project-url" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Domain Endpoint</Label>
                <div className="flex">
                  <div className="flex items-center px-4 border border-r-0 border-dashed border-border/80 bg-muted/20 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                  </div>
                  <Input
                    id="project-url"
                    placeholder="HTTPS://EXAMPLE.COM"
                    className="rounded-none border-dashed h-12 flex-1 uppercase text-xs font-bold tracking-tight"
                  />
                </div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  The primary URL target for AI visibility analysis and traffic monitoring.
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-dashed border-border/80">
                <Button variant="dashed" className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button className="uppercase text-[10px] font-bold tracking-widest px-8 h-10" disabled>
                  Initialize Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation / Info Card */}
        <div className="mt-8">
          <Card variant="bento" className="border-dashed bg-muted/5 p-10">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex h-12 w-12 items-center justify-center border border-dashed border-primary/40 bg-background text-primary shrink-0">
                  <div className="h-1 w-1 bg-primary animate-pulse" />
                </div>
                <div className="text-left space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Post-Initialization Workflow</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-relaxed">
                    Once initialized, you will proceed to keyword mapping, persona definition (ICP), 
                    and telemetry integration (GA4 / Search Console) to populate the analytics dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

