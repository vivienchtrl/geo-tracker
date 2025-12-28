"use client";

/**
 * AI Crawlers Activity Monitoring
 *
 * Displays:
 * - Bot/Crawler activity timeline
 * - Pages visited by bots
 * - Frequency analysis
 * - Type breakdown (GPT, Claude, Google, etc.)
 *
 * Features:
 * - Timeline view + table view
 * - Click to filter by bot type
 * - Responsive layout
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import type { PageVisit } from "@/types/db";

interface BotActivityData {
  type: string;
  names: string[];
  totalVisits: number;
  pagesVisited: number;
  topPages: string[];
}

interface BotTimelineData {
  date: string;
  total: number;
}

interface AICrawlersActivityProps {
  botMetrics: BotActivityData[];
  botTimeline: BotTimelineData[];
  botVisits: PageVisit[];
  isLoading?: boolean;
}

const BOT_COLORS: Record<string, string> = {
  gpt: "#8B5CF6",
  claude: "#3B82F6",
  google: "#F59E0B",
  bing: "#06B6D4",
  other: "#6B7280",
};

export function AICrawlersActivity({
  botMetrics,
  botTimeline,
  botVisits,
  isLoading = false,
}: AICrawlersActivityProps) {
  const [selectedBotType, setSelectedBotType] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Crawlers Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-4">
          <div className="space-y-4">
            <div className="h-[250px] bg-muted/20 rounded animate-pulse" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredVisits = selectedBotType
    ? botVisits.filter((v) => v.isBot === selectedBotType)
    : botVisits;

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Crawlers Activity
        </CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
          Bot and web crawler monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 py-6 space-y-6">
        {/* Timeline Chart */}
        <div className="border-b border-dashed border-border/80 pb-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-4">
            Activity Timeline
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={botTimeline}>
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
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                  name="Total Visits"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bot Type Breakdown */}
        <div className="border-b border-dashed border-border/80 pb-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-3">
            Bot Breakdown
          </h4>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {botMetrics.map((bot) => (
              <button
                key={bot.type}
                onClick={() =>
                  setSelectedBotType(
                    selectedBotType === bot.type ? null : bot.type
                  )
                }
                className={`p-4 rounded border transition-all text-left ${
                  selectedBotType === bot.type
                    ? "border-primary bg-primary/5"
                    : "border-dashed border-border/80 bg-transparent hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wide">
                    {bot.type.toUpperCase()}
                  </h5>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        BOT_COLORS[bot.type] || BOT_COLORS.other,
                    }}
                  />
                </div>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div>Visits: <span className="font-semibold text-foreground">{bot.totalVisits}</span></div>
                  <div>Pages: <span className="font-semibold text-foreground">{bot.pagesVisited}</span></div>
                  {bot.names.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/40 text-[9px]">
                      <div className="font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                        Agents
                      </div>
                      {bot.names.slice(0, 2).map((name, idx) => (
                        <div key={idx}>{name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Visits Table */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-3">
            Recent Bot Visits
            {selectedBotType && (
              <span className="ml-2 text-primary text-[9px]">
                (Filtered: {selectedBotType.toUpperCase()})
              </span>
            )}
          </h4>
          <div className="overflow-x-auto border border-dashed border-border/80 rounded">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-dashed border-border/80 hover:bg-transparent">
                  <TableHead className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Bot
                  </TableHead>
                  <TableHead className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Page
                  </TableHead>
                  <TableHead className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.slice(0, 10).map((visit, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-dashed border-border/80 hover:bg-muted/30"
                  >
                    <TableCell className="px-4 py-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              BOT_COLORS[visit.isBot || ""] ||
                              BOT_COLORS.other,
                          }}
                        />
                        <span className="font-medium">{visit.botName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-[11px] text-muted-foreground font-mono">
                      {visit.path}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-[10px] text-muted-foreground">
                      {visit.createdAt
                        ? new Date(visit.createdAt).toLocaleTimeString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


