import { useEffect, useState } from 'react';
import {
	FileText,
	AlertTriangle,
	MessageSquareWarning,
	Search,
	Send,
	MessageCircle,
	Mail,
	CheckCircle2,
	Clock,
	X,
	Loader2,
	User,
	Phone,
	Hash,
	Calendar,
	ExternalLink,
	RefreshCw,
	Tag,
	FileCheck2,
	Copy,
	Check,
	Eye,
	Trash2,
} from 'lucide-react';
import { apiGet, apiSend, ApiError } from '@/lib/api-client';
import type { PermohonanItem, NotifItem } from './types';
import {
	cn,
	Field,
	LoadingRows,
	StatusBadge,
	STATUS_LABEL,
	JENIS_LABEL,
	fmtDate,
	inputCls,
	ModernSelect,
	useToast,
	Toaster,
} from './shared';

type JenisLayanan = 'PERMOHONAN' | 'KEBERATAN' | 'PENGADUAN';

const STATUS_OPTIONS = [
	{ value: 'MENUNGGU', label: 'MENUNGGU (Verifikasi Awal)' },
	{ value: 'DIPROSES', label: 'DIPROSES (Sedang Ditindaklanjuti)' },
	{ value: 'SELESAI', label: 'SELESAI (Telah Dipenuhi / Dijawab)' },
	{ value: 'DITOLAK', label: 'DITOLAK (Tidak Memenuhi Syarat)' },
];

