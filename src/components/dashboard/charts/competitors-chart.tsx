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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Most frequently cited domains alongside your brand</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
             <BarChart
               data={data}
               layout="vertical"
               margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
             >
               <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
               <XAxis type="number" hide />
               <YAxis 
                 dataKey="domain" 
                 type="category" 
                 width={100} 
                 tick={{ fontSize: 12 }}
                 tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
               />
               <Tooltip 
                 cursor={{ fill: 'transparent' }}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
               />
               <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
                ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No competitor data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
