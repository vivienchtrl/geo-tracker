"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsMetric, SearchConsoleMetric } from "@/types/db"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { SeoPerformanceChart } from "@/features/analytics/components/seo-performance-chart"

interface GeneralTrafficTabProps {
  analyticsHistory: AnalyticsMetric[]
  gscHistory: SearchConsoleMetric[]
}

export function GeneralTrafficTab({ analyticsHistory, gscHistory }: GeneralTrafficTabProps) {
    const analyticsChartData = analyticsHistory.map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        sessions: item.sessions || 0,
        users: item.totalUsers || 0
    }));

  return (
    <div className="flex flex-col gap-0 min-h-full">
      <div className="grid gap-0 md:grid-cols-1 border-b border-dashed border-border/80">
        <Card variant="bento" className="border-0 bg-transparent px-8 py-8">
            <CardHeader className="px-0 pb-6">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Web Traffic (GA4)</CardTitle>
                <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Sessions & Users over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis 
                                dataKey="date" 
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
                            />
                             <Tooltip
                                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="sessions" 
                                stroke="var(--primary)" 
                                fill="var(--primary)" 
                                fillOpacity={0.05} 
                                strokeWidth={2}
                            />
                             <Area 
                                type="monotone" 
                                dataKey="users" 
                                stroke="var(--secondary)" 
                                fill="var(--secondary)" 
                                fillOpacity={0.05} 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="border-b border-dashed border-border/80">
         <SeoPerformanceChart data={gscHistory} />
      </div>
    </div>
  )
}
