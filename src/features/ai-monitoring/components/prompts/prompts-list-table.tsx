"use client";

/**
 * Prompts List Table
 *
 * Displays a table of AI search queries/prompts with:
 * - Query text (truncated)
 * - Model used
 * - Mention status
 * - Rank position
 * - Date
 *
 * Features:
 * - Clickable rows to view detail
 * - "Load More" pagination
 * - Search filtering
 * - Responsive design
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Check, X, ChevronRight, Loader2 } from "lucide-react";

export interface PromptItem {
  id: string;
  query: string;
  model: string;
  rank: number | null;
  mentioned: boolean | null;
  date: Date | null;
}

interface PromptsListTableProps {
  projectId: string;
  prompts: PromptItem[];
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function PromptsListTable({
  projectId,
  prompts,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  isLoadingMore = false,
}: PromptsListTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter prompts by search term
  const filteredPrompts = useMemo(() => {
    if (!searchTerm) return prompts;
    const lower = searchTerm.toLowerCase();
    return prompts.filter(
      (p) =>
        p.query.toLowerCase().includes(lower) ||
        p.model.toLowerCase().includes(lower)
    );
  }, [prompts, searchTerm]);

  const handleRowClick = (queryId: string) => {
    // Navigate to the dynamic detail page
    router.push(`/dashboard/${projectId}/ai-monitoring/${queryId}`);
  };

  const truncateQuery = (query: string, maxLength = 80) => {
    if (query.length <= maxLength) return query;
    return query.slice(0, maxLength) + "...";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <PromptsListSkeleton />;
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          AI Search Queries
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {filteredPrompts.length} {filteredPrompts.length === 1 ? "query" : "queries"}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9 text-[11px]"
        />
      </div>

      {/* Table */}
      <div className="border border-dashed rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dashed bg-muted/30">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Query
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-24">
                Model
              </th>
              <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-24">
                Status
              </th>
              <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-20">
                Rank
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28">
                Date
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPrompts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                  {searchTerm ? "No queries match your search" : "No queries found"}
                </td>
              </tr>
            ) : (
              filteredPrompts.map((prompt) => (
                <tr
                  key={prompt.id}
                  onClick={() => handleRowClick(prompt.id)}
                  className="border-b border-dashed last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-[12px] leading-relaxed">
                      {truncateQuery(prompt.query)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {prompt.model}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {prompt.mentioned ? (
                      <Badge variant="default" className="text-[10px] gap-1">
                        <Check className="h-3 w-3" />
                        Mentioned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                        <X className="h-3 w-3" />
                        Not mentioned
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[12px] font-medium">
                      {prompt.rank ? `#${prompt.rank}` : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(prompt.date)}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-[11px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function PromptsListSkeleton() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-9 w-full mb-4" />
      <div className="border border-dashed rounded-lg overflow-hidden">
        <div className="border-b border-dashed bg-muted/30 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-dashed last:border-b-0 px-4 py-4">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
