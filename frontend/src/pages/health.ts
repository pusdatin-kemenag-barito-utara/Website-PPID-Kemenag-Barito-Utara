import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
	return new Response(
		JSON.stringify({
			status: 'ok',
			service: 'ppid-kemenag',
			timestamp: new Date().toISOString(),
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache, no-store',
			},
		},
	);
};
