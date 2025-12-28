"use client";

/**
 * AI Keywords Table
 *
 * Displays:
 * - All keywords with AI mention metrics
 * - Sortable columns
 * - Top competitors per keyword
 * - Drill-down selection
 *
 * Features:
 * - Click to select keyword
 * - Show top 3 competitors
 * - Visibility rate indicators
 * - Responsive table
 */

import { useState } from "react";
import { useAIMonitoring } from "../hooks/use-ai-monitoring";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Keyword } from "@/types/db";

interface KeywordMetric {
  id: string;
  term: string;
  totalScans: number;
  mentions: number;
  visibilityRate: number;
  avgRank: number;
  competitors: Array<{
    domain: string;
    count: number;
    avgRank: number;
  }>;
}

interface AIKeywordsTableProps {
  keywords: KeywordMetric[];
  isLoading?: boolean;
}

type SortKey = "term" | "totalScans" | "mentions" | "visibilityRate" | "avgRank";

export function AIKeywordsTable({
  keywords,
  isLoading = false,
}: AIKeywordsTableProps) {
  const { selectKeyword, selectedKeyword } = useAIMonitoring();
  const [sortKey, setSortKey] = useState<SortKey>("visibilityRate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    const aVal: number = a[sortKey] as number;
    const bVal: number = b[sortKey] as number;

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const SortIcon = ({ active, order }: { active: boolean; order: "asc" | "desc" }) => {
    if (!active) return <div className="w-4 h-4" />;
    return order === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Keywords Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-4">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Keywords Analysis
        </CardTitle>
        <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
          Click keyword to drill down
        </p>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-dashed border-border/80 hover:bg-transparent">
                <TableHead className="px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  <button
                    onClick={() => handleSort("term")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Keyword
                    {/* eslint-disable-next-line react-hooks/static-components */}
                    <SortIcon active={sortKey === "term"} order={sortOrder as "asc" | "desc"} />
                  </button>
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  <button
                    onClick={() => handleSort("totalScans")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Scans
                    {/* eslint-disable-next-line react-hooks/static-components */}
                    <SortIcon active={sortKey === "totalScans"} order={sortOrder as "asc" | "desc"} />
                  </button>
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  <button
                    onClick={() => handleSort("mentions")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Mentions
                    {/* eslint-disable-next-line react-hooks/static-components */}
                    <SortIcon active={sortKey === "mentions"} order={sortOrder as "asc" | "desc"} />
                  </button>
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  <button
                    onClick={() => handleSort("visibilityRate")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Visibility
                    {/* eslint-disable-next-line react-hooks/static-components */}
                    <SortIcon active={sortKey === "visibilityRate"} order={sortOrder as "asc" | "desc"} />
                  </button>
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  <button
                    onClick={() => handleSort("avgRank")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Avg Rank
                    {/* eslint-disable-next-line react-hooks/static-components */}
                    <SortIcon active={sortKey === "avgRank"} order={sortOrder as "asc" | "desc"} />
                  </button>
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Top Competitors
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedKeywords.map((keyword) => (
                <TableRow
                  key={keyword.id}
                  onClick={() => selectKeyword(keyword.id)}
                  className={`border-b border-dashed border-border/80 cursor-pointer transition-colors ${
                    selectedKeyword === keyword.id
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <TableCell className="px-8 py-3 font-medium text-[11px]">
                    {keyword.term}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[11px] text-muted-foreground">
                    {keyword.totalScans}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[11px]">
                    <span className="font-semibold text-primary">
                      {keyword.mentions}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {keyword.visibilityRate.toFixed(1)}%
                      </span>
                      <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60"
                          style={{
                            width: `${Math.min(keyword.visibilityRate, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[11px] text-muted-foreground">
                    {keyword.avgRank.toFixed(1)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[10px]">
                    <div className="space-y-1">
                      {keyword.competitors.slice(0, 3).map((comp, idx) => (
                        <div key={idx} className="text-muted-foreground">
                          {comp.domain} ({comp.count})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


