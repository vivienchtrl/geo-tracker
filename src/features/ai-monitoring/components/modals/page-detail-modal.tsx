
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  mentioned: boolean;
}

interface PageDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageMetrics: PageMetrics | null;
  mentioningQueries: Query[];
  isLoading?: boolean;
}

export function PageDetailModal({
  open,
  onOpenChange,
  pageMetrics,
  mentioningQueries,
  isLoading,
}: PageDetailModalProps) {
  if (!pageMetrics) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{pageMetrics.title}</DialogTitle>
          <DialogDescription>{pageMetrics.path}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-dashed rounded p-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Total Bot Visits
              </p>
              <p className="text-2xl font-bold mt-1">{pageMetrics.totalBotVisits}</p>
            </div>

            <div className="border border-dashed rounded p-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Avg Load Time
              </p>
              <p className="text-2xl font-bold mt-1">{pageMetrics.avgLoadTime}ms</p>
              <p className="text-xs text-muted-foreground mt-1">
                min: {pageMetrics.minLoadTime}ms | max: {pageMetrics.maxLoadTime}ms
              </p>
            </div>

            <div className="border border-dashed rounded p-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                LLM Visibility
              </p>
              <p className="text-2xl font-bold mt-1">
                {Math.round(pageMetrics.visibilityInLLM)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {pageMetrics.llmMentions} mentions
              </p>
            </div>
          </div>

          {/* Bot Breakdown */}
          <div className="border border-dashed rounded p-4">
            <h3 className="font-semibold uppercase tracking-wider text-sm mb-3">
              Bot Breakdown
            </h3>
            <div className="space-y-2">
              {pageMetrics.botBreakdown.map((bot) => (
                <div key={bot.type} className="flex items-center justify-between">
                  <span className="text-sm">{bot.type}</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-muted rounded h-2">
                      <div
                        className="bg-primary rounded h-2"
                        style={{
                          width: `${(bot.count / pageMetrics.totalBotVisits) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{bot.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Models */}
          {pageMetrics.topModels.length > 0 && (
            <div className="border border-dashed rounded p-4">
              <h3 className="font-semibold uppercase tracking-wider text-sm mb-3">
                Top Models
              </h3>
              <div className="flex flex-wrap gap-2">
                {pageMetrics.topModels.map((model) => (
                  <Badge key={model} variant="secondary">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Queries Table */}
          <div className="border border-dashed rounded overflow-hidden">
            <div className="p-4 border-b border-dashed">
              <h3 className="font-semibold uppercase tracking-wider text-sm">
                LLM Queries Mentioning This Page
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-dashed hover:bg-transparent">
                  <TableHead className="text-xs">Query</TableHead>
                  <TableHead className="text-xs">Model</TableHead>
                  <TableHead className="text-xs text-right">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentioningQueries.slice(0, 5).map((q) => (
                  <TableRow key={q.id} className="border-dashed">
                    <TableCell className="text-xs font-mono truncate max-w-xs">
                      {q.query}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline">{q.model}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {q.rank ? `#${q.rank}` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {mentioningQueries.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No queries found mentioning this page
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

