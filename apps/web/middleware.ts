import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  // Refresh session — MUST be called before any redirect checks
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Public routes — never redirect
  const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback", "/onboarding"];
  const isPublic = publicPaths.some(p => path.startsWith(p));

  // Protect /dashboard and /admin (Bypassed for developer mock mode)
  /*
  if (!user && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  */

  // Redirect logged-in users away from auth pages (but not onboarding or reset)
  if (user && (path === "/login" || path === "/signup" || path.startsWith("/signup/"))) {
    const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    const url  = request.nextUrl.clone();
    url.pathname = next;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Role-based protection — block employees from owner-only sections
  const OWNER_ONLY = ["/dashboard/locations", "/dashboard/audits", "/dashboard/reports", "/admin"];
  if (user && OWNER_ONLY.some(p => path.startsWith(p))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
