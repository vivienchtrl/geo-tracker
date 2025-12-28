"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, FileText, Target } from "lucide-react";

interface OverviewMetricsProps {
  data: {
    totalScans: number;
    mentionCount: number;
    visibilityRate: number;
    averageRank: number;
  };
}

export function OverviewMetrics({ data }: OverviewMetricsProps) {
  return (
    <div className="grid gap-0 border-b border-dashed border-border/80 sm:grid-cols-2 lg:grid-cols-3">
      <Card variant="bento" className="border-0 border-r border-dashed border-border/80 last:border-r-0 px-8 py-8 h-full bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Visibility Rate</CardTitle>
          <Target className="h-3.5 w-3.5 text-primary/60" />
        </CardHeader>
        <CardContent className="px-0">
          <div className="text-4xl font-bold tracking-tighter text-foreground">{data.visibilityRate}%</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
              {data.mentionCount} Mentions Detected
            </p>
          </div>
        </CardContent>
      </Card>

      <Card variant="bento" className="border-0 border-r border-dashed border-border/80 last:border-r-0 px-8 py-8 h-full bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Average Rank</CardTitle>
          <Share2 className="h-3.5 w-3.5 text-secondary/60" />
        </CardHeader>
        <CardContent className="px-0">
          <div className="text-4xl font-bold tracking-tighter text-foreground">#{data.averageRank}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 w-1 rounded-full bg-secondary" />
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
              Mean AI Position
            </p>
          </div>
        </CardContent>
      </Card>

      <Card variant="bento" className="border-0 border-r border-dashed border-border/80 last:border-r-0 px-8 py-8 h-full bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Total Scans</CardTitle>
          <FileText className="h-3.5 w-3.5 text-accent/60" />
        </CardHeader>
        <CardContent className="px-0">
          <div className="text-4xl font-bold tracking-tighter text-foreground">{data.totalScans}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 w-1 rounded-full bg-accent" />
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
              Active Monitoring
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
