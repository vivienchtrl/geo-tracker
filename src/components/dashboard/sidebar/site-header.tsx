"use client"

import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) items-center justify-end px-6 border-b border-dashed border-border/80">
      <ThemeToggle />
    </header>
  )
}
