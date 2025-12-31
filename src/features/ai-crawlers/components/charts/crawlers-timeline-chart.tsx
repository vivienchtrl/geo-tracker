
"use client";

/**
 * Crawlers Timeline Chart
 *
 * Displays:
 * - Stacked bar chart with each bot as a separate stack
 * - Multi-select filter to choose which bots to display
 */

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/utils";

const DATE_RANGES = [
  { value: "7", label: "7d" },
  { value: "15", label: "15d" },
  { value: "30", label: "30d" },
];

interface BotDailyData {
  date: string;
  [botName: string]: string | number;
}

interface CrawlersTimelineChartProps {
  data: BotDailyData[];
  bots: string[];
  isLoading?: boolean;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

export function CrawlersTimelineChart({
  data,
  bots,
  isLoading = false,
}: CrawlersTimelineChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDays = searchParams.get("days") || "7";

  const [selectedBots, setSelectedBots] = useState<string[]>(bots.slice(0, 5));
  const [isOpen, setIsOpen] = useState(false);

  const updateDays = (days: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", days);
    router.push(`?${params.toString()}`);
  };

  const toggleBot = (bot: string) => {
    setSelectedBots((prev) =>
      prev.includes(bot) ? prev.filter((b) => b !== bot) : [...prev, bot]
    );
  };

  const selectAll = () => setSelectedBots([...bots]);
  const clearAll = () => setSelectedBots([]);

  // Filter data to only include selected bots
  const filteredData = useMemo(() => {
    return data.map((day) => {
      const filtered: BotDailyData = { date: day.date };
      selectedBots.forEach((bot) => {
        if (day[bot] !== undefined) {
          filtered[bot] = day[bot];
        }
      });
      return filtered;
    });
  }, [data, selectedBots]);

  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Crawler Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-4">
          <div className="h-[350px] bg-muted/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Crawler Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              No data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
              Crawler Activity
            </CardTitle>
            <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
              Daily crawler visits by bot
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Tabs */}
            <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
              {DATE_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => updateDays(range.value)}
                  className={cn(
                    "h-7 px-2.5 text-[10px] uppercase tracking-widest rounded-sm",
                    currentDays === range.value
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range.label}
                </Button>
              ))}
            </div>

            {/* Bot Multi-Select */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger
                render={(props) => (
                  <Button
                    {...props}
                    variant="outline"
                    size="sm"
                    className="h-7 border-dashed text-[10px] gap-1 uppercase tracking-wider"
                  >
                    <span className="text-muted-foreground">Bots:</span>
                    <span className="font-medium">
                      {selectedBots.length === 0
                        ? "None"
                        : selectedBots.length === bots.length
                          ? "All"
                          : `${selectedBots.length}`}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                )}
              />
              <PopoverContent className="w-56 p-0" align="end">
                <div className="p-2 border-b border-border/50">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={selectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={clearAll}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                  {bots.map((bot, index) => (
                    <label
                      key={bot}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedBots.includes(bot) && "bg-muted/30"
                      )}
                    >
                      <Checkbox
                        checked={selectedBots.includes(bot)}
                        onCheckedChange={() => toggleBot(bot)}
                      />
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-xs truncate flex-1">{bot}</span>
                      {selectedBots.includes(bot) && (
                        <Check className="h-3 w-3 text-primary shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 py-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              barCategoryGap="20%"
              maxBarSize={32}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
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
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  paddingTop: "10px",
                }}
              />
              {selectedBots.map((bot, index) => (
                <Bar
                  key={bot}
                  dataKey={bot}
                  stackId="bots"
                  fill={CHART_COLORS[bots.indexOf(bot) % CHART_COLORS.length]}
                  name={bot}
                  radius={
                    index === selectedBots.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
