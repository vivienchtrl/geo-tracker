"use client";

/**
 * AI Competitors Insights
 *
 * Displays:
 * - Top competitors mentioned in AI searches
 * - Mention frequency
 * - Average rank in results
 * - Models that mention them
 *
 * Features:
 * - Sorted by mentions
 * - Click to filter
 * - Responsive grid
 */

import { useState } from "react";
import { useAIMonitoring } from "../hooks/use-ai-monitoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import type { AICompetitorInsight } from "@/types/dashboard";

interface AICompetitorsInsightsProps {
  competitors: AICompetitorInsight[];
  isLoading?: boolean;
}

export function AICompetitorsInsights({
  competitors,
  isLoading = false,
}: AICompetitorsInsightsProps) {
  const { selectCompetitor, selectedCompetitor } = useAIMonitoring();
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Competitors Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Competitors Insights
        </CardTitle>
        <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
          Mentioned in AI search results
        </p>
      </CardHeader>
      <CardContent className="px-8 py-6">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {competitors.slice(0, 9).map((competitor) => (
            <button
              key={competitor.domain}
              onClick={() => {
                selectCompetitor(competitor.domain);
                setExpandedCompetitor(
                  expandedCompetitor === competitor.domain
                    ? null
                    : competitor.domain
                );
              }}
              className={`p-4 rounded border transition-all text-left ${
                selectedCompetitor === competitor.domain
                  ? "border-primary bg-primary/5"
                  : "border-dashed border-border/80 bg-transparent hover:border-border"
              }`}
            >
              {/* Domain Header */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wide flex-1 break-words">
                  {competitor.domain}
                </h4>
                <div className="text-[10px] font-bold text-primary ml-2">
                  {competitor.mentions}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Avg Rank:</span>
                  <span className="font-semibold">
                    {competitor.avgRank.toFixed(1)}
                  </span>
                </div>

                {/* Models Found */}
                {competitor.modelsFound.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                      Found In
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {competitor.modelsFound.slice(0, 3).map((model, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-[8px] px-1.5 py-0.5 rounded"
                        >
                          {model.split(" ")[0]}
                        </Badge>
                      ))}
                      {competitor.modelsFound.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-[8px] px-1.5 py-0.5 rounded"
                        >
                          +{competitor.modelsFound.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Trend Indicator */}
                <div className="mt-2 pt-2 border-t border-border/40">
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60"
                      style={{
                        width: `${Math.min(
                          (competitor.mentions / competitors[0]?.mentions) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {competitors.length > 9 && (
          <div className="mt-6 pt-6 border-t border-dashed border-border/80">
            <p className="text-[10px] text-muted-foreground text-center">
              +{competitors.length - 9} more competitors
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


