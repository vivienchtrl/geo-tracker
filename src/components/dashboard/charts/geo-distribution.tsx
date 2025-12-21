"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { geoData } from "../mock-data";

export function GeoDistribution() {
  return (
    <Card variant="bento" className="h-full border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Geographic Distribution</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Traffic sources by country</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {geoData.map((item) => (
          <div key={item.code} className="flex items-center space-x-4 group/row">
            <div className="flex items-center justify-center w-8 h-8 border border-dashed border-border/60 bg-background text-[10px] font-mono font-bold text-muted-foreground group-hover/row:border-primary/50 transition-colors uppercase">
              {item.code}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-foreground/80">{item.country}</span>
                <span className="text-muted-foreground font-mono">{item.visitors.toLocaleString()}</span>
              </div>
              <Progress value={item.percentage} className="h-1 bg-muted/20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
