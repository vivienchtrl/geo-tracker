"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReferrerData {
  referrer: string | null;
  count: number;
}

interface ReferrerBreakdownProps {
  data: ReferrerData[];
  title?: string;
  description?: string;
}

export function ReferrerBreakdown({ 
  data,
  title = "Top Referrers",
  description = "Traffic acquisition by domain"
}: ReferrerBreakdownProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card variant="bento" className="h-full border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{title}</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {data.map((item, index) => (
          <div key={item.referrer || index} className="flex flex-col space-y-2 group/row">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
              <span className="text-foreground/80 truncate max-w-[200px]">{item.referrer || "Direct / Unknown"}</span>
              <span className="text-muted-foreground font-mono">{item.count.toLocaleString()}</span>
            </div>
            <Progress value={total > 0 ? (item.count / total) * 100 : 0} className="h-1 bg-muted/20" />
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 py-10 text-center">
            No referral data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

