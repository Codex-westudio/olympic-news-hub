import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/database";

const protectedPrefixes = ["/widgets", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const shouldProtect = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!shouldProtect) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin")) {
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const userEmail = session.user?.email?.toLowerCase() ?? "";
    if (!adminEmails.includes(userEmail)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/widgets/:path*", "/admin/:path*"],
};
