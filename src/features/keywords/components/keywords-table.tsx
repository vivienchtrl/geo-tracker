"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeywordData } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";

interface KeywordsTableProps {
  data: KeywordData[];
}

export function KeywordsTable({ data }: KeywordsTableProps) {
  return (
    <Card variant="bento" className="h-full border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Keyword Performance</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Visibility and competition analysis</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-dashed border-border/40">
              <TableHead className="pl-0 text-[9px] uppercase tracking-widest h-10">Keyword</TableHead>
              <TableHead className="text-right text-[9px] uppercase tracking-widest h-10">Visibility</TableHead>
              <TableHead className="text-right text-[9px] uppercase tracking-widest h-10">Avg. Rank</TableHead>
              <TableHead className="pr-0 text-[9px] uppercase tracking-widest h-10 text-right">Competition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((keyword) => (
              <TableRow key={keyword.id} className="border-dashed border-border/40 hover:bg-primary/5 group/row">
                <TableCell className="font-bold pl-0 py-4 text-xs uppercase tracking-tight">{keyword.term}</TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                        <span className="text-[10px] font-mono">{keyword.visibilityRate}%</span>
                        <div className="w-16 h-1 bg-muted/30 overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-500" 
                                style={{ width: `${keyword.visibilityRate}%` }}
                            />
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                    {keyword.avgRank > 0 ? `#${keyword.avgRank}` : '—'}
                </TableCell>
                <TableCell className="pr-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {keyword.competitors.length > 0 ? (
                            keyword.competitors.slice(0, 2).map((comp, idx) => (
                                <Badge key={idx} variant="outline" className="text-[8px] h-4 px-1.5 font-bold border-dashed border-border/60 uppercase tracking-tighter bg-background/50">
                                    {comp.domain}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                        {keyword.competitors.length > 2 && (
                            <Badge variant="outline" className="text-[8px] h-4 border-dashed border-border/60 bg-primary/5 text-primary">+{keyword.competitors.length - 2}</Badge>
                        )}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}



