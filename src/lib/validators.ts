import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { project, keywords, icpProfiles, aiSearch } from '@/backend/db/schema';
import { z } from 'zod';

export const insertProjectSchema = createInsertSchema(project).omit({ id: true, ownerId: true, createdAt: true }).extend({
    url: z.string().url(),
    name: z.string().min(1),
});
export const selectProjectSchema = createSelectSchema(project);

export const insertKeywordSchema = createInsertSchema(keywords).omit({ id: true, createdAt: true }).extend({
    term: z.string().min(1),
    projectId: z.string().uuid(),
});
export const selectKeywordSchema = createSelectSchema(keywords);

export const insertIcpProfileSchema = createInsertSchema(icpProfiles).omit({ id: true, ownerId: true, createdAt: true });
export const selectIcpProfileSchema = createSelectSchema(icpProfiles);

export const insertAiSearchSchema = createInsertSchema(aiSearch).omit({ id: true, projectId: true, keywordId: true, createdAt: true });
export const selectAiSearchSchema = createSelectSchema(aiSearch);
