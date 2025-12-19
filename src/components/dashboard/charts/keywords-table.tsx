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
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Keyword Performance</CardTitle>
        <CardDescription>Visibility and competition by keyword</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-right">Visibility</TableHead>
              <TableHead className="text-right">Avg. Rank</TableHead>
              <TableHead>Top Competitors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((keyword) => (
              <TableRow key={keyword.id}>
                <TableCell className="font-medium">{keyword.term}</TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <span>{keyword.visibilityRate}%</span>
                        {/* Simple visual indicator */}
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500" 
                                style={{ width: `${keyword.visibilityRate}%` }}
                            />
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    {keyword.avgRank > 0 ? `#${keyword.avgRank}` : '-'}
                </TableCell>
                <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {keyword.competitors.length > 0 ? (
                            keyword.competitors.slice(0, 3).map((comp, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs font-normal">
                                    {comp.domain}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                        )}
                        {keyword.competitors.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{keyword.competitors.length - 3}</Badge>
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



