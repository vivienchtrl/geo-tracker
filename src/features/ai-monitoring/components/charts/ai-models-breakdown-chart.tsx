"use client";

/**
 * AI Models Breakdown Chart
 *
 * Displays:
 * - Distribution of LLM models
 * - Mention rate per model
 * - Total scans per model
 *
 * Features:
 * - Pie/Donut chart visualization
 * - Click to filter (optional)
 * - Responsive layout
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ModelData {
  name: string;
  total: number;
  mentioned: number;
  mentionRate: number;
}

interface AIModelsBreakdownChartProps {
  data: ModelData[];
  isLoading?: boolean;
  onModelSelect?: (modelName: string) => void;
}

const COLORS = [
  "var(--primary)",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

export function AIModelsBreakdownChart({
  data,
  isLoading = false,
  onModelSelect,
}: AIModelsBreakdownChartProps) {
  const [viewMode, setViewMode] = useState<"pie" | "bar">("bar");

  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Models Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-4">
          <div className="h-[300px] bg-muted/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Models Distribution
          </CardTitle>
          <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
            LLM model analysis
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("bar")}
            className="h-7 px-2 text-[9px]"
          >
            Bar
          </Button>
          <Button
            variant={viewMode === "pie" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("pie")}
            className="h-7 px-2 text-[9px]"
          >
            Pie
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-8 py-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "pie" ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, total }) => `${name}: ${total}`}
                  onClick={(entry) => {
                    if (onModelSelect) {
                      onModelSelect(entry.name);
                    }
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "total") return `${value} scans`;
                    return value;
                  }}
                />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "4px",
                    fontSize: "11px",
                  }}
                  cursor={{ fill: "var(--primary)", opacity: 0.1 }}
                />
                <Bar
                  dataKey="total"
                  fill="var(--primary)"
                  name="Total Scans"
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => {
                    if (onModelSelect) {
                      onModelSelect(data.name);
                    }
                  }}
                  cursor="pointer"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Model Statistics Table */}
        <div className="mt-6 border-t border-dashed border-border/80 pt-4">
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-bold mb-3">
            Model Statistics
          </div>
          <div className="space-y-2">
            {data.map((model) => (
              <div
                key={model.name}
                className="flex items-center justify-between text-[11px] p-2 rounded hover:bg-muted/20 cursor-pointer transition-colors"
                onClick={() => onModelSelect?.(model.name)}
              >
                <span className="font-medium">{model.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{model.total} scans</span>
                  <span className="text-primary font-semibold">
                    {model.mentionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

