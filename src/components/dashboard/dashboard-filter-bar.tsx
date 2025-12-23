'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X, Loader2 } from 'lucide-react'
import { cn } from '@/utils/utils'

export function DashboardFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = React.useTransition()

  // State derived from URL
  const dateRangeParam = searchParams.get('dateRange') || '30d'
  const deviceParam = searchParams.get('device') || 'all'
  const llmModelParam = searchParams.get('llmModel') || 'all'

  // Helper to update params
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Wrap navigation in transition for "SPA-like" feel
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // Helper to clear all filters
  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  const hasActiveFilters = searchParams.toString().length > 0 && searchParams.get('dateRange') !== '30d';

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10 transition-opacity duration-200">
      <div className={cn("flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar", isPending && "opacity-50 pointer-events-none")}>
        {isPending ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
        ) : (
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        
        {/* Date Range Filter */}
        <Select 
          value={dateRangeParam} 
          onValueChange={(val) => updateParam('dateRange', val)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* AI Model Filter */}
        <Select 
          value={llmModelParam} 
          onValueChange={(val) => updateParam('llmModel', val)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
            <SelectValue placeholder="AI Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="gpt">GPT / OpenAI</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
            <SelectItem value="perplexity">Perplexity</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="bing">Bing</SelectItem>
          </SelectContent>
        </Select>

        {/* Device Filter */}
        <Select 
          value={deviceParam} 
          onValueChange={(val) => updateParam('device', val)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs font-medium">
            <SelectValue placeholder="Device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
            <SelectItem value="bot">Bots</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          disabled={isPending}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}

