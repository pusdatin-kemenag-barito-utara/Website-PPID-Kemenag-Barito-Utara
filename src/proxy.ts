import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === MAINTENANCE CHECK TERPUSAT (PUSDATIN) ===
  const isAdminPath = pathname.startsWith('/admin');
  const isApiPath = pathname.startsWith('/api');
  const isStaticFile = pathname.includes('.');

  if (!isAdminPath && !isApiPath && !isStaticFile) {
    try {
      const pusdatinUrl = process.env.NEXT_PUBLIC_PUSDATIN_URL || "https://pusdatin.kemenag-baritoutara.com";
      const appId = process.env.NEXT_PUBLIC_PUSDATIN_APP_ID || "ppid_kemenag_barito_utara";

      const maintenanceRes = await fetch(
        `${pusdatinUrl}/api/public/apps/${appId}/status`,
        {
          next: { revalidate: 30 },
        }
      );

      if (maintenanceRes.ok) {
        const data = await maintenanceRes.json();
        if (data.status === "maintenance") {
          return new NextResponse(
            `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sistem Sedang Pemeliharaan - PPID Kemenag Barito Utara</title>
    <link rel="icon" href="${pusdatinUrl}/branding/kemenag.svg" type="image/svg+xml">
    <style>
      body { margin: 0; overflow: hidden; background-color: #f8fafc; }
      iframe { width: 100vw; height: 100vh; border: none; }
    </style>
  </head>
  <body>
    <iframe src="${pusdatinUrl}/maintenance?app=PPID+Kemenag" title="Maintenance"></iframe>
  </body>
</html>`,
            {
              status: 503,
              headers: {
                "Content-Type": "text/html; charset=utf-8",
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("[PROXY] Failed to fetch maintenance status:", error);
    }
  }

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
