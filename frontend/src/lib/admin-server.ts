export interface AdminUser {
	id: string;
	email: string;
	full_name: string;
	role: string;
}

// Server-side auth guard for admin pages. Returns the principal or null when
// the session cookie is missing/invalid so the page can redirect to login.
export async function getAdminUser(origin: string, cookieHeader: string): Promise<AdminUser | null> {
	if (!cookieHeader || !cookieHeader.includes('ppid_admin_token')) {
		return null;
	}

	try {
		// Inside the container, direct communication to Go backend port 8080 avoids external DNS loopback issues
		const rawUpstream = process.env.API_UPSTREAM_URL || 'http://127.0.0.1:8080';
		const upstream = rawUpstream.replace('://backend:', '://127.0.0.1:');

		let res = await fetch(`${upstream}/api/v1/auth/me`, {
			headers: { cookie: cookieHeader, accept: 'application/json' },
			signal: AbortSignal.timeout(3000),
		}).catch(() => null);

		// Fallback to origin if local upstream was unreachable
		if (!res || !res.ok) {
			res = await fetch(`${origin}/api/v1/auth/me`, {
				headers: { cookie: cookieHeader, accept: 'application/json' },
				signal: AbortSignal.timeout(3000),
			}).catch(() => null);
		}

		if (!res || !res.ok) return null;
		const payload = (await res.json()) as { success: boolean; data?: AdminUser };
		if (!payload?.success || !payload.data) return null;
		return {
			id: payload.data.id,
			email: payload.data.email,
			full_name: payload.data.full_name ?? '',
			role: payload.data.role ?? '',
		};
	} catch {
		return null;
	}
}