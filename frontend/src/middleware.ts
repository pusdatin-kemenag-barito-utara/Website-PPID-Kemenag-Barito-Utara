import { defineMiddleware } from 'astro:middleware';

// Dev/prod wiring: browser only ever talks to the Astro origin. /api/* is
// proxied to the Go Fiber backend.
function getUpstream(): string {
	const raw = process.env.API_UPSTREAM_URL || import.meta.env.API_UPSTREAM_URL || 'http://127.0.0.1:8080';
	// In single-container environment, 'backend' hostname does not exist in DNS; map to 127.0.0.1
	if (raw.includes('://backend:')) {
		return raw.replace('://backend:', '://127.0.0.1:');
	}
	return raw;
}

const ADMIN_COOKIE = 'ppid_admin_token';

const passThroughHeaders = [
	'accept',
	'accept-language',
	'content-type',
	'origin',
	'referer',
	'user-agent',
	'x-requested-with',
	'cf-connecting-ip',
	'cf-ipcountry',
	'cf-ray',
	'cf-visitor',
	'true-client-ip',
	'x-forwarded-for',
	'x-forwarded-proto',
	'x-real-ip',
];

interface SystemStatus {
	is_maintenance: boolean;
	status: string;
	name: string;
}

let cachedStatus: SystemStatus | null = null;
let lastStatusFetch = 0;

async function checkSystemStatus(): Promise<SystemStatus> {
	const now = Date.now();
	if (cachedStatus && now - lastStatusFetch < 5000) {
		return cachedStatus;
	}
	try {
		const res = await fetch(`${getUpstream()}/api/v1/system/status`, {
			signal: AbortSignal.timeout(3000),
		});
		if (res.ok) {
			const json = (await res.json()) as { success: boolean; data: SystemStatus };
			if (json.success && json.data) {
				cachedStatus = json.data;
				lastStatusFetch = now;
				return cachedStatus;
			}
		}
	} catch {
		// Try localhost fallback if custom upstream failed
		try {
			const res = await fetch('http://127.0.0.1:8080/api/v1/system/status', {
				signal: AbortSignal.timeout(2000),
			});
			if (res.ok) {
				const json = (await res.json()) as { success: boolean; data: SystemStatus };
				if (json.success && json.data) {
					cachedStatus = json.data;
					lastStatusFetch = now;
					return cachedStatus;
				}
			}
		} catch {}
	}
	return cachedStatus ?? { is_maintenance: false, status: 'online', name: 'PPID Kemenag Barito Utara' };
}

