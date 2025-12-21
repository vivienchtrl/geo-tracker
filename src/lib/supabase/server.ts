import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = async (cookieStore: ReturnType<typeof cookies>) => {
    return await createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            // Check if we can set cookies (Server Actions or Route Handlers only)
            // This prevents the error in Server Components (Layouts/Pages)
            cookiesToSet.forEach(async ({ name, value, options }) => {
              (await cookieStore).set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
