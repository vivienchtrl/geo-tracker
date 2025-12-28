"use client";

/**
 * AI Monitoring Filters
 *
 * Provides filter controls for:
 * - Date Range
 * - Keywords
 * - Models (multi-select)
 * - Competitors
 *
 * Features:
 * - Searchable dropdowns
 * - Multi-select for models
 * - Instant updates via context
 * - Responsive layout
 */

import { useState, useCallback } from "react";
import { useAIMonitoring } from "../hooks/use-ai-monitoring";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Check } from "lucide-react";
import type { DateRange } from "@/types/dashboard";

interface AIMonitoringFiltersProps {
  keywords?: Array<{ id: string; term: string }>;
  models?: string[];
  competitors?: string[];
}

export function AIMonitoringFilters({
  keywords = [],
  models = [],
  competitors = [],
}: AIMonitoringFiltersProps) {
  const { filters, updateFilters } = useAIMonitoring();
  const [modelsOpen, setModelsOpen] = useState(false);

  // Get selected models from filters
  const selectedModels = filters.llmModels || [];

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "all", label: "All time" },
  ];

  const handleDateRangeChange = useCallback(
    (dateRange: string | null) => {
      updateFilters({ dateRange: (dateRange || "30d") as DateRange });
    },
    [updateFilters]
  );

  const handleKeywordChange = useCallback(
    (keywordId: string | null) => {
      updateFilters({
        keyword: !keywordId || keywordId === "all" ? undefined : keywordId,
      });
    },
    [updateFilters]
  );

  const handleModelToggle = useCallback(
    (model: string) => {
      const current = filters.llmModels || [];
      const updated = current.includes(model)
        ? current.filter((m) => m !== model)
        : [...current, model];

      updateFilters({
        llmModels: updated.length > 0 ? updated : undefined,
      });
    },
    [updateFilters, filters.llmModels]
  );

  const handleSelectAllModels = useCallback(() => {
    updateFilters({
      llmModels: models.length > 0 ? [...models] : undefined,
    });
  }, [updateFilters, models]);

  const handleClearModels = useCallback(() => {
    updateFilters({
      llmModels: undefined,
    });
  }, [updateFilters]);

  const handleCompetitorChange = useCallback(
    (competitor: string | null) => {
      updateFilters({
        competitor: !competitor || competitor === "all" ? undefined : competitor,
      });
    },
    [updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    updateFilters({
      keyword: undefined,
      llmModels: undefined,
      competitor: undefined,
    });
  }, [updateFilters]);

  const activeFiltersCount = [
    filters.keyword,
    filters.llmModels && filters.llmModels.length > 0,
    filters.competitor,
  ].filter(Boolean).length;

  // Format the models button text
  const getModelsButtonText = () => {
    if (selectedModels.length === 0) return "All Models";
    if (selectedModels.length === 1) return selectedModels[0];
    if (selectedModels.length === models.length) return "All Models";
    return `${selectedModels.length} Models`;
  };

  return (
    <div className="px-8 py-6 border-b border-dashed border-border/80 bg-muted/3">
      <div className="flex flex-col gap-4">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2 text-[10px]"
            >
              <X className="h-3 w-3 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Filter controls */}
        <div className="grid gap-3 md:grid-cols-4">
          {/* Date Range */}
          <div>
            <Select
              value={filters.dateRange || "30d"}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger className="h-9 text-[11px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent className="text-[11px]">
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div>
              <Select
                value={filters.keyword || "all"}
                onValueChange={handleKeywordChange}
              >
                <SelectTrigger className="h-9 text-[11px]">
                  <SelectValue placeholder="All Keywords" />
                </SelectTrigger>
                <SelectContent className="text-[11px]">
                  <SelectItem value="all">All Keywords</SelectItem>
                  {keywords.map((kw) => (
                    <SelectItem key={kw.id} value={kw.id}>
                      {kw.term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Models - Multi-select */}
          {models.length > 0 && (
            <div>
              <Popover open={modelsOpen} onOpenChange={setModelsOpen}>
                <PopoverTrigger>
                  <button
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-[11px] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                  >
                    <span className={selectedModels.length === 0 ? "text-muted-foreground" : ""}>
                      {getModelsButtonText()}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Select Models
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAllModels}
                          className="h-5 px-2 text-[10px]"
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearModels}
                          className="h-5 px-2 text-[10px]"
                        >
                          None
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 max-h-48 overflow-y-auto">
                    {models.map((model) => (
                      <label
                        key={model}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedModels.includes(model)}
                          onCheckedChange={() => handleModelToggle(model)}
                        />
                        <span className="text-[11px] flex-1">{model}</span>
                        {selectedModels.includes(model) && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Competitors */}
          {competitors.length > 0 && (
            <div>
              <Select
                value={filters.competitor || "all"}
                onValueChange={handleCompetitorChange}
              >
                <SelectTrigger className="h-9 text-[11px]">
                  <SelectValue placeholder="All Competitors" />
                </SelectTrigger>
                <SelectContent className="text-[11px]">
                  <SelectItem value="all">All Competitors</SelectItem>
                  {competitors.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
