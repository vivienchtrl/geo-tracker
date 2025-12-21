"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.isActive ?? pathname === item.url
            
            return (
              <SidebarMenuItem key={item.title}>
                <Link 
                  href={item.url}
                  className={`
                    flex items-center gap-3 w-full p-2 border border-transparent transition-all
                    hover:border-dashed hover:border-border/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                    text-[10px] uppercase font-bold tracking-widest
                    ${isActive ? 'border-dashed border-primary/40 bg-primary/5 text-primary' : 'text-sidebar-foreground/70'}
                  `}
                >
                  {item.icon && <item.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : ''}`} />}
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
