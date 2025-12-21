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
    <Card variant="bento" className="h-full border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Mentions by Model</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Visibility performance across AI models</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[350px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="var(--muted-foreground)"
                fontSize={10}
                className="uppercase tracking-widest"
              />
              <Tooltip 
                 cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                 contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase' }}
              />
              <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              <Bar name="Mentioned" dataKey="mentioned" stackId="a" fill="var(--primary)" radius={[0, 0, 0, 0]} />
              <Bar name="Not Mentioned" dataKey={(entry) => entry.total - entry.mentioned} stackId="a" fill="var(--secondary)" fillOpacity={0.2} radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
           ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground border border-dashed border-border/40">
              No model data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
