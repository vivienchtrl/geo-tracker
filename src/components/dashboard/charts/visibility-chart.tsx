"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VisibilityChartProps {
  data: {
    name: string;
    total: number;
    mentioned: number;
  }[];
}

export function VisibilityChart({ data }: VisibilityChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Mentions by Model</CardTitle>
        <CardDescription>Visibility performance across different AI models</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <Tooltip 
                 cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar name="Mentioned" dataKey="mentioned" stackId="a" fill="var(--chart-2)" radius={[0, 0, 4, 4]} />
              <Bar name="Not Mentioned" dataKey={(entry) => entry.total - entry.mentioned} stackId="a" fill="var(--muted)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
           ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No model data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
