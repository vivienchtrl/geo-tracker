import {
    aiSearch,
    analyticsMetrics,
    icpProfiles,
    keywords,
    project,
    searchConsoleMetrics,
    trafficSources,
    users,
} from "@/backend/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type Project = InferSelectModel<typeof project>;
export type Keyword = InferSelectModel<typeof keywords>;
export type IcpProfile = InferSelectModel<typeof icpProfiles>;
export type AiSearch = InferSelectModel<typeof aiSearch>;
export type TrafficSource = InferSelectModel<typeof trafficSources>;
export type AnalyticsMetric = InferSelectModel<typeof analyticsMetrics>;
export type SearchConsoleMetric = InferSelectModel<typeof searchConsoleMetrics>;
