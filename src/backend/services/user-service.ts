import { db } from "@/backend/db/db"
import { users } from "@/backend/db/tables/user"
import { eq } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { cache } from "react"

export const getCurrentUser = cache(async () => {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (error || !authUser) {
    return null
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, authUser.id)
  })

  if (!dbUser) {
    return null
  }

  return dbUser
})

