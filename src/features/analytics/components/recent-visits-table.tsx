"use client";

/**
 * Recent Visits Table Component
 *
 * Displays recent human visitor page views with pagination
 */

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Monitor, Smartphone, Tablet, Globe } from "lucide-react";
import type { PageVisit } from "@/types/db";

interface RecentVisitsTableProps {
  visits: PageVisit[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export function RecentVisitsTable({
  visits,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: RecentVisitsTableProps) {
  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      case "desktop":
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Recent Visits
        </h3>
        <Badge variant="secondary" className="text-xs">
          {visits.length} visits
        </Badge>
      </div>

      <div className="rounded-md border border-dashed">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Device</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Globe className="h-8 w-8" />
                    <p className="text-sm">No visits recorded yet</p>
                    <p className="text-xs">
                      Visits will appear here once your tracking is set up
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getDeviceIcon(visit.deviceType)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {visit.path}
                      </span>
                      {visit.title && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {visit.title}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                      {visit.referrerDomain || "Direct"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {visit.countryCode && (
                        <span className="text-sm">
                          {getFlagEmoji(visit.countryCode)}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {visit.city || visit.country || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(visit.timestamp)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