export const onRequest = defineMiddleware(async (context, next) => {
	const url = new URL(context.request.url);

	// 1. Static asset fast bypass
	const isStaticAsset =
		url.pathname.startsWith('/_astro/') ||
		url.pathname === '/favicon.svg' ||
		url.pathname === '/logo-kemenag.svg' ||
		url.pathname === '/hapakat.png' ||
		url.pathname === '/robots.txt' ||
		url.pathname === '/sitemap.xml' ||
		url.pathname === '/site.webmanifest' ||
		url.pathname.match(/\.(css|js|woff2?|ttf|svg|png|jpg|jpeg|webp|ico|json|webmanifest)$/i);

	if (isStaticAsset) {
		return next();
	}

	// 2. Pusdatin Maintenance Guard (Graceful Navigation & History Enabled)
	if (!url.pathname.startsWith('/api/')) {
		const sysStatus = await checkSystemStatus();
		if (!sysStatus.is_maintenance && url.pathname === '/maintenance') {
			// In online mode: If visiting /maintenance, redirect back to home
			return context.redirect('/');
		}
		// In maintenance mode: Allow pages to render briefly so users can view
		// previous/next content with back/forward history before smooth transition.
	}

	// 3. Security Guard: Obsolete login URLs return 404
	if (url.pathname === '/admin/login' || url.pathname === '/login') {
		return context.redirect('/404');
	}

	// 4. Admin route protection: Require active session or return 404
	if (url.pathname.startsWith('/admin')) {
		const hasSession = Boolean(context.cookies.get(ADMIN_COOKIE)?.value);
		if (!hasSession) {
			return context.redirect('/404');
		}
	}

	// Healthcheck bypass: Return instant 200 OK for Coolify / Docker monitoring
	if (url.pathname === '/api/health' || url.pathname === '/health') {
		return new Response(
			JSON.stringify({ status: 'ok', service: 'ppid-kemenag', timestamp: new Date().toISOString() }),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store' },
			},
		);
	}

	// Proxy API calls to the Go backend.
	if (url.pathname.startsWith('/api/')) {
		const upstreamTarget = getUpstream();
		const upstreamUrl = new URL(url.pathname + url.search, upstreamTarget);

		const headers = new Headers();
		for (const name of passThroughHeaders) {
			const value = context.request.headers.get(name);
			if (value) headers.set(name, value);
		}
		const cookie = context.request.headers.get('cookie');
		if (cookie) headers.set('cookie', cookie);

		const init: RequestInit = { method: context.request.method, headers, redirect: 'manual' };
		if (!['GET', 'HEAD'].includes(context.request.method)) {
			const bodyBuffer = await context.request.arrayBuffer();
			if (bodyBuffer.byteLength > 0) {
				init.body = bodyBuffer;
				(init as Record<string, unknown>).duplex = 'half';
			}
		}

		try {
			let upstreamRes: Response;
			try {
				upstreamRes = await fetch(upstreamUrl, init);
			} catch (primaryErr) {
				// If custom upstream failed and it wasn't 127.0.0.1, fallback to local backend port 8080
				if (!upstreamUrl.origin.includes('127.0.0.1')) {
					const fallbackUrl = new URL(url.pathname + url.search, 'http://127.0.0.1:8080');
					upstreamRes = await fetch(fallbackUrl, init);
				} else {
					throw primaryErr;
				}
			}

			const responseHeaders = new Headers(upstreamRes.headers);
			responseHeaders.delete('content-length');

			// Cloudflare edge cache control: never cache API responses
			responseHeaders.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
			responseHeaders.set('Cloudflare-CDN-Cache-Control', 'no-store');

			return new Response(upstreamRes.body, {
				status: upstreamRes.status,
				headers: responseHeaders,
			});
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : 'Unknown upstream error';
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Layanan API backend sedang tidak tersedia atau dalam proses reload.',
					details: errorMsg,
				}),
				{
					status: 503,
					headers: {
						'content-type': 'application/json',
						'Cache-Control': 'private, no-store, no-cache, must-revalidate',
					},
				}
			);
		}
	}

	const response = await next();

	// Enterprise HTTP/3, Cloudflare CDN & Security Headers
	response.headers.set('Alt-Svc', 'h3=":443"; ma=86400, h3-29=":443"; ma=86400');
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

	// Comprehensive Enterprise CSP (Allowing GA4, GTM, Cloudflare Insights, Turnstile, R2, and PDF preview)
	const cspDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://challenges.cloudflare.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com data:",
		"img-src 'self' data: blob: https://ppid.kemenag-baritoutara.com https://files.kemenag-baritoutara.com https://www.google-analytics.com https://www.googletagmanager.com",
		"connect-src 'self' http://127.0.0.1:8080 http://localhost:8080 https://ppid.kemenag-baritoutara.com https://files.kemenag-baritoutara.com https://pusdatin.kemenag-baritoutara.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://challenges.cloudflare.com",
		"frame-src 'self' data: blob: https://files.kemenag-baritoutara.com https://pusdatin.kemenag-baritoutara.com https://challenges.cloudflare.com https://www.googletagmanager.com",
		"object-src 'self' blob: https://files.kemenag-baritoutara.com",
		"base-uri 'self'",
		"form-action 'self'",
	];
	response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

	// Cloudflare Edge Cache Policies (Enterprise Tier)
	const isMaint = cachedStatus?.is_maintenance ?? false;

	if (isMaint) {
		// During maintenance: Strict anti-caching to disable browser bfcache & edge cache
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
		response.headers.set('CDN-Cache-Control', 'no-store');
		response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
	} else if (url.pathname.startsWith('/admin')) {
		// Admin: completely private, zero edge caching
		response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		response.headers.set('CDN-Cache-Control', 'no-store');
		response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
	} else if (
		url.pathname.startsWith('/_astro/') ||
		url.pathname.match(/\.(css|js|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/i)
	) {
		// Static Assets: 1 year immutable edge & browser caching
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
		response.headers.set('CDN-Cache-Control', 'max-age=31536000');
		response.headers.set('Cloudflare-CDN-Cache-Control', 'max-age=31536000');
	} else {
		// Public SSR HTML: Fast revalidation with stale-while-revalidate for edge caching
		response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
		response.headers.set('CDN-Cache-Control', 'max-age=1800, stale-while-revalidate=86400');
		response.headers.set(
			'Cloudflare-CDN-Cache-Control',
			'max-age=1800, stale-while-revalidate=86400'
		);
	}

	return response;
});