'use server'

import { db } from "@/lib/db"
import { icpProfiles } from "@/backend/db/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { createIcpProfileSchema, UpdateIcpProfileInput } from "@/backend/validators/icp-profiles.validators"
import { getProjectByUserId } from "@/backend/services/project-service"

async function getSessionUser() {
  const supabase = await createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function createIcpProfileAction(data: unknown) {
  try {
    const user = await getSessionUser()
    const project = await getProjectByUserId(user.id)
    
    if (!project) throw new Error("No project found")

    const validation = createIcpProfileSchema.safeParse(data)
    if (!validation.success) return { error: "Invalid data", details: validation.error.flatten() }

    await db.insert(icpProfiles).values({
      projectId: project.id,
      ...validation.data
    })

    revalidateTag('icp-profiles', 'page')
    return { success: true }
  } catch (error) {
    return { error: "Failed to create ICP profile" }
  }
}

export async function updateIcpProfileAction(id: string, data: UpdateIcpProfileInput) {
    try {
        await getSessionUser()
        await db.update(icpProfiles).set(data).where(eq(icpProfiles.id, id))
        revalidateTag('icp-profiles', 'page')
        return { success: true }
    } catch {
        return { error: "Failed update" }
    }
}

export async function deleteIcpProfileAction(id: string) {
    try {
        await getSessionUser()
        await db.delete(icpProfiles).where(eq(icpProfiles.id, id))
        revalidateTag('icp-profiles', 'page')
        return { success: true }
    } catch {
        return { error: "Failed delete" }
    }
}



