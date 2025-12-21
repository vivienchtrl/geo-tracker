import { db } from "@/backend/db/db"
import { project, projectMembers } from "@/backend/db/tables/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"
import { unstable_cache } from "next/cache"
import type { Project } from "@/types/db"

export type ProjectRole = 'owner' | 'editor' | 'viewer'

export type ProjectWithRole = {
  project: Project
  role: ProjectRole
}

/**
 * @deprecated Use getUserProjects instead
 */
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
      revalidate: 3600,
      tags: [`project-${userId}`]
    }
  )()
})

/**
 * Get all projects a user has access to (owned + member)
 */
export const getUserProjects = cache(async (userId: string): Promise<ProjectWithRole[]> => {
  return await unstable_cache(
    async () => {
      // 1. Owned projects
      const owned = await db.query.project.findMany({
        where: eq(project.ownerId, userId)
      })

      // 2. Member projects
      const memberRows = await db
        .select({ 
          project: project, 
          role: projectMembers.role 
        })
        .from(projectMembers)
        .innerJoin(project, eq(projectMembers.projectId, project.id))
        .where(eq(projectMembers.userId, userId))

      // 3. Combine and deduplicate
      const result: ProjectWithRole[] = []
      const seen = new Set<string>()

      for (const p of owned) {
        result.push({ project: p, role: 'owner' })
        seen.add(p.id)
      }

      for (const row of memberRows) {
        if (!seen.has(row.project.id)) {
          result.push({ 
            project: row.project, 
            role: row.role as ProjectRole 
          })
          seen.add(row.project.id)
        }
      }

      return result
    },
    [`user-projects-${userId}`],
    { revalidate: 3600, tags: ['projects', `user-${userId}`] }
  )()
})

/**
 * Get a specific project with the user's role
 * Returns null if user has no access
 */
export const getProjectWithRole = cache(async (
  projectId: string, 
  userId: string
): Promise<ProjectWithRole | null> => {
  return await unstable_cache(
    async () => {
      const projectData = await db.select({
        project: project
      })
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1)
      .then(rows => rows[0] ?? null)

      if (!projectData) return null

      // Check if owner
      if (projectData?.project.ownerId === userId) {
        return { project: projectData.project as Project, role: 'owner' as ProjectRole }
      }

      // Check membership
      const membership = await db.query.projectMembers.findFirst({
        where: (pm, { and, eq: eqFn }) => and(
          eqFn(pm.projectId, projectId),
          eqFn(pm.userId, userId)
        )
      })

      if (!membership) return null

      return { 
        project: projectData.project as Project, 
        role: membership.role as ProjectRole
      }
    },
    [`project-access-${projectId}-${userId}`],
    { revalidate: 3600, tags: ['projects', `project-${projectId}`] }
  )()
})

/**
 * Get project by ID (no role check)
 */
export const getProjectById = cache(async (projectId: string): Promise<Project | null> => {
  return await unstable_cache(
    async () => {
      const result = await db.query.project.findFirst({
        where: eq(project.id, projectId)
      })
      return result || null
    },
    [`project-${projectId}`],
    { revalidate: 3600, tags: [`project-${projectId}`] }
  )()
})

