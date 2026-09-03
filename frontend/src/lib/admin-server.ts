export interface AdminUser {
	id: string;
	email: string;
	full_name: string;
	role: string;
}

// Server-side auth guard for admin pages. Returns the principal or null when
// the session cookie is missing/invalid so the page can redirect to /admin/login.
export async function getAdminUser(origin: string, cookieHeader: string): Promise<AdminUser | null> {
	try {
		const res = await fetch(`${origin}/api/v1/auth/me`, {
			headers: { cookie: cookieHeader, accept: 'application/json' },
			signal: AbortSignal.timeout(5000),
		});
		if (!res.ok) return null;
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