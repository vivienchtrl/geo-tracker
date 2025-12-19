import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-oauth";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  
  // Auth check using getUser which is secure
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  // Optional: Verify user owns the project here using a service
  // const hasAccess = await verifyProjectAccess(user.id, projectId);
  // if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = getAuthUrl(projectId);
  
  return NextResponse.redirect(url);
}
