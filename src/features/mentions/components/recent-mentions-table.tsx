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
import { cn } from "@/utils/utils";

interface RecentMentionsTableProps {
  data: SearchDetail[]; // Using the full detail type now
}

export function RecentMentionsTable({ data }: RecentMentionsTableProps) {
  return (
    <Card variant="bento" className="h-full border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Recent AI Mentions & Analysis</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Detailed breakdown of latest AI results</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {data.length > 0 ? (
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-dashed border-border/40">
                  <TableHead className="w-[200px] pl-0 text-[9px] uppercase tracking-widest h-10">Query</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest h-10">Engine</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest h-10">Status</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest h-10">Sentiment</TableHead>
                  <TableHead className="text-right pr-0 text-[9px] uppercase tracking-widest h-10">Timestamp</TableHead>
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
           <div className="flex h-32 items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground border border-dashed border-border/40">
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
                className="cursor-pointer hover:bg-primary/5 transition-colors border-dashed border-border/40 group/row"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell className="font-bold pl-0 py-4 text-xs uppercase tracking-tight flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    {mention.query}
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="border-dashed border-border/60 text-[8px] h-4 uppercase font-bold tracking-tighter bg-background/50">{mention.engine}</Badge>
                </TableCell>
                <TableCell>
                    {mention.isMentioned ? (
                        <div className="flex items-center text-primary/80">
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">Mentioned</span>
                        </div>
                    ) : (
                            <div className="flex items-center text-muted-foreground/60">
                            <XCircle className="w-3 h-3 mr-1.5" />
                            <span className="text-[9px] uppercase tracking-tighter">Not cited</span>
                        </div>
                    )}
                </TableCell>
                <TableCell>
                    <Badge
                    className={cn(
                        "text-[8px] h-4 px-2 uppercase font-black border-transparent tracking-widest",
                        mention.sentimentLabel === "positive"
                        ? "bg-primary/20 text-primary"
                        : mention.sentimentLabel === "negative"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-muted text-muted-foreground"
                    )}
                    >
                    {mention.sentimentLabel}
                    </Badge>
                </TableCell>
                <TableCell className="text-right text-[10px] font-mono text-muted-foreground/60 pr-0 uppercase">
                    {mention.createdAt}
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/5 border-dashed border-border/40">
                    <TableCell colSpan={5} className="p-0">
                        <div className="p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-primary" />
                                        AI Engine Response
                                    </h4>
                                    <div className="text-sm text-foreground/80 leading-relaxed max-h-80 overflow-y-auto p-6 bg-background/40 border border-dashed border-border/60 whitespace-pre-wrap font-medium">
                                        {mention.response}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] text-secondary flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-secondary" />
                                        Citations & References
                                    </h4>
                                    {mention.urlsFound && mention.urlsFound.length > 0 ? (
                                        <div className="space-y-3 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                                            {mention.urlsFound.map((url, idx) => (
                                                <div key={idx} className="flex items-start text-sm bg-background/40 p-5 border border-dashed border-border/60 group hover:border-primary/50 transition-all duration-300">
                                                    <span className="font-mono text-muted-foreground/40 mr-4 text-[10px] w-6 pt-1 tracking-tighter">[{url.rank}]</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-xs uppercase tracking-tight text-foreground/90 truncate mb-1" title={url.title}>{url.title || "Untitled Reference"}</div>
                                                        <a href={url.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-primary/60 hover:text-primary hover:underline flex items-center truncate transition-colors">
                                                            {url.link} <ExternalLink className="w-2.5 h-2.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center p-12 border border-dashed border-border/40 bg-background/20">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground italic">
                                                No citations extracted for this query.
                                            </p>
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
