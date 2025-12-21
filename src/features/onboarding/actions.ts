'use server'

import { db } from "@/backend/db/db"
import { users } from "@/backend/db/tables/user"
import { project } from "@/backend/db/tables/project"
import { keywords } from "@/backend/db/tables/keywords"
import { icpProfiles } from "@/backend/db/tables/icp-profile"
import { eq } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidateTag } from "next/cache"
import { completeOnboardingSchema, type CompleteOnboardingInput } from "./validators"

interface OnboardingResult {
  success: boolean
  error?: string
  projectId?: string
}

/**
 * Complete the onboarding process
 * Creates user profile, project, keywords, and optional ICP profile
 */
export async function completeOnboarding(
  data: CompleteOnboardingInput
): Promise<OnboardingResult> {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validation = completeOnboardingSchema.safeParse(data)
    if (!validation.success) {
      return { 
        success: false, 
        error: validation.error.message || 'Invalid data' 
      }
    }

    const validData = validation.data

    // Transaction: Create user, project, keywords, and optionally ICP profile
    const result = await db.transaction(async (tx) => {
      // 1. Update user profile
      await tx.update(users)
        .set({
          firstName: validData.user.firstName,
          lastName: validData.user.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      // 2. Create project
      const [newProject] = await tx.insert(project).values({
        ownerId: user.id,
        name: validData.project.projectName,
        url: validData.project.projectUrl,
      }).returning()

      if (!newProject) {
        throw new Error('Failed to create project')
      }

      // 3. Create keywords
      if (validData.keywords.keywords.length > 0) {
        await tx.insert(keywords).values(
          validData.keywords.keywords.map(kw => ({
            projectId: newProject.id,
            term: kw.term,
            isActive: true,
          }))
        )
      }

      // 4. Create ICP profile if location data provided
      if (validData.location) {
        await tx.insert(icpProfiles).values({
          projectId: newProject.id,
          name: 'Default Profile',
          description: 'Created during onboarding',
          country: validData.location.country,
          region: validData.location.region,
          city: validData.location.city,
          language: validData.location.language,
        })
      }

      return { projectId: newProject.id }
    })

    // Revalidate caches
    revalidateTag('projects', 'page')
    revalidateTag(`user-${user.id}`, 'page')
    revalidateTag('keywords', 'page')
    revalidateTag('icp-profiles', 'page'    )

    return { success: true, projectId: result.projectId }

  } catch (error) {
    console.error('Onboarding error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
    }
  }
}

/**
 * Check if user needs onboarding
 */
export async function checkOnboardingStatus() {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { needsOnboarding: false, error: 'Unauthorized' }
    }

    // Check if user has completed onboarding
    const userData = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { firstName: true, lastName: true }
    })

    const userProjects = await db.query.project.findMany({
      where: eq(project.ownerId, user.id),
      limit: 1
    })

    const needsOnboarding = !userData?.firstName || userProjects.length === 0

    return { needsOnboarding }

  } catch (error) {
    console.error('Check onboarding status error:', error)
    return { needsOnboarding: false, error: 'Failed to check status' }
  }
}

/**
 * Redirect to dashboard after onboarding
 */
export async function redirectToDashboard(projectId: string) {
  redirect(`/dashboard/${projectId}`)
}

