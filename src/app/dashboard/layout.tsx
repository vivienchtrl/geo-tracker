import { DashboardProviders } from "./providers"
import { getCurrentUser } from "@/backend/services/user-service"
import { getDashboardContext } from "@/backend/services/dashboard.service"
import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar"
import { SiteHeader } from "@/components/dashboard/sidebar/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Light Auth Check (Cached)
  const authUser = await getCurrentUser()
  
  if (!authUser) {
    redirect('/auth/sign-in')
  }

  // 2. Heavy Data Fetch (Cached with Tags)
  // This aggregates User + Project + Keywords + ICP + AI Search
  const dashboardData = await getDashboardContext(authUser.id)

  if (!dashboardData) {
     // Fallback / Edge case: User exists in Auth but not DB or critical error
     redirect('/auth/sign-in')
  }

  return (
    <DashboardProviders initialData={dashboardData}>
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
              <div className="@container/main flex flex-1 flex-col gap-2">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
    </DashboardProviders>
  )
}
