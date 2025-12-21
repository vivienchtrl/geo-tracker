"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
    isActive?: boolean
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.isActive ?? pathname === item.url
            const isDisabled = item.url === '#'
            
            return (
              <SidebarMenuItem key={item.title}>
                {isDisabled ? (
                  <span className="flex items-center gap-2 w-full p-2 rounded-md text-sm opacity-50 cursor-not-allowed text-sidebar-foreground">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </span>
                ) : (
                  <Link 
                    href={item.url}
                    className={`
                      flex items-center gap-2 w-full p-2 rounded-md text-sm
                      hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                      transition-colors
                      ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground'}
                    `}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
