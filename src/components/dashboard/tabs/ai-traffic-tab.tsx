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
    <div className="flex flex-col gap-0 min-h-full">
      <div className="grid gap-0 md:grid-cols-2 border-b border-dashed border-border/80">
        <Card variant="bento" className="border-0 border-r border-dashed border-border/80 bg-transparent px-8 py-8 h-full">
            <CardHeader className="px-0 pb-6">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">AI Traffic Sources</CardTitle>
                <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Visits coming from LLM & AI Engines</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trafficBySource}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis 
                                dataKey="source" 
                                stroke="var(--muted-foreground)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                className="uppercase tracking-widest"
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip 
                                cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase' }}
                            />
                            <Bar dataKey="visits" fill="var(--primary)" radius={[0, 0, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <div className="h-full">
          <CompetitorsChart data={aiMetrics.competitors} title="Competitors Mentioned by AI" />
        </div>
      </div>

       <div className="border-b border-dashed border-border/80">
            <RecentMentionsTable data={aiMetrics.searchDetails} />
       </div>
    </div>
  )
}
