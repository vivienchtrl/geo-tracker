"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompetitorsChartProps {
  data: {
    domain: string;
    count: number;
    avgRank: number;
  }[];
  title?: string;
}

export function CompetitorsChart({ data, title = "Top Competitors" }: CompetitorsChartProps) {
  return (
    <Card variant="bento" className="h-full border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{title}</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Domains cited alongside brand</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[350px] w-full">
          {data.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
             <BarChart
               data={data}
               layout="vertical"
               margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
             >
               <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} stroke="var(--border)" />
               <XAxis type="number" hide />
               <YAxis 
                 dataKey="domain" 
                 type="category" 
                 width={100} 
                 tick={{ fontSize: 10, fill: 'var(--muted-foreground)', letterSpacing: '0.05em' }}
                 tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
                 axisLine={false}
                 tickLine={false}
               />
               <Tooltip 
                 cursor={{ fill: 'var(--secondary)', opacity: 0.1 }}
                 contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase' }}
               />
               <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} fillOpacity={0.8} />
                ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground border border-dashed border-border/40">
              No competitor data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
