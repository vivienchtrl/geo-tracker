import { DashboardProviders } from "./providers"
import { getCurrentUser } from "@/backend/services/user-service"
import { getUserProjects } from "@/backend/services/project-service"
import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar"
import { SiteHeader } from "@/components/dashboard/sidebar/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Auth Check (Cached)
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // 2. Fetch all projects user has access to
  const projects = await getUserProjects(user.id)

  return (
    <DashboardProviders user={user} projects={projects}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProviders>
  )
}
