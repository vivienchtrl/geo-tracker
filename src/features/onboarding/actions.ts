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
import { completeOnboardingSchema, type CompleteOnboardingInput, userStepSchema, projectStepSchema, keywordsStepSchema, locationStepSchema } from "./validators"
import type { UserStepData, ProjectStepData, KeywordsStepData, LocationStepData } from "./types"

interface OnboardingResult {
  success: boolean
  error?: string
  projectId?: string
}

/**
 * Step 1: Create user profile and project
 */
export async function createInitialProject(
  userData: UserStepData,
  projectData: ProjectStepData
): Promise<OnboardingResult> {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate inputs
    const userValidation = userStepSchema.safeParse(userData)
    const projectValidation = projectStepSchema.safeParse(projectData)

    if (!userValidation.success || !projectValidation.success) {
      return { success: false, error: 'Invalid data' }
    }

    const result = await db.transaction(async (tx) => {
      // 1. Update user profile
      await tx.update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      // 2. Create project
      const [newProject] = await tx.insert(project).values({
        ownerId: user.id,
        name: projectData.projectName,
        url: projectData.projectUrl,
      }).returning()

      if (!newProject) {
        throw new Error('Failed to create project')
      }

      return { projectId: newProject.id }
    })

    revalidateTag('projects', 'max')
    revalidateTag(`user-${user.id}`, 'max')

    return { success: true, projectId: result.projectId }
  } catch (error) {
    console.error('Initial onboarding error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initialize project' 
    }
  }
}

/**
 * Step 2: Add keywords
 */
export async function updateOnboardingKeywords(
  projectId: string,
  data: KeywordsStepData
): Promise<OnboardingResult> {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const validation = keywordsStepSchema.safeParse(data)
    if (!validation.success) return { success: false, error: 'Invalid keywords' }

    if (data.keywords.length > 0) {
      await db.insert(keywords).values(
        data.keywords.map(kw => ({
          projectId,
          term: kw.term,
          isActive: true,
        }))
      )
    }

    revalidateTag('keywords', 'max')
    return { success: true, projectId }
  } catch (error) {
    console.error('Update keywords error:', error)
    return { success: false, error: 'Failed to update keywords' }
  }
}

/**
 * Step 3: Add location (ICP)
 */
export async function updateOnboardingLocation(
  projectId: string,
  data: LocationStepData | null
): Promise<OnboardingResult> {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    if (data) {
      const validation = locationStepSchema.safeParse(data)
      if (!validation.success) return { success: false, error: 'Invalid location data' }

      await db.insert(icpProfiles).values({
        projectId,
        name: 'Default Profile',
        description: 'Created during onboarding',
        country: data.country,
        region: data.region || null,
        city: data.city || null,
        language: data.language,
      })
    }

    revalidateTag('icp-profiles', 'max')
    return { success: true, projectId }
  } catch (error) {
    console.error('Update location error:', error)
    return { success: false, error: 'Failed to update location' }
  }
}

/**
 * Complete the onboarding process (Legacy wrapper or combined if needed)
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
    revalidateTag('projects', 'max')
    revalidateTag(`user-${user.id}`, 'max')
    revalidateTag('keywords', 'max')
    revalidateTag('icp-profiles', 'max')

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

