import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let hasSupabaseSession = false;
  
  // We use sb-ppid-auth-token instead of sb-pusdatin-auth-token
  const authCookies = request.cookies.getAll().filter(c =>
    c.name.startsWith("sb-ppid-auth-token")
  );

  if (authCookies.length > 0) {
    hasSupabaseSession = true;
    try {
      authCookies.sort((a, b) => a.name.localeCompare(b.name));
      const combinedCookie = authCookies.map(c => c.value).join('');
      
      let decoded = combinedCookie;
      try { decoded = decodeURIComponent(combinedCookie); } catch {}
      
      let accessToken = "";
      if (decoded.startsWith("base64-")) {
        const jsonStr = atob(decoded.replace("base64-", ""));
        const json = JSON.parse(jsonStr);
        accessToken = json.access_token || (Array.isArray(json) ? json[0] : "");
      } else {
        const json = JSON.parse(decoded);
        accessToken = json.access_token || (Array.isArray(json) ? json[0] : "");
      }

      if (accessToken) {
        const payloadStr = accessToken.split('.')[1];
        const payload = JSON.parse(atob(payloadStr.replace(/-/g, '+').replace(/_/g, '/')));
        
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          hasSupabaseSession = false;
        }
      }
    } catch (e) {
      console.error("[PROXY] Failed to parse JWT:", e);
      hasSupabaseSession = false;
    }
  }

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasSupabaseSession) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is already logged in and tries to access login page, redirect to dashboard
  if (pathname === '/admin/login') {
    if (hasSupabaseSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
