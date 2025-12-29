"use client";

/**
 * Analytics Filters Component
 *
 * Date range and dimension filters for the analytics dashboard
 */

import { useAnalytics } from "../hooks/use-analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "@/types/dashboard";

export function AnalyticsFilters() {
  const { filters, updateFilters } = useAnalytics();

  const handleDateRangeChange = (value: DateRange) => {
    updateFilters({ dateRange: value });
  };

  return (
    <div className="px-8 py-6 border-b border-dashed border-border/80">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Filters
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {/* Date Range */}
        <Select
          value={filters.dateRange || "30d"}
          onValueChange={(value) => handleDateRangeChange(value as DateRange)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        {/* Device Filter */}
        <Select
          value={filters.device ?? "all"}
          onValueChange={(value) =>
            updateFilters({ device: !value || value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All devices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All devices</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>

        {/* Country Filter */}
        <Select
          value={filters.country ?? "all"}
          onValueChange={(value) =>
            updateFilters({ country: !value || value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="GB">United Kingdom</SelectItem>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
          </SelectContent>
        </Select>

        {/* UTM Source Filter */}
        <Select
          value={filters.utmSource ?? "all"}
          onValueChange={(value) =>
            updateFilters({ utmSource: !value || value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
