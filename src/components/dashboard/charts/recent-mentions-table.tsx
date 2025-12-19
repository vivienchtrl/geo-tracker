"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchDetail } from "@/app/dashboard/actions";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface RecentMentionsTableProps {
  data: SearchDetail[]; // Using the full detail type now
}

export function RecentMentionsTable({ data }: RecentMentionsTableProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent AI Mentions & Analysis</CardTitle>
        <CardDescription>Detailed breakdown of latest AI search results</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Query</TableHead>
                  <TableHead>Engine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {data.slice(0, 10).map((mention) => (
                    <ExpandableRow key={mention.id} mention={mention} />
                  ))}
              </TableBody>
            </Table>
          </div>
        ) : (
           <div className="flex h-32 items-center justify-center text-muted-foreground">
              No recent mentions found
            </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExpandableRow({ mention }: { mention: SearchDetail }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <TableRow 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell className="font-medium flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    {mention.query}
                </TableCell>
                <TableCell>
                    <Badge variant="outline">{mention.engine}</Badge>
                </TableCell>
                <TableCell>
                    {mention.isMentioned ? (
                        <div className="flex items-center text-emerald-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">Mentioned</span>
                        </div>
                    ) : (
                            <div className="flex items-center text-muted-foreground">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs">Not found</span>
                        </div>
                    )}
                </TableCell>
                <TableCell>
                    <Badge
                    className={
                        mention.sentimentLabel === "positive"
                        ? "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white"
                        : mention.sentimentLabel === "negative"
                        ? "bg-red-500 hover:bg-red-600 border-transparent text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent"
                    }
                    >
                    {mention.sentimentLabel}
                    </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                    {mention.createdAt}
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={5} className="p-0">
                        <div className="p-4 space-y-4 border-b">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">AI Response</h4>
                                    <div className="text-sm text-foreground/90 max-h-60 overflow-y-auto p-3 bg-background rounded-md border shadow-sm whitespace-pre-wrap">
                                        {mention.response}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Competitors / References Found</h4>
                                    {mention.urlsFound && mention.urlsFound.length > 0 ? (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {mention.urlsFound.map((url, idx) => (
                                                <div key={idx} className="flex items-start text-sm bg-background p-3 rounded-md border shadow-sm group hover:border-primary/50 transition-colors">
                                                    <span className="font-mono text-muted-foreground mr-3 text-xs w-5 pt-0.5">#{url.rank}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate text-foreground" title={url.title}>{url.title || "No Title"}</div>
                                                        <a href={url.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center truncate mt-0.5">
                                                            {url.link} <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic bg-background p-3 rounded-md border border-dashed text-center py-8">
                                            No references cited in this response.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
