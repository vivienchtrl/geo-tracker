import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Handle Supabase Session Refresh
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Protect Dashboard Routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // 3. Redirect Logged-in Users away from Auth pages
  if ((request.nextUrl.pathname.startsWith('/auth/sign-in') || request.nextUrl.pathname.startsWith('/auth/sign-up')) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
