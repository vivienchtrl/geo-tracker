"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GeoData {
  name: string | null;
  code?: string | null;
  count: number;
}

interface GeoDistributionProps {
  data: GeoData[];
  title?: string;
  description?: string;
}

export function GeoDistribution({ 
  data, 
  title = "Geographic Distribution", 
  description = "Traffic sources by country" 
}: GeoDistributionProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card variant="bento" className="h-full border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{title}</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {data.map((item, index) => (
          <div key={item.code || item.name || index} className="flex items-center space-x-4 group/row">
            <div className="flex items-center justify-center w-8 h-8 border border-dashed border-border/60 bg-background text-[10px] font-mono font-bold text-muted-foreground group-hover/row:border-primary/50 transition-colors uppercase">
              {item.code || "??"}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-foreground/80">{item.name || "Unknown"}</span>
                <span className="text-muted-foreground font-mono">{item.count.toLocaleString()}</span>
              </div>
              <Progress value={total > 0 ? (item.count / total) * 100 : 0} className="h-1 bg-muted/20" />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 py-10 text-center">
            No data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
