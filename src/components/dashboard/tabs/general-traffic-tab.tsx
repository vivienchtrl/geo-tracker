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
  
    // Format data for GA4 chart
    const analyticsChartData = analyticsHistory.map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        sessions: item.sessions || 0,
        users: item.totalUsers || 0
    }));

  return (
    <div className="space-y-4">
      
      {/* GA4 Section */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle>Web Traffic (GA4)</CardTitle>
                <CardDescription>Sessions & Users over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <XAxis 
                                dataKey="date" 
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
                            />
                             <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Date
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {payload[0].payload.date}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-text-primary">
                                                        Sessions
                                                    </span>
                                                    <span className="font-bold text-primary">
                                                        {payload[0].value}
                                                    </span>
                                                </div>
                                                 <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-text-primary">
                                                        Users
                                                    </span>
                                                    <span className="font-bold text-blue-500">
                                                        {payload[1].value}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    }
                                    return null
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="sessions" 
                                stroke="var(--primary)" 
                                fill="var(--primary)" 
                                fillOpacity={0.2} 
                                strokeWidth={2}
                            />
                             <Area 
                                type="monotone" 
                                dataKey="users" 
                                stroke="#3b82f6" 
                                fill="#3b82f6" 
                                fillOpacity={0.2} 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* GSC Section */}
      <div className="grid gap-4 md:grid-cols-1">
         <SeoPerformanceChart data={gscHistory} />
      </div>
    
    </div>
  )
}
