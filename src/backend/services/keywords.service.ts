import { db } from "@/lib/db"
import { keywords, icpProfiles } from "@/backend/db/schema"
import { eq, desc } from "drizzle-orm"
import { unstable_cache } from "next/cache"

export const getKeywordsByProject = unstable_cache(
  async (projectId: string) => {
    return await db.query.keywords.findMany({
      where: eq(keywords.projectId, projectId),
      orderBy: desc(keywords.createdAt)
    })
  },
  ['project-keywords'],
  { tags: ['keywords'] }
)

export const getIcpProfilesByProject = unstable_cache(
    async (projectId: string) => {
        return await db.query.icpProfiles.findMany({
            where: eq(icpProfiles.projectId, projectId),
            orderBy: desc(icpProfiles.createdAt)
        })
    },
    ['project-icp'],
    { tags: ['icp-profiles'] }
)