function DeleteConfirmModal({
	target,
	loading,
	onConfirm,
	onCancel,
}: {
	target: PermohonanItem | null;
	loading: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	if (!target) return null;
	return (
		<div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
			<div className="bg-card border border-border/80 rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-7 space-y-4 animate-in zoom-in-95">
				<div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center">
					<Trash2 className="w-6 h-6" />
				</div>
				<div className="space-y-1">
					<h3 className="font-extrabold text-base text-foreground">
						Hapus Data Permanen?
					</h3>
					<p className="text-xs text-muted-foreground leading-relaxed">
						Anda akan menghapus tiket <span className="font-mono font-bold text-foreground">{target.tiket_no}</span> atas nama <span className="font-bold text-foreground">{target.nama}</span>.
					</p>
				</div>
				<div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 text-[11px] leading-relaxed">
					⚠️ <strong>Perhatian:</strong> Data permohonan beserta seluruh riwayat notifikasi terkait akan dihapus permanen dari sistem database tanpa tersisa. Tindakan ini tidak dapat dibatalkan.
				</div>
				<div className="flex items-center justify-end gap-2.5 pt-2">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="px-4 py-2.5 rounded-xl border border-input bg-background hover:bg-accent text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
					>
						Batal
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer transition-all"
					>
						{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
						<span>Hapus Permanen</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default function PermohonanSection() {
	const [reqs, setReqs] = useState<PermohonanItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const { toasts, showToast, removeToast } = useToast();

	const [activeJenis, setActiveJenis] = useState<JenisLayanan>('PERMOHONAN');
	const [statusFilter, setStatusFilter] = useState('Semua');
	const [q, setQ] = useState('');
	const [selected, setSelected] = useState<PermohonanItem | null>(null);
	const [newStatus, setNewStatus] = useState('MENUNGGU');
	const [saving, setSaving] = useState(false);

	// Deletion state
	const [deleteTarget, setDeleteTarget] = useState<PermohonanItem | null>(null);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await apiSend(`/admin/permohonan/${deleteTarget.id}`, 'DELETE');
			setReqs((prev) => prev.filter((item) => item.id !== deleteTarget.id));
			if (selected?.id === deleteTarget.id) {
				setSelected(null);
			}
			showToast(`Tiket ${deleteTarget.tiket_no} berhasil dihapus permanen dari database.`, 'success');
			setDeleteTarget(null);
		} catch (err: unknown) {
			const msg = err instanceof ApiError || err instanceof Error ? err.message : 'Gagal menghapus data dari database.';
			showToast(msg, 'error');
		} finally {
			setDeleting(false);
		}
	};

	// Notification composer inside drawer
	const [notifChannel, setNotifChannel] = useState<'wa' | 'email'>('wa');
	const [notifPesan, setNotifPesan] = useState('');
	const [notifSending, setNotifSending] = useState(false);
	const [notifHistory, setNotifHistory] = useState<NotifItem[]>([]);
	const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

	const copyTicket = (ticketNo: string) => {
		if (!ticketNo) return;
		navigator.clipboard.writeText(ticketNo).then(() => {
			setCopiedTicket(ticketNo);
			showToast(`Nomor tiket ${ticketNo} berhasil disalin ke clipboard!`, 'success');
			setTimeout(() => {
				setCopiedTicket((prev) => (prev === ticketNo ? null : prev));
			}, 2000);
		}).catch(() => {
			showToast('Gagal menyalin nomor tiket.', 'error');
		});
	};

	// Read URL query parameters (?jenis=...&status=...)
	const syncWithUrl = () => {
		if (typeof window === 'undefined') return;
		const params = new URLSearchParams(window.location.search);
		const j = params.get('jenis')?.toUpperCase();
		if (j === 'KEBERATAN' || j === 'PENGADUAN' || j === 'PERMOHONAN') {
			setActiveJenis(j);
		} else {
			setActiveJenis('PERMOHONAN');
		}

		const st = params.get('status')?.toUpperCase();
		if (st && ['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK'].includes(st)) {
			setStatusFilter(st);
		} else {
			setStatusFilter('Semua');
		}
	};

	const load = () => {
		setRefreshing(true);
		apiGet<{ items?: PermohonanItem[] }>('/admin/permohonan')
			.then((p) => setReqs(p?.items ?? []))
			.catch(() => setReqs([]))
			.finally(() => {
				setLoading(false);
				setRefreshing(false);
			});
	};

	useEffect(() => {
		syncWithUrl();
		load();

		const handlePop = () => syncWithUrl();
		window.addEventListener('popstate', handlePop);
		return () => window.removeEventListener('popstate', handlePop);
	}, []);

	const switchStatus = (st: string) => {
		setStatusFilter(st);
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			if (st === 'Semua') {
				url.searchParams.delete('status');
			} else {
				url.searchParams.set('status', st);
			}
			window.history.pushState({}, '', url.toString());
		}
	};

	const updateStatus = async () => {
		if (!selected || saving) return;
		setSaving(true);
		try {
			await apiSend(`/admin/permohonan/${selected.id}/status`, 'PATCH', { status: newStatus });
			showToast(`Status permohonan ${selected.tiket_no} berhasil diperbarui menjadi ${newStatus}.`, 'success');
			setSelected((prev) => (prev ? { ...prev, status: newStatus } : null));
			load();
		} catch (err) {
			showToast(err instanceof ApiError ? err.message : 'Gagal memperbarui status.', 'error');
		} finally {
			setSaving(false);
		}
	};

	const openDetail = (req: PermohonanItem) => {
		setSelected(req);
		setNewStatus(req.status);
		setNotifChannel('wa');

		// Generate contextual notification template
		let defaultMsg = `Halo Yth. ${req.nama},\n\n`;
		if (req.jenis === 'KEBERATAN') {
			defaultMsg += `Pengajuan keberatan informasi Anda dengan nomor tiket ${req.tiket_no} (terkait tiket ${req.tiket_terkait || '-'}) saat ini berstatus [${req.status}].\n\nTim PPID Kantor Kemenag Barito Utara sedang menindaklanjuti pengajuan Anda.`;
		} else if (req.jenis === 'PENGADUAN') {
			defaultMsg += `Laporan aspirasi/pengaduan Anda dengan nomor tiket ${req.tiket_no} saat ini berstatus [${req.status}].\n\nTerima kasih atas partisipasi Anda dalam meningkatkan kualitas layanan Kemenag Barito Utara.`;
		} else {
			defaultMsg += `Permohonan informasi publik Anda dengan nomor tiket ${req.tiket_no} saat ini berstatus [${req.status}].\n\nSilakan pantau perkembangan permohonan Anda melalui portal PPID Kemenag Barito Utara.`;
		}
		setNotifPesan(defaultMsg);
		setNotifHistory([]);

		apiGet<{ items?: NotifItem[] }>(`/admin/permohonan/${req.id}/notifikasi`)
			.then((p) => setNotifHistory(p?.items ?? []))
			.catch(() => setNotifHistory([]));
	};

	const sendNotif = async () => {
		if (!selected || !notifPesan || notifSending) return;
		setNotifSending(true);
		try {
			await apiSend(`/admin/permohonan/${selected.id}/notifikasi`, 'POST', {
				channel: notifChannel,
				pesan: notifPesan,
			});
			showToast(`Notifikasi ${notifChannel === 'wa' ? 'WhatsApp' : 'Email'} berhasil dicatat untuk ${selected.tiket_no}.`, 'success');
			const p = await apiGet<{ items?: NotifItem[] }>(`/admin/permohonan/${selected.id}/notifikasi`);
			setNotifHistory(p?.items ?? []);
		} catch (err) {
			showToast(err instanceof ApiError ? err.message : 'Gagal mengirim notifikasi.', 'error');
		} finally {
			setNotifSending(false);
		}
	};

	const openWhatsAppDirect = () => {
		if (!selected || !selected.phone) return;
		let cleanPhone = selected.phone.replace(/[^0-9]/g, '');
		if (cleanPhone.startsWith('0')) {
			cleanPhone = '62' + cleanPhone.slice(1);
		}
		const encodedText = encodeURIComponent(notifPesan);
		window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
	};

	// Filter rows by activeJenis, statusFilter, and search query
	const filtered = reqs.filter((r) => {
		const matchesJenis = r.jenis === activeJenis;
		const matchesStatus = statusFilter === 'Semua' || r.status === statusFilter;
		const hay = `${r.tiket_no} ${r.nama} ${r.nik} ${r.email} ${r.phone} ${r.rincian || ''} ${r.alasan || ''} ${r.tiket_terkait || ''}`.toLowerCase();
		return matchesJenis && matchesStatus && hay.includes(q.toLowerCase());
	});

	const meta = {
		PERMOHONAN: {
			badge: 'Layanan Permohonan Informasi',
			title: 'Permohonan Informasi Publik',
			desc: 'Tinjau, verifikasi, dan disposisi permohonan informasi publik dari masyarakat.',
			icon: FileText,
		},
		KEBERATAN: {
			badge: 'Layanan Keberatan Informasi',
			title: 'Pengajuan Keberatan Informasi',
			desc: 'Tinjau dan tindak lanjuti pengajuan keberatan atas permohonan informasi yang tidak dipenuhi.',
			icon: AlertTriangle,
		},
		PENGADUAN: {
			badge: 'Layanan Aspirasi & Pengaduan',
			title: 'Pengaduan Masyarakat',
			desc: 'Kelola keluhan, aduan pelayanan, dan aspirasi masyarakat kepada PPID Kemenag Barito Utara.',
			icon: MessageSquareWarning,
		},
	}[activeJenis];

	return (
		<div className="space-y-6 w-full max-w-none">
			<Toaster toasts={toasts} onRemove={removeToast} />

			{/* Page Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-[#007144] border border-emerald-500/20">
							{meta.badge}
						</span>
					</div>
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
						{meta.title}
					</h1>
					<p className="text-muted-foreground text-xs mt-1">
						{meta.desc}
					</p>
				</div>
				<button
					type="button"
					onClick={load}
					disabled={refreshing}
					className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-accent transition-all cursor-pointer disabled:opacity-50"
				>
					<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#007144]' : ''}`} />
					<span>Segarkan</span>
				</button>
			</div>

			{/* Table Toolbar & Search Bar */}
			<div className="rounded-2xl bg-card border border-border/60 shadow-xs overflow-hidden">
				<div className="border-b border-border/40 p-4 md:p-5">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-center gap-2.5">
							<span className="text-xs font-bold text-foreground">
								Daftar {meta.title}
							</span>
							{statusFilter !== 'Semua' ? (
								<div className="flex items-center gap-2">
									<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/10 text-[#007144] border border-emerald-500/20">
										Status: {STATUS_LABEL[statusFilter]?.label ?? statusFilter}
									</span>
									<button
										type="button"
										onClick={() => switchStatus('Semua')}
										className="text-[11px] text-muted-foreground hover:text-[#007144] underline cursor-pointer"
									>
										Tampilkan Semua
									</button>
								</div>
							) : (
								<span className="text-xs text-muted-foreground font-medium">
									({filtered.length} data)
								</span>
							)}
						</div>

						<div className="relative min-w-[280px]">
							<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
							<input
								type="text"
								placeholder={`Cari tiket, nama, kontak, rincian ${activeJenis.toLowerCase()}...`}
								value={q}
								onChange={(e) => setQ(e.target.value)}
								className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
							/>
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-border/60 bg-accent/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								<th className="py-3.5 px-6">Tiket &amp; Pemohon</th>
								{activeJenis === 'KEBERATAN' && <th className="py-3.5 px-6">Tiket Terkait</th>}
								<th className="py-3.5 px-6">Rincian &amp; Keterangan</th>
								<th className="py-3.5 px-6">Status</th>
								<th className="py-3.5 px-6">Tgl Masuk</th>
								<th className="py-3.5 px-6 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40 text-xs">
							{loading ? (
								<LoadingRows cols={activeJenis === 'KEBERATAN' ? 6 : 5} />
							) : filtered.length > 0 ? (
								filtered.map((r) => (
									<tr key={r.id} className="hover:bg-accent/20 transition-colors">
										<td className="py-4 px-6">
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-lg bg-emerald-500/10 text-[#007144] shrink-0">
													<meta.icon className="w-4 h-4" />
												</div>
												<div>
													<div className="flex items-center gap-1.5">
														<span className="font-bold text-foreground font-mono text-xs">{r.tiket_no}</span>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																copyTicket(r.tiket_no);
															}}
															className="p-1 rounded-md hover:bg-emerald-500/10 text-muted-foreground hover:text-[#007144] transition-all cursor-pointer group/copy"
															title={`Salin ${r.tiket_no}`}
														>
															{copiedTicket === r.tiket_no ? (
																<Check className="w-3.5 h-3.5 text-emerald-600" />
															) : (
																<Copy className="w-3.5 h-3.5 group-hover/copy:text-[#007144]" />
															)}
														</button>
													</div>
													<span className="text-[11px] text-foreground/90 font-medium block">{r.nama}</span>
													{r.phone && <span className="text-[10px] text-muted-foreground block">{r.phone}</span>}
												</div>
											</div>
										</td>

										{activeJenis === 'KEBERATAN' && (
											<td className="py-4 px-6 whitespace-nowrap">
												{r.tiket_terkait ? (
													<div className="flex items-center gap-1.5">
														<span className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/20">
															<Hash className="w-3 h-3" />
															{r.tiket_terkait}
														</span>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																copyTicket(r.tiket_terkait!);
															}}
															className="p-1 rounded-md hover:bg-amber-500/10 text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300 transition-all cursor-pointer group/copy"
															title={`Salin ${r.tiket_terkait}`}
														>
															{copiedTicket === r.tiket_terkait ? (
																<Check className="w-3.5 h-3.5 text-emerald-600" />
															) : (
																<Copy className="w-3.5 h-3.5 group-hover/copy:text-amber-700" />
															)}
														</button>
													</div>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</td>
										)}

										<td className="py-4 px-6 max-w-xs">
											{activeJenis === 'KEBERATAN' && r.alasan && (
												<span className="inline-block text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded mb-1 truncate max-w-full">
													{r.alasan}
												</span>
											)}
											<p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
												{r.rincian || '-'}
											</p>
											{r.tujuan && (
												<span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
													Tujuan: {r.tujuan}
												</span>
											)}
										</td>

										<td className="py-4 px-6 whitespace-nowrap">
											<StatusBadge status={r.status} />
										</td>

										<td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
											{fmtDate(r.created_at)}
										</td>

										<td className="py-4 px-6 text-right whitespace-nowrap">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													onClick={() => openDetail(r)}
													className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[#007144] hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer shadow-2xs"
													title="Tindak Lanjut &amp; Notifikasi"
												>
													<Eye className="w-4 h-4 text-[#007144]" />
												</button>
												<button
													type="button"
													onClick={() => setDeleteTarget(r)}
													className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:border-red-500/50 transition-all cursor-pointer shadow-2xs"
													title={`Hapus ${r.tiket_no} Permanen`}
												>
													<Trash2 className="w-4 h-4 text-red-600" />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={activeJenis === 'KEBERATAN' ? 6 : 5} className="py-16 text-center text-muted-foreground space-y-2">
										<p className="text-sm font-semibold">Tidak ada {meta.title.toLowerCase()} yang sesuai.</p>
										<p className="text-xs">Ubah kata kunci pencarian atau pilih tab status lain di atas.</p>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Detail & Action Drawer Modal */}
			{selected && (
				<div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
					<div className="bg-background border border-border/70 rounded-3xl w-full max-w-5xl lg:max-w-6xl shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden">
						{/* Modal Header (Fixed at Top) */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card select-none shrink-0">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[#007144] font-extrabold border border-emerald-500/25">
										{selected.tiket_no}
									</span>
									<button
										type="button"
										onClick={() => copyTicket(selected.tiket_no)}
										className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-[#007144] transition-all cursor-pointer group/copydrawer"
										title={`Salin ${selected.tiket_no}`}
									>
										{copiedTicket === selected.tiket_no ? (
											<Check className="w-4 h-4 text-emerald-600" />
										) : (
											<Copy className="w-4 h-4 group-hover/copydrawer:text-[#007144]" />
										)}
									</button>
								</div>
								<div className="hidden sm:block h-4 w-px bg-border/60" />
								<div>
									<h2 className="text-sm sm:text-base font-bold text-foreground truncate max-w-xs sm:max-w-md">
										{selected.nama}
									</h2>
									<p className="text-[11px] text-muted-foreground">
										Masuk: {fmtDate(selected.created_at)} • Jenis: {JENIS_LABEL[selected.jenis] ?? selected.jenis}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2.5">
								<StatusBadge status={selected.status} />
								<button
									type="button"
									onClick={() => setDeleteTarget(selected)}
									className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 cursor-pointer transition-colors shadow-2xs"
									title="Hapus Permohonan Permanen"
								>
									<Trash2 className="w-4 h-4 text-red-600" />
								</button>
								<button
									type="button"
									onClick={() => setSelected(null)}
									className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
									title="Tutup Modal"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Modal Scrollable Body: 2 Columns on Desktop */}
						<div className="flex-1 overflow-y-auto p-6 md:p-8">
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
								{/* Left Column: Data & Detail Permohonan (Col 7) */}
								<div className="lg:col-span-7 space-y-5">
									{/* Identity Grid */}
									<div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3.5 shadow-2xs">
										<div className="flex items-center justify-between border-b border-border/40 pb-2.5">
											<span className="text-xs font-bold text-foreground uppercase tracking-wider">
												Identitas Lengkap Pemohon
											</span>
											<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#007144]">
												Terverifikasi
											</span>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
											<div>
												<span className="text-muted-foreground block text-[10px] uppercase font-bold">Nama Pemohon</span>
												<span className="font-semibold text-foreground text-sm mt-0.5 block">{selected.nama}</span>
											</div>
											<div>
												<span className="text-muted-foreground block text-[10px] uppercase font-bold">NIK / No. Identitas</span>
												<span className="font-semibold font-mono text-foreground text-sm mt-0.5 block">{selected.nik || '-'}</span>
											</div>
											<div>
												<span className="text-muted-foreground block text-[10px] uppercase font-bold">Kontak HP / WhatsApp</span>
												<span className="font-semibold text-foreground mt-0.5 block">{selected.phone || '-'}</span>
											</div>
											<div>
												<span className="text-muted-foreground block text-[10px] uppercase font-bold">Alamat Email</span>
												<span className="font-semibold text-foreground mt-0.5 block break-all">{selected.email || '-'}</span>
											</div>
										</div>
									</div>

									{/* If KEBERATAN: show related ticket and objection reason */}
									{selected.jenis === 'KEBERATAN' && (
										<div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
											<div className="flex items-center justify-between">
												<span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
													Tiket Permohonan Yang Diajukan Keberatan
												</span>
												<div className="flex items-center gap-1.5">
													<span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200">
														{selected.tiket_terkait || 'Tidak disertakan'}
													</span>
													{selected.tiket_terkait && (
														<button
															type="button"
															onClick={() => copyTicket(selected.tiket_terkait!)}
															className="p-1 rounded hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 transition-all cursor-pointer"
															title={`Salin ${selected.tiket_terkait}`}
														>
															{copiedTicket === selected.tiket_terkait ? (
																<Check className="w-3.5 h-3.5 text-emerald-600" />
															) : (
																<Copy className="w-3.5 h-3.5" />
															)}
														</button>
													)}
												</div>
											</div>
											{selected.alasan && (
												<div>
													<span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block uppercase">
														Alasan Pengajuan Keberatan:
													</span>
													<p className="font-semibold text-foreground text-xs mt-1 leading-relaxed">{selected.alasan}</p>
												</div>
											)}
										</div>
									)}

									{/* Description & Purpose */}
									<div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-2xs">
										<div>
											<span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
												{selected.jenis === 'PENGADUAN' ? 'Isi Aduan / Aspirasi Masyarakat' : 'Rincian Informasi Yang Dibutuhkan'}
											</span>
											<div className="mt-2 p-3.5 rounded-xl bg-accent/30 border border-border/40 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-medium">
												{selected.rincian || '-'}
											</div>
										</div>
										{selected.tujuan && (
											<div className="pt-3 border-t border-border/30">
												<span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
													Tujuan Penggunaan Informasi
												</span>
												<p className="mt-1 text-xs text-foreground leading-relaxed font-medium">
													{selected.tujuan}
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Right Column: Actions & Notifications (Col 5) */}
								<div className="lg:col-span-5 space-y-5">
									{/* Status Update Control */}
									<div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3.5 shadow-2xs">
										<div className="flex items-center justify-between border-b border-border/40 pb-2.5">
											<span className="text-xs font-bold text-foreground uppercase tracking-wider">
												Perbarui Status Pelayanan
											</span>
											<StatusBadge status={selected.status} />
										</div>
										<p className="text-[11px] text-muted-foreground">
											Ubah tahapan penanganan untuk tiket ini. Pemohon dapat mengecek status terkini di portal lacak tiket.
										</p>
										<div className="space-y-3 pt-1">
											<ModernSelect
												value={newStatus}
												onChange={setNewStatus}
												options={STATUS_OPTIONS}
												placeholder="Pilih Status Pelayanan..."
											/>
											<button
												type="button"
												onClick={updateStatus}
												disabled={saving || newStatus === selected.status}
												className="w-full h-10 px-4 rounded-xl bg-[#007144] text-white text-xs font-bold hover:bg-[#005935] disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs"
											>
												{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
												<span>Simpan &amp; Terapkan Status</span>
											</button>
										</div>
									</div>

									{/* Notification Section */}
									<div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3.5 shadow-2xs">
										<div className="flex items-center justify-between border-b border-border/40 pb-2.5">
											<span className="font-bold text-foreground text-xs uppercase tracking-wider">
												Kirim &amp; Catat Notifikasi
											</span>
											{selected.phone && (
												<button
													type="button"
													onClick={openWhatsAppDirect}
													className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
													title="Buka WhatsApp Web di tab baru"
												>
													<ExternalLink className="w-3 h-3" /> WhatsApp Web
												</button>
											)}
										</div>

										<div className="grid grid-cols-2 gap-2">
											<button
												type="button"
												onClick={() => setNotifChannel('wa')}
												className={cn(
													'inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold transition-all border cursor-pointer',
													notifChannel === 'wa'
														? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
														: 'border-input text-muted-foreground hover:bg-accent',
												)}
											>
												<MessageCircle className="w-4 h-4" /> WhatsApp
											</button>
											<button
												type="button"
												onClick={() => setNotifChannel('email')}
												className={cn(
													'inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold transition-all border cursor-pointer',
													notifChannel === 'email'
														? 'bg-[#007144] text-white border-[#007144] shadow-2xs'
														: 'border-input text-muted-foreground hover:bg-accent',
												)}
											>
												<Mail className="w-4 h-4" /> Email
											</button>
										</div>

										<Field label="Isi Pesan Notifikasi">
											<textarea
												rows={4}
												value={notifPesan}
												onChange={(e) => setNotifPesan(e.target.value)}
												placeholder="Tulis pesan notifikasi resmi kepada pemohon..."
												className="w-full p-3.5 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-[#007144] focus:outline-hidden transition-all resize-none leading-relaxed"
											/>
										</Field>

										<button
											type="button"
											onClick={sendNotif}
											disabled={notifSending || !notifPesan}
											className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs transition-all"
										>
											{notifSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
											<span>Catat &amp; Arsipkan Riwayat Notifikasi</span>
										</button>

										{/* History list */}
										{notifHistory.length > 0 && (
											<div className="pt-2 border-t border-border/30">
												<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
													Riwayat Notifikasi Terkirim ({notifHistory.length})
												</span>
												<div className="space-y-2 max-h-40 overflow-y-auto pr-1">
													{notifHistory.map((n) => (
														<div key={n.id} className="rounded-xl border border-border/50 p-2.5 text-[11px] bg-accent/20">
															<div className="flex items-center justify-between mb-1">
																<span className="inline-flex items-center gap-1 font-bold text-foreground text-[10px]">
																	{n.channel === 'wa' ? (
																		<MessageCircle className="w-3 h-3 text-emerald-600" />
																	) : (
																		<Mail className="w-3 h-3 text-[#007144]" />
																	)}
																	{n.channel === 'wa' ? 'WhatsApp' : 'Email'}
																</span>
																<span className="text-muted-foreground font-mono text-[9px]">
																	{fmtDate(n.created_at)}
																</span>
															</div>
															<p className="text-muted-foreground whitespace-pre-wrap text-[11px] leading-relaxed">
																{n.pesan}
															</p>
															<span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/10 text-[#007144]">
																<CheckCircle2 className="w-2.5 h-2.5" /> {n.status ?? 'TERKIRIM'}
															</span>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Custom Deletion Confirmation Modal */}
			<DeleteConfirmModal
				target={deleteTarget}
				loading={deleting}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
}