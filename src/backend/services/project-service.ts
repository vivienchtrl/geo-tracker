import { db } from "@/lib/db"
import { project } from "@/backend/db/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"
import { unstable_cache } from "next/cache"

export const getProjectByUserId = cache(async (userId: string) => {
  return await unstable_cache(
    async () => {
      const result = await db.query.project.findFirst({
        where: eq(project.ownerId, userId)
      })
      return result || null
    },
    [`project-${userId}`],
    {
      revalidate: 3600, // 1 hour
      tags: [`project-${userId}`]
    }
  )()
})

