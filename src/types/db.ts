import {
    aiSearch,
    icpProfiles,
    keywords,
    project,
    projectMembers,
    users,
    // API Keys & Crawler Visits
    apiKeys,
    crawlerVisits,
    // Human Traffic (Page Visits)
    pageVisits,
} from "@/backend/db/tables/schema";
import { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type Project = InferSelectModel<typeof project>;
export type ProjectMember = InferSelectModel<typeof projectMembers>;
export type Keyword = InferSelectModel<typeof keywords>;
export type IcpProfile = InferSelectModel<typeof icpProfiles>;
export type AiSearch = InferSelectModel<typeof aiSearch>;

// API Keys & Crawler Visits types
export type ApiKey = InferSelectModel<typeof apiKeys>;
export type CrawlerVisit = InferSelectModel<typeof crawlerVisits>;

// Human Traffic (Page Visits) types
export type PageVisit = InferSelectModel<typeof pageVisits>;

// Re-export role type for convenience
export type ProjectRole = 'owner' | 'editor' | 'viewer';
