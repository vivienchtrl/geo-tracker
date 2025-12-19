"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrafficSource } from "@/types/db"
import { DashboardMetrics } from "@/app/dashboard/actions"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { CompetitorsChart } from "../charts/competitors-chart"
import { RecentMentionsTable } from "../charts/recent-mentions-table"

interface AITrafficTabProps {
  aiTraffic: TrafficSource[]
  aiMetrics: DashboardMetrics
}

export function AITrafficTab({ aiTraffic, aiMetrics }: AITrafficTabProps) {
  // Aggregate traffic by source (ignoring date for the summary chart, or by date if time series)
  // Let's do a time-series or total bar chart. A simple Bar chart of Total Visits by Source seems appropriate for "Traffic Sources".
  
  const trafficBySource = aiTraffic.reduce((acc, curr) => {
    const existing = acc.find((item: { source: any }) => item.source === curr.source)
    if (existing) {
      existing.visits += (curr.visits || 0)
    } else {
      acc.push({ source: curr.source, visits: curr.visits || 0 })
    }
    return acc
  }, [] as { source: string; visits: number }[])
  .sort((a: { visits: number }, b: { visits: number }) => b.visits - a.visits)

  return (
    <div className="space-y-4">
      {/* AI Traffic Sources Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>AI Traffic Sources</CardTitle>
                <CardDescription>Visits coming from LLM & AI Engines</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trafficBySource}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                                dataKey="source" 
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Source
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {payload[0].payload.source}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Visits
                                                    </span>
                                                    <span className="font-bold">
                                                        {payload[0].value}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="visits" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* Competitors Mentioned by AI (Reusing existing component as requested "Competitors mentioned by the AI") */}
        <CompetitorsChart data={aiMetrics.competitors} title="Competitors Mentioned by AI" />
      </div>

       {/* Mentions Table */}
       <div className="grid gap-4 md:grid-cols-1">
            <h3 className="text-xl font-semibold tracking-tight">Recent AI Mentions</h3>
            <RecentMentionsTable data={aiMetrics.searchDetails} />
       </div>
    </div>
  )
}
