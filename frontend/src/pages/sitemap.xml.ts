import type { APIRoute } from 'astro';

const pages = [
	{ url: '', priority: '1.0', changefreq: 'daily' },
	{ url: '/profil', priority: '0.8', changefreq: 'monthly' },
	{ url: '/profil/pejabat', priority: '0.8', changefreq: 'monthly' },
	{ url: '/profil/visi-misi', priority: '0.8', changefreq: 'monthly' },
	{ url: '/profil/tugas-fungsi', priority: '0.8', changefreq: 'monthly' },
	{ url: '/profil/struktur', priority: '0.8', changefreq: 'monthly' },
	{ url: '/data-informasi', priority: '0.9', changefreq: 'weekly' },
	{ url: '/data-informasi/infografis', priority: '0.8', changefreq: 'weekly' },
	{ url: '/informasi-publik/berkala', priority: '0.9', changefreq: 'daily' },
	{ url: '/informasi-publik/serta-merta', priority: '0.8', changefreq: 'weekly' },
	{ url: '/informasi-publik/setiap-saat', priority: '0.8', changefreq: 'weekly' },
	{ url: '/informasi-publik/dikecualikan', priority: '0.7', changefreq: 'monthly' },
	{ url: '/layanan-informasi/permohonan', priority: '0.9', changefreq: 'daily' },
	{ url: '/layanan-informasi/keberatan', priority: '0.8', changefreq: 'monthly' },
	{ url: '/layanan-informasi/pengaduan', priority: '0.8', changefreq: 'monthly' },
	{ url: '/layanan-informasi/sop', priority: '0.8', changefreq: 'monthly' },
	{ url: '/standar-layanan/maklumat', priority: '0.8', changefreq: 'monthly' },
	{ url: '/standar-layanan/jadwal', priority: '0.8', changefreq: 'monthly' },
	{ url: '/standar-layanan/biaya', priority: '0.8', changefreq: 'monthly' },
	{ url: '/standar-layanan', priority: '0.8', changefreq: 'monthly' },
	{ url: '/standar-layanan/kebijakan', priority: '0.7', changefreq: 'monthly' },
	{ url: '/standar-layanan/strategi', priority: '0.7', changefreq: 'monthly' },
	{ url: '/regulasi', priority: '0.9', changefreq: 'weekly' },
];

export const GET: APIRoute = ({ site }) => {
	const baseUrl = (site?.toString() ?? 'https://ppid.kemenag-baritoutara.com').replace(/\/$/, '');
	const lastMod = new Date().toISOString();

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
	.map(
		(page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
		},
	});
};
