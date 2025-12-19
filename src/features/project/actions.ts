'use server'

import { db } from "@/lib/db"
import { project } from "@/backend/db/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { updateProjectSchema } from "@/backend/validators/project.validators"

// Helper to get session - could be moved to a shared auth util
async function getSessionUser() {
  const supabase = await createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function updateProjectNameAction(projectId: string, newName: string) {
  try {
    const user = await getSessionUser()

    // 1. Validation (Security Gate)
    const validation = updateProjectSchema.safeParse({ name: newName })

    if (!validation.success) {
      // Return structured validation errors
      return { 
        success: false, 
        error: "Invalid project name",
        validationErrors: validation.error.flatten().fieldErrors 
      }
    }
    
    // 2. Database Update (Service Logic)
    // Note: Ideally, this DB call should be in a Service function (e.g., project.service.ts)
    // and this Action should just call that Service.
    await db.update(project)
      .set({ 
        name: validation.data.name, 
        updatedAt: new Date() 
      })
      .where(eq(project.id, projectId))

    // 3. Cache Invalidation
    revalidateTag(`dashboard-${user.id}`, 'page')
    revalidateTag('project', 'page') 
    
    return { success: true }
  } catch (error) {
    console.error("Failed to update project", error)
    return { success: false, error: "Failed to update project" }
  }
}
