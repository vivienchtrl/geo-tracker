'use server'

import { db } from "@/backend/db/db"
import { keywords } from "@/backend/db/tables/keywords"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { createKeywordSchema, UpdateKeywordInput } from "@/backend/validators/keywords.validators"

async function getSessionUser() {
  const supabase = await createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

// Reuse helper to get project ID (or fetch from user relation)
// Ideally this should be passed or retrieved via service context
import { getProjectByUserId } from "@/backend/services/project-service"

export async function createKeywordAction(term: string, tags: string[] = []) {
  try {
    const user = await getSessionUser()
    const project = await getProjectByUserId(user.id)
    
    if (!project) throw new Error("No project found")

    const validation = createKeywordSchema.safeParse({ term, tags })
    if (!validation.success) return { error: "Invalid data" }

    await db.insert(keywords).values({
      projectId: project.id,
      ...validation.data
    })

    revalidateTag('keywords', 'page')
    return { success: true }
  } catch {
    return { error: "Failed to create keyword" }
  }
}

export async function updateKeywordAction(id: string, data: UpdateKeywordInput) {
    try {
        const user = await getSessionUser()
        const project = await getProjectByUserId(user.id)
        if (!project) throw new Error("No project found")
        
        await db.update(keywords).set(data).where(eq(keywords.id, id))
        revalidateTag('keywords', 'page')
        return { success: true }
    } catch {
        return { error: "Failed update" }
    }
}

export async function deleteKeywordAction(id: string) {
    try {
        await db.delete(keywords).where(eq(keywords.id, id))
        revalidateTag('keywords', 'page')
        return { success: true }
    } catch {
        return { error: "Failed delete" }
    }
}

