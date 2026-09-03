import { useEffect, useState } from 'react';
import {
	FileText,
	Clock,
	CheckCircle2,
	Files,
	ArrowUpRight,
	Plus,
	Users,
	Eye,
	RefreshCw,
	Inbox,
	Scroll,
	BarChart3,
	PieChart,
	AlertTriangle,
	MessageSquareWarning,
	Database,
	Server,
	FolderKanban,
	Layers,
	ChevronRight,
	TrendingUp,
	Check,
	Copy,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import type {
	InformasiItem,
	PermohonanItem,
	RegulasiItem,
	DataStatistikItem,
	DataInfografisItem,
} from './types';
import { StatusBadge, fmtDate, cn } from './shared';

export default function DashboardSection() {
	const [reqs, setReqs] = useState<PermohonanItem[]>([]);
	const [docs, setDocs] = useState<InformasiItem[]>([]);
	const [regulasis, setRegulasis] = useState<RegulasiItem[]>([]);
	const [sops, setSops] = useState<any[]>([]);
	const [statistiks, setStatistiks] = useState<DataStatistikItem[]>([]);
	const [infografises, setInfografises] = useState<DataInfografisItem[]>([]);

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

	const copyTicket = (ticketNo: string) => {
		if (!ticketNo) return;
		navigator.clipboard.writeText(ticketNo).then(() => {
			setCopiedTicket(ticketNo);
			setTimeout(() => {
				setCopiedTicket((prev) => (prev === ticketNo ? null : prev));
			}, 2000);
		});
	};

	const fetchData = () => {
		setRefreshing(true);
		Promise.all([
			apiGet<{ items?: PermohonanItem[] }>('/admin/permohonan').catch(() => ({ items: [] })),
			apiGet<{ items?: InformasiItem[] }>('/admin/informasi-publik').catch(() => ({ items: [] })),
			apiGet<{ items?: RegulasiItem[] }>('/admin/regulasi').catch(() => ({ items: [] })),
			apiGet<{ items?: any[] }>('/admin/sop').catch(() => ({ items: [] })),
			apiGet<{ items?: DataStatistikItem[] }>('/data-informasi/statistik').catch(() => ({ items: [] })),
			apiGet<{ items?: DataInfografisItem[] }>('/data-informasi/infografis').catch(() => ({ items: [] })),
		])
			.then(([p, i, r, sopRes, s, info]) => {
				setReqs(p?.items ?? []);
				setDocs(i?.items ?? []);
				setRegulasis(r?.items ?? []);
				setSops(sopRes?.items ?? []);
				setStatistiks(s?.items ?? []);
				setInfografises(info?.items ?? []);
			})
			.finally(() => {
				setLoading(false);
				setRefreshing(false);
			});
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Layanan calculation helpers
	const countStatus = (s: string) => reqs.filter((r) => r.status === s).length;
	const countJenis = (j: string) => reqs.filter((r) => r.jenis === j).length;
	const countJenisStatus = (j: string, s: string) =>
		reqs.filter((r) => r.jenis === j && r.status === s).length;

	const countPermohonan = countJenis('PERMOHONAN');
	const countKeberatan = countJenis('KEBERATAN');
	const countPengaduan = countJenis('PENGADUAN');

	const waitingCount = countStatus('MENUNGGU');
	const completedCount = countStatus('SELESAI');
	const inProgressCount = countStatus('DIPROSES');

	// Resolving percentage
	const resolveRate = reqs.length > 0 ? Math.round((completedCount / reqs.length) * 100) : 0;

	// PPID docs distribution
	const countDocKat = (kat: string) => docs.filter((d) => d.kategori === kat).length;
	const berkalaCount = countDocKat('BERKALA');
	const sertaMertaCount = countDocKat('SERTA_MERTA');
	const setiapSaatCount = countDocKat('SETIAP_SAAT');
	const dikecualikanCount = countDocKat('DIKECUALIKAN');

	// Regulasi distribution
	const countRegKat = (katKeyword: string) =>
		regulasis.filter((r) => (r.kategori || '').toLowerCase().includes(katKeyword.toLowerCase())).length;
	const uuCount = countRegKat('Undang-Undang') || countRegKat('UU');
	const pmaCount = countRegKat('Menteri') || countRegKat('PMA') || countRegKat('KMA');
	const skCount = countRegKat('SK') || countRegKat('Kepala');

	const recentRequests = reqs.slice(0, 5);

	// 4 Balanced Top KPIs
	const kpis = [
		{
			title: 'Total Layanan & Pengajuan',
			value: reqs.length,
			subtitle: `${countPermohonan} Permohonan • ${countKeberatan} Keberatan • ${countPengaduan} Pengaduan`,
			icon: Inbox,
			badgeColor: 'bg-emerald-500/10 text-[#007144]',
			href: '/admin/permohonan?jenis=PERMOHONAN',
		},
		{
			title: 'Menunggu Tindak Lanjut',
			value: waitingCount,
			subtitle: `${inProgressCount} Sedang Ditangani • ${completedCount} Selesai`,
			icon: Clock,
			badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
			href: '/admin/permohonan?jenis=PERMOHONAN&status=MENUNGGU',
		},
		{
			title: 'Dokumen PPID, Regulasi & SOP',
			value: docs.length + regulasis.length + sops.length,
			subtitle: `${docs.length} Info • ${regulasis.length} Regulasi • ${sops.length} SOP`,
			icon: Files,
			badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
			href: '/admin/informasi-publik',
		},
		{
			title: 'Data & Infografis Keagamaan',
			value: statistiks.length + infografises.length,
			subtitle: `${statistiks.length} Indikator Capaian • ${infografises.length} Poster Visual`,
			icon: BarChart3,
			badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
			href: '/admin/data-informasi?tab=statistik',
		},
	];

	return (
		<div className="space-y-7 w-full max-w-none">
			{/* Editorial Header - Responsif di Mobile */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-[#007144] border border-emerald-500/20">
							Executive Overview
						</span>
					</div>
					<h1 className="text-lg sm:text-2xl font-black tracking-tight text-foreground">
						Ikhtisar Layanan &amp; Pengelolaan PPID
					</h1>
					<p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-none">
						Monitoring terpadu dokumen publik, produk hukum, antrean layanan warga, dan data statistik Kemenag Barito Utara.
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={fetchData}
						disabled={refreshing}
						className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-accent transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
						title="Segarkan Data Terkini"
					>
						<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#007144]' : ''}`} />
						<span className="hidden sm:inline">Sinkronkan</span>
					</button>
					<a
						href="/admin/informasi-publik"
						className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#007144] text-white text-xs font-semibold hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all"
					>
						<Plus className="w-3.5 h-3.5" />
						<span>Tambah Dokumen</span>
					</a>
				</div>
			</div>

			{/* 4 Balanced Top KPIs - Grid 2 Kolom di Mobile agar hemat ruang & informatif */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
				{kpis.map((m) => {
					const Icon = m.icon;
					return (
						<a
							key={m.title}
							href={m.href}
							className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/70 hover:border-[#007144]/40 hover:shadow-xs transition-all space-y-2 sm:space-y-3 block group"
						>
							<div className="flex items-center justify-between gap-1.5">
								<span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground tracking-wide uppercase truncate">
									{m.title}
								</span>
								<div className={cn('p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 transition-transform group-hover:scale-105', m.badgeColor)}>
									<Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
								</div>
							</div>
							<div>
								<div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono">
									{loading ? (
										<span className="inline-block w-8 h-8 rounded bg-muted/60 animate-pulse" />
									) : (
										m.value
									)}
								</div>
								<p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
									{m.subtitle}
								</p>
							</div>
						</a>
					);
				})}
			</div>

			{/* 3 Main Pillars (Merata Sesuai 3 Kelompok Menu Sidebar) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				{/* Pillar 1: PENGELOLAAN PPID & REGULASI */}
				<div className="rounded-2xl bg-card border border-border/70 p-5 flex flex-col justify-between space-y-4 hover:border-border transition-all">
					<div className="space-y-4">
						<div className="flex items-center justify-between border-b border-border/40 pb-3">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-xl bg-emerald-500/10 text-[#007144]">
									<FolderKanban className="w-4 h-4" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-foreground">Pengelolaan PPID</h2>
									<span className="text-[10px] text-muted-foreground">Informasi Publik &amp; Regulasi</span>
								</div>
							</div>
							<a
								href="/admin/informasi-publik"
								className="text-[11px] font-bold text-[#007144] hover:underline flex items-center gap-1"
							>
								<span>Kelola</span>
								<ArrowUpRight className="w-3 h-3" />
							</a>
						</div>

						{/* Informasi Publik Breakdown */}
						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs font-bold">
								<span className="text-foreground">Daftar Informasi Publik</span>
								<span className="text-[#007144] font-mono">{docs.length} Dokumen</span>
							</div>
							<div className="grid grid-cols-2 gap-2 text-[11px]">
								<div className="p-2.5 rounded-xl bg-accent/30 border border-border/40">
									<span className="text-muted-foreground block text-[10px]">Berkala</span>
									<span className="font-bold text-foreground font-mono">{berkalaCount} dok</span>
								</div>
								<div className="p-2.5 rounded-xl bg-accent/30 border border-border/40">
									<span className="text-muted-foreground block text-[10px]">Serta Merta</span>
									<span className="font-bold text-foreground font-mono">{sertaMertaCount} dok</span>
								</div>
								<div className="p-2.5 rounded-xl bg-accent/30 border border-border/40">
									<span className="text-muted-foreground block text-[10px]">Setiap Saat</span>
									<span className="font-bold text-foreground font-mono">{setiapSaatCount} dok</span>
								</div>
								<div className="p-2.5 rounded-xl bg-accent/30 border border-border/40">
									<span className="text-muted-foreground block text-[10px]">Dikecualikan</span>
									<span className="font-bold text-foreground font-mono">{dikecualikanCount} dok</span>
								</div>
							</div>
						</div>

						{/* Regulasi Breakdown */}
						<div className="space-y-2 pt-2 border-t border-border/30">
							<div className="flex items-center justify-between text-xs font-bold">
								<span className="text-foreground">Regulasi &amp; Keputusan Hukum</span>
								<span className="text-blue-600 dark:text-blue-400 font-mono">{regulasis.length} Berkas</span>
							</div>
							<div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-accent/30 border border-border/40">
								<span className="text-muted-foreground">Undang-Undang, PMA, &amp; SK Tim</span>
								<span className="font-bold text-foreground">Aktif &amp; Terverifikasi</span>
							</div>
						</div>

						{/* SOP Breakdown */}
						<div className="space-y-2 pt-2 border-t border-border/30">
							<div className="flex items-center justify-between text-xs font-bold">
								<span className="text-foreground">Standar Operasional (SOP)</span>
								<span className="text-[#007144] font-mono">{sops.length} Dokumen</span>
							</div>
							<div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-accent/30 border border-border/40">
								<span className="text-muted-foreground">Prosedur Layanan &amp; Penanganan</span>
								<span className="font-bold text-foreground">Resmi Terbit</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
						<a
							href="/admin/informasi-publik"
							className="text-center py-2 rounded-xl text-xs font-bold border border-input hover:bg-accent transition-colors truncate"
						>
							Info Publik
						</a>
						<a
							href="/admin/regulasi"
							className="text-center py-2 rounded-xl text-xs font-bold border border-input hover:bg-accent transition-colors truncate"
						>
							Regulasi &amp; SK
						</a>
						<a
							href="/admin/sop"
							className="text-center py-2 rounded-xl text-xs font-bold border border-input hover:bg-accent transition-colors text-[#007144] truncate"
						>
							SOP Layanan
						</a>
					</div>
				</div>

				{/* Pillar 2: LAYANAN & PENGAJUAN PUBLIK */}
				<div className="rounded-2xl bg-card border border-border/70 p-5 flex flex-col justify-between space-y-4 hover:border-border transition-all">
					<div className="space-y-4">
						<div className="flex items-center justify-between border-b border-border/40 pb-3">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
									<Users className="w-4 h-4" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-foreground">Layanan &amp; Pengajuan</h2>
									<span className="text-[10px] text-muted-foreground">Antrean Permohonan &amp; Aspirasi</span>
								</div>
							</div>
							<a
								href="/admin/permohonan?jenis=PERMOHONAN"
								className="text-[11px] font-bold text-[#007144] hover:underline flex items-center gap-1"
							>
								<span>Tinjau</span>
								<ArrowUpRight className="w-3 h-3" />
							</a>
						</div>

						{/* 3 Queues */}
						<div className="space-y-2.5">
							{/* Permohonan */}
							<a
								href="/admin/permohonan?jenis=PERMOHONAN"
								className="p-2.5 rounded-xl border border-border/50 hover:bg-accent/40 flex items-center justify-between transition-colors block"
							>
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-[#007144]" />
									<span className="text-xs font-bold text-foreground">Permohonan Informasi</span>
								</div>
								<div className="flex items-center gap-1.5 font-mono text-xs">
									<span className="font-extrabold text-foreground">{countPermohonan}</span>
									<span className="text-[10px] text-muted-foreground">({countJenisStatus('PERMOHONAN', 'MENUNGGU')} tunggu)</span>
								</div>
							</a>

							{/* Keberatan */}
							<a
								href="/admin/permohonan?jenis=KEBERATAN"
								className="p-2.5 rounded-xl border border-border/50 hover:bg-accent/40 flex items-center justify-between transition-colors block"
							>
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-amber-500" />
									<span className="text-xs font-bold text-foreground">Pengajuan Keberatan</span>
								</div>
								<div className="flex items-center gap-1.5 font-mono text-xs">
									<span className="font-extrabold text-foreground">{countKeberatan}</span>
									<span className="text-[10px] text-muted-foreground">({countJenisStatus('KEBERATAN', 'MENUNGGU')} tunggu)</span>
								</div>
							</a>

							{/* Pengaduan */}
							<a
								href="/admin/permohonan?jenis=PENGADUAN"
								className="p-2.5 rounded-xl border border-border/50 hover:bg-accent/40 flex items-center justify-between transition-colors block"
							>
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-sky-500" />
									<span className="text-xs font-bold text-foreground">Pengaduan Masyarakat</span>
								</div>
								<div className="flex items-center gap-1.5 font-mono text-xs">
									<span className="font-extrabold text-foreground">{countPengaduan}</span>
									<span className="text-[10px] text-muted-foreground">({countJenisStatus('PENGADUAN', 'DIPROSES')} proses)</span>
								</div>
							</a>
						</div>

						{/* Completion Rate Progress */}
						<div className="pt-2 border-t border-border/30 space-y-1.5">
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-muted-foreground font-medium">Tingkat Penyelesaian Layanan</span>
								<span className="font-bold text-foreground">{resolveRate}% Selesai</span>
							</div>
							<div className="w-full h-2 rounded-full bg-muted/70 overflow-hidden">
								<div
									className="h-full bg-emerald-600 rounded-full transition-all duration-500"
									style={{ width: `${resolveRate}%` }}
								/>
							</div>
						</div>
					</div>

					<a
						href="/admin/permohonan?jenis=PERMOHONAN&status=MENUNGGU"
						className="text-center py-2 rounded-xl text-xs font-bold bg-[#007144] hover:bg-[#005935] text-white transition-colors shadow-2xs"
					>
						Tindak Lanjut Antrean Menunggu ({waitingCount})
					</a>
				</div>

				{/* Pillar 3: DATA & STATISTIK KEMENAG */}
				<div className="rounded-2xl bg-card border border-border/70 p-5 flex flex-col justify-between space-y-4 hover:border-border transition-all">
					<div className="space-y-4">
						<div className="flex items-center justify-between border-b border-border/40 pb-3">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400">
									<BarChart3 className="w-4 h-4" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-foreground">Data &amp; Statistik</h2>
									<span className="text-[10px] text-muted-foreground">Kementerian Agama Barito Utara</span>
								</div>
							</div>
							<a
								href="/admin/data-informasi?tab=statistik"
								className="text-[11px] font-bold text-[#007144] hover:underline flex items-center gap-1"
							>
								<span>Kelola</span>
								<ArrowUpRight className="w-3 h-3" />
							</a>
						</div>

						{/* 4 Indikator Statistik Capaian Ringkas */}
						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs font-bold">
								<span className="text-foreground">Indikator Data Utama</span>
								<span className="text-purple-600 dark:text-purple-400 font-mono">{statistiks.length} Indikator</span>
							</div>

							<div className="grid grid-cols-2 gap-2 text-xs">
								{statistiks.slice(0, 4).map((s) => (
									<div key={s.id} className="p-2.5 rounded-xl bg-accent/30 border border-border/40 truncate">
										<span className="text-muted-foreground text-[10px] block truncate">{s.label}</span>
										<div className="flex items-baseline gap-1 mt-0.5">
											<span className="text-base font-extrabold text-foreground font-mono">{s.nilai}</span>
											<span className="text-[10px] text-muted-foreground font-medium truncate">{s.satuan}</span>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Infografis Ringkasan */}
						<div className="space-y-2 pt-2 border-t border-border/30">
							<div className="flex items-center justify-between text-xs font-bold">
								<span className="text-foreground">Infografis Visual Keagamaan</span>
								<span className="text-purple-600 dark:text-purple-400 font-mono">{infografises.length} Poster</span>
							</div>
							<div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-accent/30 border border-border/40">
								<span className="text-muted-foreground">Poster Resolusi Penuh</span>
								<span className="font-bold text-foreground font-mono">Cloudflare R2</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
						<a
							href="/admin/data-informasi?tab=statistik"
							className="text-center py-2 rounded-xl text-xs font-bold border border-input hover:bg-accent transition-colors"
						>
							Statistik
						</a>
						<a
							href="/admin/data-informasi?tab=infografis"
							className="text-center py-2 rounded-xl text-xs font-bold border border-input hover:bg-accent transition-colors"
						>
							Infografis
						</a>
					</div>
				</div>
			</div>

			{/* Main Grid: Recent Activity & System Status */}
			<div className="grid gap-6 lg:grid-cols-12">
				{/* Recent Activity Table (8 Cols) */}
				<div className="lg:col-span-8 rounded-2xl bg-card border border-border/70 overflow-hidden flex flex-col justify-between shadow-2xs">
					<div>
						<div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
							<div>
								<h2 className="text-sm font-bold text-foreground">
									Pengajuan Layanan Terbaru Masuk
								</h2>
								<p className="text-[11px] text-muted-foreground">
									Daftar tiket permohonan, keberatan, dan pengaduan masyarakat terkini
								</p>
							</div>
							<a
								href="/admin/permohonan?jenis=PERMOHONAN"
								className="text-xs font-semibold text-[#007144] hover:underline flex items-center gap-1"
							>
								<span>Lihat Semua ({reqs.length})</span>
								<ArrowUpRight className="w-3.5 h-3.5" />
							</a>
						</div>

						{/* Mobile Card List View (sm:hidden) */}
						<div className="sm:hidden divide-y divide-border/40">
							{loading ? (
								<div className="py-8 text-center text-xs text-muted-foreground">
									Memuat data antrean...
								</div>
							) : recentRequests.length > 0 ? (
								recentRequests.map((r) => {
									const badgeCls =
										r.jenis === 'KEBERATAN'
											? 'bg-amber-500/15 text-amber-800 dark:text-amber-400'
											: r.jenis === 'PENGADUAN'
											? 'bg-sky-500/15 text-sky-800 dark:text-sky-400'
											: 'bg-emerald-500/15 text-[#007144]';

									return (
										<div key={r.id} className="p-3.5 space-y-2.5 hover:bg-accent/20 transition-colors">
											<div className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-1.5">
													<span className="font-bold text-foreground font-mono text-xs">
														{r.tiket_no}
													</span>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															copyTicket(r.tiket_no);
														}}
														className="p-1 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-[#007144] transition-all cursor-pointer"
														title={`Salin ${r.tiket_no}`}
													>
														{copiedTicket === r.tiket_no ? (
															<Check className="w-3.5 h-3.5 text-emerald-600" />
														) : (
															<Copy className="w-3.5 h-3.5" />
														)}
													</button>
												</div>
												<span className={cn('px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide', badgeCls)}>
													{r.jenis}
												</span>
											</div>

											<div className="flex items-center justify-between text-xs">
												<span className="font-semibold text-foreground truncate max-w-[180px]">
													{r.nama}
												</span>
												<StatusBadge status={r.status} />
											</div>

											<div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-[11px]">
												<span className="text-muted-foreground text-[10px]">
													{fmtDate(r.created_at)}
												</span>
												<a
													href={`/admin/permohonan?jenis=${r.jenis}`}
													className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#007144] hover:bg-[#007144] hover:text-white transition-all border border-[#007144]/30"
												>
													<span>Tindak Lanjut</span>
												</a>
											</div>
										</div>
									);
								})
							) : (
								<div className="py-8 text-center text-xs text-muted-foreground">
									Belum ada permohonan masuk saat ini.
								</div>
							)}
						</div>

						{/* Desktop Table View (hidden sm:block) */}
						<div className="hidden sm:block overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="border-b border-border/50 text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider bg-accent/20">
										<th className="py-3 px-5">Tiket &amp; Pemohon</th>
										<th className="py-3 px-4">Layanan</th>
										<th className="py-3 px-4">Status</th>
										<th className="py-3 px-4">Tanggal</th>
										<th className="py-3 px-5 text-right">Tindakan</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/40 text-xs font-medium">
									{loading ? (
										<tr>
											<td colSpan={5} className="py-8 text-center text-muted-foreground">
												Memuat data antrean...
											</td>
										</tr>
									) : recentRequests.length > 0 ? (
										recentRequests.map((r) => {
											const badgeCls =
												r.jenis === 'KEBERATAN'
													? 'bg-amber-500/15 text-amber-800 dark:text-amber-400'
													: r.jenis === 'PENGADUAN'
													? 'bg-sky-500/15 text-sky-800 dark:text-sky-400'
													: 'bg-emerald-500/15 text-[#007144]';

											return (
												<tr key={r.id} className="hover:bg-accent/20 transition-colors">
													<td className="py-3 px-5">
														<div className="flex items-center gap-2.5">
															<div>
																<div className="flex items-center gap-1">
																	<span className="font-bold text-foreground font-mono text-[11px]">
																		{r.tiket_no}
																	</span>
																	<button
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			copyTicket(r.tiket_no);
																		}}
																		className="p-0.5 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-[#007144] transition-all cursor-pointer"
																		title={`Salin ${r.tiket_no}`}
																	>
																		{copiedTicket === r.tiket_no ? (
																			<Check className="w-3 h-3 text-emerald-600" />
																		) : (
																			<Copy className="w-3 h-3" />
																		)}
																	</button>
																</div>
																<span className="text-[11px] text-foreground/85 block truncate max-w-[180px]">
																	{r.nama}
																</span>
															</div>
														</div>
													</td>
													<td className="py-3 px-4 whitespace-nowrap">
														<span className={cn('px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide', badgeCls)}>
															{r.jenis}
														</span>
													</td>
													<td className="py-3 px-4 whitespace-nowrap">
														<StatusBadge status={r.status} />
													</td>
													<td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-[11px]">
														{fmtDate(r.created_at)}
													</td>
													<td className="py-3 px-5 text-right whitespace-nowrap">
														<a
															href={`/admin/permohonan?jenis=${r.jenis}`}
															className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#007144] hover:bg-[#007144] hover:text-white transition-all border border-[#007144]/30"
														>
															<span>Tindak Lanjut</span>
														</a>
													</td>
												</tr>
											);
										})
									) : (
										<tr>
											<td colSpan={5} className="py-10 text-center text-muted-foreground">
												Belum ada permohonan masuk saat ini.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>

					<div className="p-3.5 bg-muted/10 border-t border-border/50 text-right">
						<span className="text-[11px] text-muted-foreground">
							Kelola seluruh antrean layanan melalui menu samping <strong>Layanan &amp; Pengajuan</strong>
						</span>
					</div>
				</div>

				{/* System Status & Quick Shortcuts (4 Cols) */}
				<div className="lg:col-span-4 space-y-4">
					{/* Status Server Box */}
					<div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-2xs">
						<div className="flex items-center justify-between border-b border-border/40 pb-2.5">
							<span className="text-xs font-bold text-foreground flex items-center gap-2">
								<Server className="w-4 h-4 text-[#007144]" />
								Status Infrastruktur &amp; Sistem
							</span>
							<span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								Operasional
							</span>
						</div>

						<div className="space-y-2 text-[11px]">
							<div className="flex items-center justify-between p-2 rounded-xl bg-accent/20">
								<span className="text-muted-foreground">Database PostgreSQL</span>
								<span className="font-bold text-foreground flex items-center gap-1 font-mono text-[10px]">
									<Check className="w-3 h-3 text-emerald-600" /> Terhubung
								</span>
							</div>

							<div className="flex items-center justify-between p-2 rounded-xl bg-accent/20">
								<span className="text-muted-foreground">Cloudflare R2 Storage</span>
								<span className="font-bold text-foreground flex items-center gap-1 font-mono text-[10px]">
									<Check className="w-3 h-3 text-emerald-600" /> Aktif
								</span>
							</div>

							<div className="flex items-center justify-between p-2 rounded-xl bg-accent/20">
								<span className="text-muted-foreground">REST API Engine</span>
								<span className="font-bold text-foreground font-mono text-[10px]">
									Go Fiber v3 (Port 8080)
								</span>
							</div>
						</div>
					</div>

					{/* Pintasan Aksi Cepat */}
					<div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-2xs">
						<span className="text-xs font-bold text-foreground block border-b border-border/40 pb-2">
							Pintasan Modul Pengelolaan
						</span>

						<div className="space-y-2 text-xs">
							<a
								href="/admin/informasi-publik"
								className="p-2.5 rounded-xl border border-border/50 hover:bg-emerald-500/5 hover:border-[#007144]/40 flex items-center justify-between group transition-all"
							>
								<div className="flex items-center gap-2">
									<Plus className="w-3.5 h-3.5 text-[#007144]" />
									<span className="font-bold text-foreground group-hover:text-[#007144]">Unggah Informasi Publik</span>
								</div>
								<ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#007144]" />
							</a>

							<a
								href="/admin/regulasi"
								className="p-2.5 rounded-xl border border-border/50 hover:bg-emerald-500/5 hover:border-[#007144]/40 flex items-center justify-between group transition-all"
							>
								<div className="flex items-center gap-2">
									<Scroll className="w-3.5 h-3.5 text-[#007144]" />
									<span className="font-bold text-foreground group-hover:text-[#007144]">Tambah Regulasi &amp; SK</span>
								</div>
								<ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#007144]" />
							</a>

							<a
								href="/admin/data-informasi?tab=statistik"
								className="p-2.5 rounded-xl border border-border/50 hover:bg-emerald-500/5 hover:border-[#007144]/40 flex items-center justify-between group transition-all"
							>
								<div className="flex items-center gap-2">
									<BarChart3 className="w-3.5 h-3.5 text-[#007144]" />
									<span className="font-bold text-foreground group-hover:text-[#007144]">Update Data Statistik</span>
								</div>
								<ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#007144]" />
							</a>

							<a
								href="/admin/data-informasi?tab=infografis"
								className="p-2.5 rounded-xl border border-border/50 hover:bg-emerald-500/5 hover:border-[#007144]/40 flex items-center justify-between group transition-all"
							>
								<div className="flex items-center gap-2">
									<PieChart className="w-3.5 h-3.5 text-[#007144]" />
									<span className="font-bold text-foreground group-hover:text-[#007144]">Upload Poster Infografis</span>
								</div>
								<ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#007144]" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}