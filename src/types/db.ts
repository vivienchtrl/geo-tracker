import {
    aiSearch,
    analyticsMetrics,
    icpProfiles,
    keywords,
    project,
    projectMembers,
    searchConsoleMetrics,
    trafficSources,
    users,
    // Tracker tables
    pageVisits,
    botDetectors,
    visitorDemographics,
    geographicActivity,
    // API Keys & Crawler Visits
    apiKeys,
    crawlerVisits,
} from "@/backend/db/tables/schema";
import { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type Project = InferSelectModel<typeof project>;
export type ProjectMember = InferSelectModel<typeof projectMembers>;
export type Keyword = InferSelectModel<typeof keywords>;
export type IcpProfile = InferSelectModel<typeof icpProfiles>;
export type AiSearch = InferSelectModel<typeof aiSearch>;
export type TrafficSource = InferSelectModel<typeof trafficSources>;
export type AnalyticsMetric = InferSelectModel<typeof analyticsMetrics>;
export type SearchConsoleMetric = InferSelectModel<typeof searchConsoleMetrics>;

// Tracker types
export type PageVisit = InferSelectModel<typeof pageVisits>;
export type BotDetector = InferSelectModel<typeof botDetectors>;
export type VisitorDemographic = InferSelectModel<typeof visitorDemographics>;
export type GeographicActivity = InferSelectModel<typeof geographicActivity>;

// API Keys & Crawler Visits types
export type ApiKey = InferSelectModel<typeof apiKeys>;
export type CrawlerVisit = InferSelectModel<typeof crawlerVisits>;

// Re-export role type for convenience
export type ProjectRole = 'owner' | 'editor' | 'viewer';
