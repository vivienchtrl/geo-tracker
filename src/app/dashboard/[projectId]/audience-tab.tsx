"use client";

import { DeviceBreakdown } from "@/features/analytics/components/device-breakdown";
import { GeoDistribution } from "@/features/analytics/components/geo-distribution";
import { ReferrerBreakdown } from "@/features/analytics/components/referrer-breakdown";
import { DashboardMetrics } from "../actions";

interface AudienceTabProps {
  data: DashboardMetrics;
}

export function AudienceTab({ data }: AudienceTabProps) {
  return (
    <div className="flex flex-col gap-0 min-h-full">
      <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
        <div className="lg:col-span-4 border-r border-dashed border-border/80">
          <DeviceBreakdown data={data.deviceBreakdown || []} />
        </div>
        <div className="lg:col-span-8">
          <ReferrerBreakdown data={data.referrerBreakdown || []} />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
        <div className="lg:col-span-6 border-r border-dashed border-border/80">
          <GeoDistribution 
            data={data.locationBreakdown || []} 
            title="Top Countries"
            description="Visitors by geographical location (Tracker)"
          />
        </div>
        <div className="lg:col-span-6">
          <GeoDistribution 
            data={data.locationBreakdown || []} 
            title="Top Cities"
            description="Visitors by city (Tracker)"
          />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
        <div className="lg:col-span-12">
          <ReferrerBreakdown 
            data={data.referrerBreakdown?.filter((r) => r.referrer?.includes('social')) || []} 
            title="Social Channels"
            description="Traffic from social media networks"
          />
        </div>
      </div>
    </div>
  );
}

