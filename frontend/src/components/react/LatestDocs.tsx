import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-client';

interface InformasiItem {
	id: string;
	judul: string;
	kategori: string;
	deskripsi?: string;
	tanggal?: string;
	ukuran?: string;
	file_url?: string;
}

const KATEGORI_LABEL: Record<string, string> = {
	BERKALA: 'Informasi Berkala',
	SERTA_MERTA: 'Informasi Serta Merta',
	SETIAP_SAAT: 'Informasi Setiap Saat',
	DIKECUALIKAN: 'Informasi Dikecualikan',
};

export default function LatestDocs() {
	const [docs, setDocs] = useState<InformasiItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		apiGet<{ items?: InformasiItem[] }>('/informasi-publik')
			.then((payload) => {
				if (!cancelled) {
					const items = (payload?.items ?? [])
						.filter((d) => d.kategori === 'BERKALA' || d.kategori === 'SETIAP_SAAT')
						.slice(0, 3);
					setDocs(items.length > 0 ? items : (payload?.items ?? []).slice(0, 3));
				}
			})
			.catch(() => {
				if (!cancelled) setDocs([]);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return (
			<div className="grid gap-4 md:grid-cols-3 w-full">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3 animate-pulse"
					>
						<div className="h-5 w-28 rounded-full bg-accent/70" />
						<div className="h-4 w-full rounded bg-accent/70" />
						<div className="h-3 w-4/5 rounded bg-accent/60" />
					</div>
				))}
			</div>
		);
	}

	if (docs.length === 0) {
		return (
			<p className="text-xs text-muted-foreground">Belum ada dokumen publik yang dipublikasikan.</p>
		);
	}

	return (
		<div className="grid gap-3 sm:gap-4 md:grid-cols-3 w-full">
			{docs.map((doc) => (
				<a
					key={doc.id}
					href={doc.file_url ?? '/informasi-publik/berkala'}
					className="p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#007144]/40 transition-all"
				>
					<div className="space-y-2">
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#007144]">
							{KATEGORI_LABEL[doc.kategori] ?? doc.kategori}
						</span>
						<h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
							{doc.judul}
						</h3>
						<p className="text-xs text-muted-foreground line-clamp-2">{doc.deskripsi}</p>
					</div>
					<div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
						<span>{doc.tanggal}</span>
						<span className="font-bold text-[#007144]">{doc.ukuran ?? 'PDF'}</span>
					</div>
				</a>
			))}
		</div>
	);
}