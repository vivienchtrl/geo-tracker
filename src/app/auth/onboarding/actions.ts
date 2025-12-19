'use server'

import { db } from "@/lib/db";
import { users, project } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const projectName = formData.get('projectName') as string
    const projectUrl = formData.get('projectUrl') as string

    if (!firstName || !lastName || !projectName || !projectUrl) {
      throw new Error('All fields are required')
    }

    // Update user with name
    await db.update(users)
      .set({
        firstName,
        lastName
      })
      .where(eq(users.id, user.id))

    // Create first project
    await db.insert(project).values({
      ownerId: user.id,
      name: projectName,
      url: projectUrl
    })

    // Redirect to dashboard
    redirect('/dashboard')

  } catch (error) {
    console.error('Onboarding error:', error)
    throw new Error('Failed to complete onboarding')
  }
}

export async function checkOnboardingStatus() {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { needsOnboarding: false, error: 'Unauthorized' }
    }

    // Check if user has completed onboarding (has firstName and at least one project)
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
