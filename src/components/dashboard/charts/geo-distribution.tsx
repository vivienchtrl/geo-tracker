"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { geoData } from "../mock-data";

export function GeoDistribution() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <CardDescription>Traffic sources by country</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {geoData.map((item) => (
          <div key={item.code} className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {item.code}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.country}</span>
                <span className="text-muted-foreground">{item.visitors.toLocaleString()}</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
