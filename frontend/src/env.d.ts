/// <reference types="astro/client" />
/// <reference types="node" />

interface ImportMetaEnv {
	/** Go backend origin used by the Astro /api proxy (server-side). */
	readonly API_UPSTREAM_URL?: string;
	/** Base URL for client API calls; relative path works behind the proxy. */
	readonly PUBLIC_API_BASE_URL?: string;
	/** Cloudflare Turnstile site key for the admin login form. */
	readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
	readonly TURNSTILE_SITE_KEY?: string;
	/** Cloudflare Web Analytics / Browser Insights Beacon Token. */
	readonly PUBLIC_CF_BEACON_TOKEN?: string;
	readonly CF_BEACON_TOKEN?: string;
	/** Public site URL (sitemap/SEO). */
	readonly PUBLIC_SITE_URL?: string;
	readonly SITE_URL?: string;
	/** Google Analytics / Tag Manager IDs */
	readonly PUBLIC_GA_MEASUREMENT_ID?: string;
	readonly GA_MEASUREMENT_ID?: string;
	readonly PUBLIC_GTAG_ID?: string;
	readonly GTAG_ID?: string;
	readonly PUBLIC_GTM_ID?: string;
	readonly GTM_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}