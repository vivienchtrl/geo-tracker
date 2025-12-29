"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import {
  IconSettings2,
  IconChartBar,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconLogout,
  IconBell,
  IconUser,
  IconChevronUp,
  IconTags,
  IconRadar,
  IconBug,
  IconSearch,
} from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"

import { NavMain } from "@/components/dashboard/sidebar/nav-main"
import { NavSecondary } from "@/components/dashboard/sidebar/nav-secondary"
import { ProjectSwitcher } from "@/components/dashboard/sidebar/project-switcher"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/features/auth/providers/user-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  
  // Get projectId from URL params (when inside /dashboard/[projectId]/*)
  const projectId = params.projectId as string | undefined
  const isInProjectContext = !!projectId
  
  // Check current route for active state
  const isProjectHub = pathname === '/dashboard'
  const isAccountPage = pathname === '/dashboard/account'
  
  // Navigation items based on context
  const navMain = isInProjectContext ? [
    {
      title: "Overview",
      url: `/dashboard/${projectId}`,
      icon: IconChartBar,
      isActive: pathname === `/dashboard/${projectId}`,
    },
    {
      title: "AI Monitoring",
      url: `/dashboard/${projectId}/ai-monitoring`,
      icon: IconRadar,
      isActive: pathname.startsWith(`/dashboard/${projectId}/ai-monitoring`),
    },
    {
      title: "AI Crawlers",
      url: `/dashboard/${projectId}/ai-crawlers`,
      icon: IconBug,
      isActive: pathname.startsWith(`/dashboard/${projectId}/ai-crawlers`),
    },
    {
      title: "Competitors",
      url: `/dashboard/${projectId}/competitors`,
      icon: IconSearch,
      isActive: pathname.startsWith(`/dashboard/${projectId}/competitors`),
    },
    {
      title: "Keywords",
      url: `/dashboard/${projectId}/keywords`,
      icon: IconTags,
      isActive: pathname === `/dashboard/${projectId}/keywords`,
    },
    {
      title: "Project Settings",
      url: `/dashboard/${projectId}/settings`,
      icon: IconFolder,
      isActive: pathname.startsWith(`/dashboard/${projectId}/settings`),
    },
    {
      title: "Integrations",
      url: `/dashboard/${projectId}/integrations`,
      icon: IconSettings2,
      isActive: pathname === `/dashboard/${projectId}/integrations`,
    },
  ] : [
    {
      title: "Projects",
      url: "/dashboard",
      icon: IconFolder,
      isActive: isProjectHub,
    },
  ]

  const navSecondary = [
    {
      title: "Account",
      url: "/dashboard/account",
      icon: IconUser,
      isActive: isAccountPage,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ]

  // Get user initials for display
  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || '??'

  // Logout handler
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 p-1.5 border border-transparent hover:border-dashed hover:border-border/80 hover:bg-sidebar-accent transition-colors"
            >
              <div className="flex aspect-square size-8 items-center justify-center border border-dashed border-sidebar-primary/40 bg-sidebar-primary text-sidebar-primary-foreground">
                <IconInnerShadowTop className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">Geo Tracker</span>
                <span className="truncate text-xs text-muted-foreground">
                  Analytics & Traffic
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Project Switcher */}
        <ProjectSwitcher />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      
      <SidebarFooter>
        {/* Notifications */}
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 w-full cursor-pointer hover:bg-sidebar-accent/50 p-2 border border-transparent hover:border-dashed hover:border-border/80">
              <div className="relative">
                <IconBell className="size-4" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>
              <span className="truncate group-data-[collapsible=icon]:hidden text-sm uppercase font-bold tracking-tight">Notifications</span>
              <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 group-data-[collapsible=icon]:hidden">
                3
              </Badge>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Menu with Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center gap-2 p-2 border border-transparent hover:border-dashed hover:border-border/80 hover:bg-sidebar-accent cursor-pointer outline-none">
                <div className="flex aspect-square size-8 items-center justify-center border border-dashed border-border/80 bg-muted text-muted-foreground text-xs font-medium uppercase">
                  {userInitials}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : 'User'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <IconChevronUp className="size-4 ml-auto group-data-[collapsible=icon]:hidden text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56" 
                align="end" 
                side="top"
                sideOffset={8}
              >
                <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
                  <IconUser className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
