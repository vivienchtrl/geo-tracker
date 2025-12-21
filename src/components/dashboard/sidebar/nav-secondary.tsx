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
                  <span className="flex items-center gap-3 w-full p-2 text-[10px] uppercase font-bold tracking-widest opacity-40 cursor-not-allowed text-sidebar-foreground">
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </span>
                ) : (
                  <Link 
                    href={item.url}
                    className={`
                      flex items-center gap-3 w-full p-2 border border-transparent transition-all
                      hover:border-dashed hover:border-border/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                      text-[10px] uppercase font-bold tracking-widest
                      ${isActive ? 'border-dashed border-primary/40 bg-primary/5 text-primary' : 'text-sidebar-foreground/70'}
                    `}
                  >
                    <item.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
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
