/**
 * Proxy Handler for Next.js 16
 *
 * Handles Supabase Auth Protection
 *
 * Purpose:
 * - Handle authentication and route protection
 * - Redirect unauthenticated users from dashboard
 * - Redirect authenticated users from auth pages
 */

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Main proxy handler
 * Handles auth protection
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle Supabase Session Refresh
  const { supabaseResponse, user } = await updateSession(request);

  // Protect Dashboard Routes
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Redirect Logged-in Users away from Auth pages
  if ((pathname.startsWith('/auth/sign-in') || pathname.startsWith('/auth/sign-up')) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

/**
 * Proxy configuration
 * Defines which routes the proxy runs on
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
