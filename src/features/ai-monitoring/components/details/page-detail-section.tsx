'use client';

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import { getQueryDetailData } from "@/features/ai-monitoring/actions";

interface PageDetailSectionProps {
  projectId: string;
  pagePath: string;
  onClose: () => void;
}

interface PageMetrics {
  path: string;
  title: string;
  totalBotVisits: number;
  avgLoadTime: number;
  maxLoadTime: number;
  minLoadTime: number;
  botBreakdown: { type: string; count: number }[];
  llmMentions: number;
  visibilityInLLM: number;
  topModels: string[];
}

interface Query {
  id: string;
  query: string;
  model: string;
  rank: number | null;
  mentioned: boolean | null;
}

export function PageDetailSection({
  projectId,
  pagePath,
  onClose,
}: PageDetailSectionProps) {
  const [pageMetrics, setPageMetrics] = useState<PageMetrics | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = getQueryDetailData(projectId, pagePath);
    console.log(data);
  }, [projectId, pagePath]);

  return (
    <div className="border-t border-dashed pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          Page Detail: {pagePath}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Close
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading page details...</div>
      ) : pageMetrics ? (
        <PageDetailContent pageMetrics={pageMetrics} queries={queries} />
      ) : (
        <div className="text-muted-foreground">No data found for this page</div>
      )}
    </div>
  );
}

function PageDetailContent({
  pageMetrics,
  queries,
}: {
  pageMetrics: PageMetrics;
  queries: Query[];
}) {

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider">Bot Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pageMetrics.totalBotVisits}</div>
            <p className="text-xs text-muted-foreground mt-1">AI crawler visits</p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider">Avg Load Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pageMetrics.avgLoadTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              min: {pageMetrics.minLoadTime}ms | max: {pageMetrics.maxLoadTime}ms
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider">LLM Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(pageMetrics.visibilityInLLM)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{pageMetrics.llmMentions} mentions</p>
          </CardContent>
        </Card>
      </div>

      {/* Bot Breakdown */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider">Bot Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pageMetrics.botBreakdown.map(({ type, count }: { type: string; count: number }) => (
            <div key={type}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{type}</span>
                <span className="text-sm text-muted-foreground">{count}</span>
              </div>
              <Progress
                value={(count / pageMetrics.totalBotVisits) * 100}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Models */}
      {pageMetrics.topModels.length > 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">Top Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pageMetrics.topModels.map((model) => (
                <Badge key={model} variant="secondary">
                  {model}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queries Table */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider">
            Queries Mentioning This Page
          </CardTitle>
          <CardDescription>{queries.length} queries found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-dashed hover:bg-transparent">
                  <TableHead className="text-xs">Query</TableHead>
                  <TableHead className="text-xs">Model</TableHead>
                  <TableHead className="text-xs text-right">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.slice(0, 5).map(({ id, query, model, rank }: Query) => (
                  <TableRow key={id} className="border-dashed hover:bg-muted/50">
                    <TableCell className="text-xs font-mono truncate max-w-xs">
                      {query}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline">{model}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {rank ? `#${rank}` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {queries.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No queries found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

