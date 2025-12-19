"use client"

import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="flex justify-end p-4">
      <ThemeToggle />
    </header>
  )
}