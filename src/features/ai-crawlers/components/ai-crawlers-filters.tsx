"use client";

/**
 * AI Crawlers Filters
 *
 * Filter controls for:
 * - Date range
 * - Bot type/name
 * - Bot category
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils/utils";

interface AICrawlersFiltersProps {
  bots: string[];
}

const BOT_CATEGORIES = [
  { value: "ai_crawler", label: "AI Crawlers" },
  { value: "search_engine", label: "Search Engines" },
  { value: "social_crawler", label: "Social Crawlers" },
  { value: "monitoring", label: "Monitoring" },
  { value: "other", label: "Other" },
];

export function AICrawlersFilters({ bots }: AICrawlersFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current filter values from URL
  const currentBot = searchParams.get("botName") || "";
  const currentCategory = searchParams.get("botCategory") || "";
  const currentStartDate = searchParams.get("startDate");
  const currentEndDate = searchParams.get("endDate");

  const [startDate, setStartDate] = useState<Date | undefined>(
    currentStartDate ? new Date(currentStartDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentEndDate ? new Date(currentEndDate) : undefined
  );

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    startTransition(() => {
      router.push("?");
    });
  };

  const hasFilters = currentBot || currentCategory || startDate || endDate;

  return (
    <div className="px-8 py-6 border-b border-dashed border-border/80 bg-muted/5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Filters
        </span>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-[10px] uppercase tracking-widest"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {/* Date Range - Start */}
        <Popover>
          <PopoverTrigger>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-9 border-dashed text-xs uppercase tracking-tight",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "MMM d, yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                setStartDate(date);
                updateFilters({
                  startDate: date?.toISOString(),
                });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date Range - End */}
        <Popover>
          <PopoverTrigger>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-9 border-dashed text-xs uppercase tracking-tight",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "MMM d, yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                setEndDate(date);
                updateFilters({
                  endDate: date?.toISOString(),
                });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Bot Name Filter */}
        <Select
          value={currentBot}
          onValueChange={(value) =>
            updateFilters({ botName: value || undefined })
          }
        >
          <SelectTrigger className="h-9 border-dashed text-xs uppercase tracking-tight">
            <SelectValue placeholder="All Bots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Bots</SelectItem>
            {bots.map((bot) => (
              <SelectItem key={bot} value={bot}>
                {bot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bot Category Filter */}
        <Select
          value={currentCategory}
          onValueChange={(value) =>
            updateFilters({ botCategory: value || undefined })
          }
        >
          <SelectTrigger className="h-9 border-dashed text-xs uppercase tracking-tight">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {BOT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
