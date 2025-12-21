'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { IconChevronDown, IconSettings, IconFolder, IconPlus, IconCheck } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { useUserProjects } from '@/features/project/providers/user-projects-provider'

export function ProjectSwitcher() {
  const { projects } = useUserProjects()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  
  // Get current projectId from URL
  const currentProjectId = params.projectId as string | undefined
  const currentProjectData = projects.find(p => p.project.id === currentProjectId)
  const currentProject = currentProjectData?.project
  const currentRole = currentProjectData?.role

  // Handle project switch - preserve sub-path when switching
  const handleProjectSwitch = (projectId: string) => {
    setIsOpen(false)
    
    if (!currentProjectId) {
      // Not in a project context, go to project dashboard
      router.push(`/dashboard/${projectId}`)
      return
    }

    // Try to preserve the current sub-path
    // e.g., /dashboard/abc/settings -> /dashboard/xyz/settings
    const pathParts = pathname.split('/')
    const projectIdIndex = pathParts.findIndex(part => part === currentProjectId)
    
    if (projectIdIndex !== -1 && pathParts.length > projectIdIndex + 1) {
      // Has sub-path, preserve it
      const subPath = pathParts.slice(projectIdIndex + 1).join('/')
      router.push(`/dashboard/${projectId}/${subPath}`)
    } else {
      // No sub-path, go to project dashboard
      router.push(`/dashboard/${projectId}`)
    }
  }

  if (!projects || projects.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Link 
            href="/dashboard/projects/new" 
            className="flex items-center gap-2 w-full p-2 rounded-md text-sm hover:bg-sidebar-accent"
          >
            <IconPlus className="h-4 w-4" />
            <span className="truncate">New Project</span>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="w-full flex items-center gap-2 p-2 border border-transparent hover:border-dashed hover:border-border/80 text-[10px] uppercase font-bold tracking-widest hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent outline-none transition-all">
            <IconFolder className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate flex-1 text-left">
              {currentProject?.name || 'Select project'}
            </span>
            {currentRole && (
              <Badge variant="outline" className="text-[8px] h-4 px-1.5 py-0 mr-1 border-dashed uppercase font-bold tracking-tighter">
                {currentRole}
              </Badge>
            )}
            <IconChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-none border-dashed border-border/80" align="start" side="right" sideOffset={12}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60 py-3">Your Projects</DropdownMenuLabel>
              <DropdownMenuSeparator className="border-dashed" />
              {projects.map(({ project, role }) => (
                <DropdownMenuItem 
                  key={project.id} 
                  className="cursor-pointer flex items-center gap-3 py-3 text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => handleProjectSwitch(project.id)}
                >
                  <IconFolder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{project.name}</span>
                  <Badge 
                    variant={role === 'owner' ? 'default' : 'secondary'} 
                    className="text-[8px] h-4 px-1.5 uppercase font-black tracking-tighter"
                  >
                    {role}
                  </Badge>
                  {currentProjectId === project.id && (
                    <IconCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="border-dashed" />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="cursor-pointer py-3 text-[10px] uppercase font-bold tracking-widest"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/dashboard/projects/new')
                }}
              >
                <IconPlus className="mr-3 h-3.5 w-3.5 text-primary" />
                <span>New Project</span>
              </DropdownMenuItem>
              {currentProjectId && (
                <DropdownMenuItem 
                  className="cursor-pointer py-3 text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => {
                    setIsOpen(false)
                    router.push(`/dashboard/${currentProjectId}/settings`)
                  }}
                >
                  <IconSettings className="mr-3 h-3.5 w-3.5 text-secondary" />
                  <span>Project Settings</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
