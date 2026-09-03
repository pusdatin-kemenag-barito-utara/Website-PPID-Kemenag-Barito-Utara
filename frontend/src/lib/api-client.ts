// Client for the Go Fiber backend (ppid-kemenag-api).
//
// In production the Astro server and the Go API share the same origin
// (nginx routes /api/* to Go), so the default base is a relative path.
// During local development point PUBLIC_API_BASE_URL at the Go server.

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL ?? '/api/v1';

export type ApiOptions = {
	init?: RequestInit;
	signal?: AbortSignal;
};

function buildUrl(path: string): string {
	const clean = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE_URL}${clean}`;
}

export async function apiGet<T>(path: string, opts: ApiOptions = {}): Promise<T> {
	const res = await fetch(buildUrl(path), {
		credentials: 'include',
		signal: opts.signal,
		headers: { Accept: 'application/json' },
	});
	return handle<T>(res, path);
}

export async function apiSend<T>(
	path: string,
	method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	body?: unknown,
	opts: ApiOptions = {},
): Promise<T> {
	const res = await fetch(buildUrl(path), {
		method,
		credentials: 'include',
		signal: opts.signal,
		headers: body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
	return handle<T>(res, path);
}

/** Uploads a file to the protected storage endpoint; resolves to {url, size, name}. */
export async function apiUploadFile(formData: FormData): Promise<{ url: string; size: number; name: string }> {
	const res = await fetch(buildUrl('/admin/storage/upload'), {
		method: 'POST',
		credentials: 'include',
		body: formData,
	});
	return handle<{ url: string; size: number; name: string }>(res, '/admin/storage/upload');
}

async function handle<T>(res: Response, path: string): Promise<T> {
	let payload: { success?: boolean; message?: string; data?: T; error?: string } | null = null;
	try {
		payload = (await res.json()) as typeof payload;
	} catch {
		// non-JSON body
	}

	if (!res.ok) {
		throw new ApiError(res.status, payload?.message ?? payload?.error ?? `Request ${path} failed`, path);
	}

	return (payload?.success === true ? payload.data : (payload as T)) as T;
}

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
		public readonly path: string,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export function isUnauthorized(err: unknown): boolean {
	return err instanceof ApiError && err.status === 401;
}