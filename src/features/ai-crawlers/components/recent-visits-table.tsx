"use client";

/**
 * Recent Visits Table
 *
 * Displays crawler visits with:
 * - Bot name
 * - Path
 * - Status code
 * - Response time
 * - Country
 * - Timestamp
 * - Load more pagination
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Bot, Globe, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { CrawlerVisit } from "@/types/db";

interface RecentVisitsTableProps {
  visits: CrawlerVisit[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

const BOT_CATEGORY_COLORS: Record<string, string> = {
  ai_crawler: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  search_engine: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  social_crawler: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  monitoring: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function RecentVisitsTable({
  visits,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: RecentVisitsTableProps) {
  if (visits.length === 0) {
    return (
      <div className="px-8 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center border border-dashed border-muted-foreground/40 bg-muted/20">
            <Bot className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold uppercase tracking-tight">
              No Crawler Visits Yet
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground max-w-sm">
              Set up your integration to start tracking LLM bots crawling your
              website
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Recent Visits
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
          {visits.length} visits
        </span>
      </div>

      <div className="border border-dashed border-border/80">
        <Table>
          <TableHeader>
            <TableRow className="border-dashed hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Bot
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Path
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Response
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Location
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-right">
                Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow
                key={visit.id}
                className="border-dashed hover:bg-muted/5"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-tight">
                        {visit.botName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[8px] uppercase tracking-widest mt-1 w-fit ${
                          BOT_CATEGORY_COLORS[visit.botCategory] || ""
                        }`}
                      >
                        {visit.botCategory.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted/50 px-2 py-1 border border-dashed border-border/60">
                    {visit.path.length > 40
                      ? `${visit.path.slice(0, 40)}...`
                      : visit.path}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {visit.responseStatus && visit.responseStatus < 400 ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-mono ${
                        visit.responseStatus && visit.responseStatus < 400
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {visit.responseStatus || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {visit.responseTime ? `${visit.responseTime}ms` : "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    {visit.source || "-"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(visit.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="uppercase text-[10px] font-bold tracking-widest px-8 h-10 border-dashed"
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
