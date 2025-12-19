"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Share2, FileText, Target } from "lucide-react";

interface OverviewMetricsProps {
  data: {
    totalScans: number;
    mentionCount: number;
    visibilityRate: number;
    averageRank: number;
    sentimentScore: number;
  };
}

export function OverviewMetrics({ data }: OverviewMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visibility Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.visibilityRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.mentionCount} mentions in {data.totalScans} scans
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rank</CardTitle>
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">#{data.averageRank}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg. position when mentioned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalScans}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total AI queries analyzed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
