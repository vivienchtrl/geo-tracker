import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot, Globe, ShieldCheck } from "lucide-react";

interface CrawlerLogsTableProps {
  data: {
    id: string;
    botName: string;
    path: string;
    createdAt: string;
    source: string;
  }[];
}

export function CrawlerLogsTable({ data }: CrawlerLogsTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/60 bg-muted/5">
        <Bot className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          No Crawler Activity Detected
        </p>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-1">
          Waiting for AI bots to visit your site
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-dashed border-border/80 bg-muted/5">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
          <Bot className="h-3 w-3" />
          Real-time AI Crawler Logs
        </h3>
      </div>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="border-dashed border-b border-border/60 hover:bg-transparent">
              <TableHead className="text-[9px] uppercase tracking-widest font-black py-4 px-6">Bot Name</TableHead>
              <TableHead className="text-[9px] uppercase tracking-widest font-black py-4 px-6">Path</TableHead>
              <TableHead className="text-[9px] uppercase tracking-widest font-black py-4 px-6">Method</TableHead>
              <TableHead className="text-[9px] uppercase tracking-widest font-black py-4 px-6 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => (
              <TableRow key={log.id} className="border-dashed border-b border-border/40 hover:bg-muted/5 group">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-none border border-dashed border-primary/30 bg-primary/5 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5 text-primary/70" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight">{log.botName}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <code className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 border border-border/40">
                    {log.path}
                  </code>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant="outline" className="rounded-none border-dashed text-[8px] font-bold uppercase tracking-widest h-5 px-2 bg-background">
                    {log.source === 'pixel-noscript' ? (
                      <span className="flex items-center gap-1.5 text-orange-500">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Pixel
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-500">
                        <Globe className="h-2.5 w-2.5" />
                        JS Script
                      </span>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <span className="text-[9px] font-medium text-muted-foreground tabular-nums">
                    {log.createdAt}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

