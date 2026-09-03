import { useState, useEffect, useMemo } from 'react';
import {
	BarChart3,
	PieChart,
	Plus,
	Search,
	Edit,
	Trash2,
	Eye,
	X,
	ExternalLink,
	Loader2,
	CheckCircle2,
	AlertCircle,
	Image as ImageIcon,
	Tag,
	Calendar,
	Hash,
} from 'lucide-react';
import { apiGet, apiSend } from '@/lib/api-client';
import type { DataStatistikItem, DataInfografisItem } from './types';
import {
	cn,
	StatusBadge,
	FileUploadField,
} from './shared';

function ConfirmModal({
	isOpen,
	title,
	description,
	confirmText = 'Hapus',
	loading = false,
	onConfirm,
	onCancel,
}: {
	isOpen: boolean;
	title: string;
	description: string;
	confirmText?: string;
	loading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
			<div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
				<h3 className="font-extrabold text-base text-foreground">{title}</h3>
				<p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
				<div className="flex items-center justify-end gap-2.5 pt-2">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="px-4 py-2 rounded-xl border border-input bg-background hover:bg-accent text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
					>
						Batal
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer transition-all"
					>
						{loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
						<span>{confirmText}</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default function DataInformasiSection() {
	const [activeTab, setActiveTab] = useState<'statistik' | 'infografis'>('statistik');

	// Synchronize with URL query ?tab=...
	useEffect(() => {
		const syncTab = () => {
			if (typeof window !== 'undefined') {
				const params = new URLSearchParams(window.location.search);
				const tabParam = params.get('tab');
				if (tabParam === 'infografis') {
					setActiveTab('infografis');
				} else {
					setActiveTab('statistik');
				}
			}
		};
		syncTab();
		window.addEventListener('popstate', syncTab);
		return () => window.removeEventListener('popstate', syncTab);
	}, []);

	// ─── STATISTIK STATE ────────────────────────────────────────────────────────
	const [statistikList, setStatistikList] = useState<DataStatistikItem[]>([]);
	const [loadingStatistik, setLoadingStatistik] = useState(true);
	const [searchStatistik, setSearchStatistik] = useState('');
	const [kategoriStatistik, setKategoriStatistik] = useState('');

	// Modal Statistik
	const [isStatistikModalOpen, setIsStatistikModalOpen] = useState(false);
	const [editingStatistik, setEditingStatistik] = useState<DataStatistikItem | null>(null);
	const [savingStatistik, setSavingStatistik] = useState(false);
	const [formStatistik, setFormStatistik] = useState({
		label: '',
		nilai: '',
		satuan: '',
		kategori: 'Keagamaan',
		deskripsi: '',
		urutan: 1,
		is_aktif: true,
	});

	// Delete Statistik
	const [deleteStatistikItem, setDeleteStatistikItem] = useState<DataStatistikItem | null>(null);
	const [deletingStatistik, setDeletingStatistik] = useState(false);

	// ─── INFOGRAFIS STATE ───────────────────────────────────────────────────────
	const [infografisList, setInfografisList] = useState<DataInfografisItem[]>([]);
	const [loadingInfografis, setLoadingInfografis] = useState(true);
	const [searchInfografis, setSearchInfografis] = useState('');
	const [kategoriInfografis, setKategoriInfografis] = useState('');

	// Modal Infografis
	const [isInfografisModalOpen, setIsInfografisModalOpen] = useState(false);
	const [editingInfografis, setEditingInfografis] = useState<DataInfografisItem | null>(null);
	const [savingInfografis, setSavingInfografis] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [imageUploadError, setImageUploadError] = useState('');
	const [formInfografis, setFormInfografis] = useState({
		judul: '',
		kategori: 'Keagamaan',
		tanggal: '',
		deskripsi: '',
		image_url: '',
		is_aktif: true,
	});

	// Delete Infografis
	const [deleteInfografisItem, setDeleteInfografisItem] = useState<DataInfografisItem | null>(null);
	const [deletingInfografis, setDeletingInfografis] = useState(false);

	// Image Lightbox Preview
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
	const [previewImageTitle, setPreviewImageTitle] = useState<string>('');

	// Feedback Alert
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const showFeedback = (type: 'success' | 'error', message: string) => {
		setFeedback({ type, message });
		setTimeout(() => setFeedback(null), 4000);
	};

	// ─── FETCHING ───────────────────────────────────────────────────────────────
	const fetchStatistik = async () => {
		setLoadingStatistik(true);
		try {
			const res = await apiGet<{ items: DataStatistikItem[] }>('/admin/data-informasi/statistik');
			setStatistikList(res.items || []);
		} catch (err: any) {
			console.error('Failed to fetch statistik:', err);
			showFeedback('error', 'Gagal memuat data statistik.');
		} finally {
			setLoadingStatistik(false);
		}
	};

	const fetchInfografis = async () => {
		setLoadingInfografis(true);
		try {
			const res = await apiGet<{ items: DataInfografisItem[] }>('/admin/data-informasi/infografis');
			setInfografisList(res.items || []);
		} catch (err: any) {
			console.error('Failed to fetch infografis:', err);
			showFeedback('error', 'Gagal memuat data infografis.');
		} finally {
			setLoadingInfografis(false);
		}
	};

	useEffect(() => {
		fetchStatistik();
		fetchInfografis();
	}, []);

	// ─── STATISTIK HANDLERS ─────────────────────────────────────────────────────
	const handleOpenCreateStatistik = () => {
		setEditingStatistik(null);
		setFormStatistik({
			label: '',
			nilai: '',
			satuan: '',
			kategori: 'Keagamaan',
			deskripsi: '',
			urutan: statistikList.length + 1,
			is_aktif: true,
		});
		setIsStatistikModalOpen(true);
	};

	const handleOpenEditStatistik = (item: DataStatistikItem) => {
		setEditingStatistik(item);
		setFormStatistik({
			label: item.label,
			nilai: item.nilai,
			satuan: item.satuan,
			kategori: item.kategori,
			deskripsi: item.deskripsi || '',
			urutan: item.urutan || 1,
			is_aktif: item.is_aktif,
		});
		setIsStatistikModalOpen(true);
	};

	const handleSaveStatistik = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formStatistik.label.trim() || !formStatistik.nilai.trim() || !formStatistik.satuan.trim()) {
			showFeedback('error', 'Label, Nilai, dan Satuan wajib diisi.');
			return;
		}

		setSavingStatistik(true);
		try {
			if (editingStatistik) {
				await apiSend(`/admin/data-informasi/statistik/${editingStatistik.id}`, 'PUT', formStatistik);
				showFeedback('success', 'Data indikator statistik berhasil diperbarui.');
			} else {
				await apiSend('/admin/data-informasi/statistik', 'POST', formStatistik);
				showFeedback('success', 'Data indikator statistik baru berhasil ditambahkan.');
			}
			setIsStatistikModalOpen(false);
			fetchStatistik();
		} catch (err: any) {
			showFeedback('error', err.message || 'Gagal menyimpan data statistik.');
		} finally {
			setSavingStatistik(false);
		}
	};

	const handleDeleteStatistik = async () => {
		if (!deleteStatistikItem) return;
		setDeletingStatistik(true);
		try {
			await apiSend(`/admin/data-informasi/statistik/${deleteStatistikItem.id}`, 'DELETE');
			showFeedback('success', 'Data indikator statistik berhasil dihapus.');
			setDeleteStatistikItem(null);
			fetchStatistik();
		} catch (err: any) {
			showFeedback('error', err.message || 'Gagal menghapus data statistik.');
		} finally {
			setDeletingStatistik(false);
		}
	};

	// ─── INFOGRAFIS HANDLERS ────────────────────────────────────────────────────
	const handleOpenCreateInfografis = () => {
		setEditingInfografis(null);
		setFormInfografis({
			judul: '',
			kategori: 'Keagamaan',
			tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
			deskripsi: '',
			image_url: '',
			is_aktif: true,
		});
		setImageUploadError('');
		setIsInfografisModalOpen(true);
	};

	const handleOpenEditInfografis = (item: DataInfografisItem) => {
		setEditingInfografis(item);
		setFormInfografis({
			judul: item.judul,
			kategori: item.kategori,
			tanggal: item.tanggal,
			deskripsi: item.deskripsi || '',
			image_url: item.image_url,
			is_aktif: item.is_aktif,
		});
		setImageUploadError('');
		setIsInfografisModalOpen(true);
	};

	const handleSaveInfografis = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formInfografis.judul.trim()) {
			showFeedback('error', 'Judul infografis wajib diisi.');
			return;
		}
		if (!formInfografis.image_url.trim()) {
			showFeedback('error', 'Gambar poster infografis wajib diunggah.');
			return;
		}

		setSavingInfografis(true);
		try {
			if (editingInfografis) {
				await apiSend(`/admin/data-informasi/infografis/${editingInfografis.id}`, 'PUT', formInfografis);
				showFeedback('success', 'Data infografis berhasil diperbarui.');
			} else {
				await apiSend('/admin/data-informasi/infografis', 'POST', formInfografis);
				showFeedback('success', 'Infografis baru berhasil ditambahkan.');
			}
			setIsInfografisModalOpen(false);
			fetchInfografis();
		} catch (err: any) {
			showFeedback('error', err.message || 'Gagal menyimpan infografis.');
		} finally {
			setSavingInfografis(false);
		}
	};

	const handleDeleteInfografis = async () => {
		if (!deleteInfografisItem) return;
		setDeletingInfografis(true);
		try {
			await apiSend(`/admin/data-informasi/infografis/${deleteInfografisItem.id}`, 'DELETE');
			showFeedback('success', 'Data infografis berhasil dihapus.');
			setDeleteInfografisItem(null);
			fetchInfografis();
		} catch (err: any) {
			showFeedback('error', err.message || 'Gagal menghapus data infografis.');
		} finally {
			setDeletingInfografis(false);
		}
	};

	// ─── FILTERED LISTS ─────────────────────────────────────────────────────────
	const filteredStatistik = useMemo(() => {
		return statistikList.filter((item) => {
			const matchSearch =
				item.label.toLowerCase().includes(searchStatistik.toLowerCase()) ||
				(item.deskripsi && item.deskripsi.toLowerCase().includes(searchStatistik.toLowerCase()));
			const matchKategori = !kategoriStatistik || item.kategori === kategoriStatistik;
			return matchSearch && matchKategori;
		});
	}, [statistikList, searchStatistik, kategoriStatistik]);

	const filteredInfografis = useMemo(() => {
		return infografisList.filter((item) => {
			const matchSearch =
				item.judul.toLowerCase().includes(searchInfografis.toLowerCase()) ||
				(item.deskripsi && item.deskripsi.toLowerCase().includes(searchInfografis.toLowerCase()));
			const matchKategori = !kategoriInfografis || item.kategori === kategoriInfografis;
			return matchSearch && matchKategori;
		});
	}, [infografisList, searchInfografis, kategoriInfografis]);

	const inputCls =
		'w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-[#007144] focus:outline-hidden transition-all';
	const labelCls = 'block text-xs font-bold text-foreground mb-1.5';

	return (
		<div className="space-y-6 animate-in fade-in duration-200">
			{/* Header Banner */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-5 sm:p-6 rounded-2xl shadow-xs">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-[#007144] font-extrabold text-xs uppercase tracking-wider">
						{activeTab === 'statistik' ? (
							<>
								<BarChart3 className="w-4 h-4" />
								<span>DATA &amp; STATISTIK KEMENAG</span>
							</>
						) : (
							<>
								<PieChart className="w-4 h-4" />
								<span>PUBLIKASI VISUAL KEMENAG</span>
							</>
						)}
					</div>
					<h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
						{activeTab === 'statistik' ? 'Indikator Data Statistik' : 'Infografis Keagamaan'}
					</h1>
					<p className="text-xs text-muted-foreground max-w-2xl">
						{activeTab === 'statistik'
							? 'Kelola indikator statistik capaian keagamaan dan layanan publik Kemenag Kabupaten Barito Utara.'
							: 'Kelola dan publikasikan materi infografis visual keagamaan pada portal publik Kemenag Kabupaten Barito Utara.'}
					</p>
				</div>

				{/* Primary Add Button */}
				<div className="shrink-0">
					{activeTab === 'statistik' ? (
						<button
							type="button"
							onClick={handleOpenCreateStatistik}
							className="bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
						>
							<Plus className="w-4 h-4" />
							<span>Tambah Indikator Statistik</span>
						</button>
					) : (
						<button
							type="button"
							onClick={handleOpenCreateInfografis}
							className="bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
						>
							<Plus className="w-4 h-4" />
							<span>Tambah Infografis Baru</span>
						</button>
					)}
				</div>
			</div>

			{/* Feedback Notification */}
			{feedback && (
				<div
					className={cn(
						'p-4 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2',
						feedback.type === 'success'
							? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
							: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
					)}
				>
					{feedback.type === 'success' ? (
						<CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
					) : (
						<AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
					)}
					<span>{feedback.message}</span>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════════════
			    TAB 1: INDIKATOR DATA STATISTIK
			   ═══════════════════════════════════════════════════════════════════════ */}
			{activeTab === 'statistik' && (
				<div className="space-y-4">
					{/* Search & Filter Bar */}
					<div className="flex flex-col sm:flex-row items-center gap-3">
						<div className="relative flex-1 w-full">
							<Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder="Cari label indikator atau deskripsi statistik..."
								value={searchStatistik}
								onChange={(e) => setSearchStatistik(e.target.value)}
								className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:ring-2 focus:ring-[#007144] focus:outline-hidden"
							/>
						</div>
						<select
							value={kategoriStatistik}
							onChange={(e) => setKategoriStatistik(e.target.value)}
							className="px-3.5 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:ring-2 focus:ring-[#007144] focus:outline-hidden cursor-pointer w-full sm:w-auto"
						>
							<option value="">Semua Kategori</option>
							<option value="Keagamaan">Keagamaan</option>
							<option value="Pendidikan">Pendidikan</option>
							<option value="Layanan KUA">Layanan KUA</option>
							<option value="PPID">PPID</option>
						</select>
					</div>

					{/* Statistik Table */}
					<div className="bg-card border border-border/60 rounded-2xl shadow-xs overflow-hidden">
						<div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
							<h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
								Daftar Indikator Statistik ({filteredStatistik.length})
							</h3>
						</div>

						{loadingStatistik ? (
							<div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
								<Loader2 className="w-6 h-6 animate-spin text-[#007144]" />
								<span className="text-xs">Memuat data statistik...</span>
							</div>
						) : filteredStatistik.length === 0 ? (
							<div className="py-16 text-center text-muted-foreground text-xs">
								Tidak ada data statistik yang sesuai kriteria pencarian.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs border-collapse">
									<thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider">
										<tr>
											<th className="py-3 px-4 w-12 text-center">Urutan</th>
											<th className="py-3 px-4">Indikator &amp; Deskripsi</th>
											<th className="py-3 px-4">Nilai &amp; Satuan</th>
											<th className="py-3 px-4">Kategori</th>
											<th className="py-3 px-4 text-center">Status</th>
											<th className="py-3 px-4 text-center w-28">Aksi</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/40">
										{filteredStatistik.map((item) => (
											<tr key={item.id} className="hover:bg-muted/20 transition-colors">
												<td className="py-3.5 px-4 text-center font-mono font-bold text-muted-foreground">
													#{item.urutan}
												</td>
												<td className="py-3.5 px-4 max-w-xs sm:max-w-md">
													<p className="font-bold text-foreground text-xs">{item.label}</p>
													<p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
														{item.deskripsi || '-'}
													</p>
												</td>
												<td className="py-3.5 px-4 whitespace-nowrap">
													<div className="flex items-baseline gap-1.5">
														<span className="text-base font-black text-[#007144]">
															{item.nilai}
														</span>
														<span className="text-[11px] font-semibold text-muted-foreground">
															{item.satuan}
														</span>
													</div>
												</td>
												<td className="py-3.5 px-4 whitespace-nowrap">
													<span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#007144]">
														{item.kategori}
													</span>
												</td>
												<td className="py-3.5 px-4 text-center whitespace-nowrap">
													<StatusBadge status={item.is_aktif ? 'DITERIMA' : 'DITOLAK'} />
												</td>
												<td className="py-3.5 px-4 text-center whitespace-nowrap">
													<div className="flex items-center justify-center gap-1.5">
														<button
															type="button"
															onClick={() => handleOpenEditStatistik(item)}
															className="p-1.5 rounded-lg border border-border/60 hover:bg-emerald-500/10 hover:text-[#007144] hover:border-emerald-500/30 transition-all cursor-pointer"
															title="Edit Indikator"
														>
															<Edit className="w-3.5 h-3.5" />
														</button>
														<button
															type="button"
															onClick={() => setDeleteStatistikItem(item)}
															className="p-1.5 rounded-lg border border-border/60 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 transition-all cursor-pointer"
															title="Hapus Indikator"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════════════
			    TAB 2: INFOGRAFIS KEAGAMAAN
			   ═══════════════════════════════════════════════════════════════════════ */}
			{activeTab === 'infografis' && (
				<div className="space-y-4">
					{/* Search & Filter Bar */}
					<div className="flex flex-col sm:flex-row items-center gap-3">
						<div className="relative flex-1 w-full">
							<Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder="Cari judul infografis atau deskripsi..."
								value={searchInfografis}
								onChange={(e) => setSearchInfografis(e.target.value)}
								className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:ring-2 focus:ring-[#007144] focus:outline-hidden"
							/>
						</div>
						<select
							value={kategoriInfografis}
							onChange={(e) => setKategoriInfografis(e.target.value)}
							className="px-3.5 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:ring-2 focus:ring-[#007144] focus:outline-hidden cursor-pointer w-full sm:w-auto"
						>
							<option value="">Semua Kategori</option>
							<option value="Keagamaan">Keagamaan</option>
							<option value="Pendidikan">Pendidikan</option>
							<option value="Layanan KUA">Layanan KUA</option>
							<option value="Haji &amp; Umrah">Haji &amp; Umrah</option>
						</select>
					</div>

					{/* Infografis Table / Grid */}
					<div className="bg-card border border-border/60 rounded-2xl shadow-xs overflow-hidden">
						<div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
							<h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
								Daftar Infografis Keagamaan ({filteredInfografis.length})
							</h3>
						</div>

						{loadingInfografis ? (
							<div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
								<Loader2 className="w-6 h-6 animate-spin text-[#007144]" />
								<span className="text-xs">Memuat infografis...</span>
							</div>
						) : filteredInfografis.length === 0 ? (
							<div className="py-16 text-center text-muted-foreground text-xs">
								Tidak ada infografis yang sesuai kriteria pencarian.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs border-collapse">
									<thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider">
										<tr>
											<th className="py-3 px-4 w-20 text-center">Gambar</th>
											<th className="py-3 px-4">Judul &amp; Deskripsi</th>
											<th className="py-3 px-4">Kategori &amp; Tanggal</th>
											<th className="py-3 px-4 text-center">Status</th>
											<th className="py-3 px-4 text-center w-32">Aksi</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/40">
										{filteredInfografis.map((item) => (
											<tr key={item.id} className="hover:bg-muted/20 transition-colors">
												<td className="py-3.5 px-4 text-center">
													<div
														onClick={() => {
															setPreviewImageUrl(item.image_url);
															setPreviewImageTitle(item.judul);
														}}
														className="w-14 h-14 rounded-lg bg-accent/40 border border-border/60 overflow-hidden relative group cursor-pointer mx-auto flex items-center justify-center"
														title="Klik untuk melihat poster penuh"
													>
														<img
															src={item.image_url}
															alt={item.judul}
															className="w-full h-full object-cover group-hover:scale-110 transition-transform"
														/>
														<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
															<Eye className="w-3.5 h-3.5 text-white" />
														</div>
													</div>
												</td>
												<td className="py-3.5 px-4 max-w-sm sm:max-w-md">
													<p className="font-bold text-foreground text-xs leading-snug">{item.judul}</p>
													<p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
														{item.deskripsi || '-'}
													</p>
												</td>
												<td className="py-3.5 px-4 whitespace-nowrap">
													<div className="space-y-1">
														<span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#007144] inline-block">
															{item.kategori}
														</span>
														<p className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
															<Calendar className="w-3 h-3" />
															{item.tanggal}
														</p>
													</div>
												</td>
												<td className="py-3.5 px-4 text-center whitespace-nowrap">
													<StatusBadge status={item.is_aktif ? 'DITERIMA' : 'DITOLAK'} />
												</td>
												<td className="py-3.5 px-4 text-center whitespace-nowrap">
													<div className="flex items-center justify-center gap-1.5">
														<button
															type="button"
															onClick={() => {
																setPreviewImageUrl(item.image_url);
																setPreviewImageTitle(item.judul);
															}}
															className="p-1.5 rounded-lg border border-border/60 hover:bg-emerald-500/10 hover:text-[#007144] hover:border-emerald-500/30 transition-all cursor-pointer"
															title="Pratinjau Gambar Penuh"
														>
															<Eye className="w-3.5 h-3.5" />
														</button>
														<button
															type="button"
															onClick={() => handleOpenEditInfografis(item)}
															className="p-1.5 rounded-lg border border-border/60 hover:bg-emerald-500/10 hover:text-[#007144] hover:border-emerald-500/30 transition-all cursor-pointer"
															title="Edit Infografis"
														>
															<Edit className="w-3.5 h-3.5" />
														</button>
														<button
															type="button"
															onClick={() => setDeleteInfografisItem(item)}
															className="p-1.5 rounded-lg border border-border/60 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 transition-all cursor-pointer"
															title="Hapus Infografis"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════════════
			    MODAL 1: FORM STATISTIK (2-Column Sleek Dialog)
			   ═══════════════════════════════════════════════════════════════════════ */}
			{isStatistikModalOpen && (
				<div className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
					<div className="bg-card border border-border/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
						<div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
							<div className="flex items-center gap-2">
								<BarChart3 className="w-5 h-5 text-[#007144]" />
								<h3 className="font-extrabold text-sm text-foreground">
									{editingStatistik ? 'Edit Indikator Statistik' : 'Tambah Indikator Statistik'}
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setIsStatistikModalOpen(false)}
								className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						<form onSubmit={handleSaveStatistik} className="p-6 space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="sm:col-span-2">
									<label className={labelCls}>Label Indikator *</label>
									<input
										type="text"
										required
										placeholder="contoh: Jumlah Rumah Ibadah"
										value={formStatistik.label}
										onChange={(e) => setFormStatistik({ ...formStatistik, label: e.target.value })}
										className={inputCls}
									/>
								</div>

								<div>
									<label className={labelCls}>Nilai Angka *</label>
									<input
										type="text"
										required
										placeholder="contoh: 142 atau 98.5%"
										value={formStatistik.nilai}
										onChange={(e) => setFormStatistik({ ...formStatistik, nilai: e.target.value })}
										className={inputCls}
									/>
								</div>

								<div>
									<label className={labelCls}>Satuan *</label>
									<input
										type="text"
										required
										placeholder="contoh: Lokasi, Lembaga, Dokumen"
										value={formStatistik.satuan}
										onChange={(e) => setFormStatistik({ ...formStatistik, satuan: e.target.value })}
										className={inputCls}
									/>
								</div>

								<div>
									<label className={labelCls}>Kategori Sektor *</label>
									<select
										value={formStatistik.kategori}
										onChange={(e) => setFormStatistik({ ...formStatistik, kategori: e.target.value })}
										className={inputCls}
									>
										<option value="Keagamaan">Keagamaan</option>
										<option value="Pendidikan">Pendidikan</option>
										<option value="Layanan KUA">Layanan KUA</option>
										<option value="PPID">PPID</option>
										<option value="Bimmas Islam">Bimmas Islam</option>
										<option value="Haji &amp; Umrah">Haji &amp; Umrah</option>
									</select>
								</div>

								<div>
									<label className={labelCls}>Urutan Tampil (No)</label>
									<input
										type="number"
										min="1"
										value={formStatistik.urutan}
										onChange={(e) => setFormStatistik({ ...formStatistik, urutan: Number(e.target.value) })}
										className={inputCls}
									/>
								</div>

								<div className="sm:col-span-2">
									<label className={labelCls}>Keterangan / Deskripsi Singkat</label>
									<textarea
										rows={2}
										placeholder="contoh: Mesjid, Musholla, Gereja terdaftar di Barito Utara"
										value={formStatistik.deskripsi}
										onChange={(e) => setFormStatistik({ ...formStatistik, deskripsi: e.target.value })}
										className={inputCls}
									/>
								</div>

								<div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40">
									<div className="space-y-0.5">
										<p className="text-xs font-bold text-foreground">Status Aktif</p>
										<p className="text-[11px] text-muted-foreground">Tampilkan indikator ini di portal publik</p>
									</div>
									<input
										type="checkbox"
										checked={formStatistik.is_aktif}
										onChange={(e) => setFormStatistik({ ...formStatistik, is_aktif: e.target.checked })}
										className="w-4 h-4 rounded text-[#007144] focus:ring-[#007144] cursor-pointer"
									/>
								</div>
							</div>

							<div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
								<button
									type="button"
									onClick={() => setIsStatistikModalOpen(false)}
									className="px-4 py-2.5 rounded-xl border border-input bg-background hover:bg-accent text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={savingStatistik}
									className="bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs disabled:opacity-60 disabled:pointer-events-none inline-flex items-center gap-2 cursor-pointer transition-all"
								>
									{savingStatistik && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
									<span>{editingStatistik ? 'Simpan Perubahan' : 'Tambah Indikator'}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════════════
			    MODAL 2: FORM INFOGRAFIS (2-Column Upload Dialog)
			   ═══════════════════════════════════════════════════════════════════════ */}
			{isInfografisModalOpen && (
				<div className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
					<div className="bg-card border border-border/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
						<div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
							<div className="flex items-center gap-2">
								<PieChart className="w-5 h-5 text-[#007144]" />
								<h3 className="font-extrabold text-sm text-foreground">
									{editingInfografis ? 'Edit Infografis' : 'Tambah Infografis Keagamaan'}
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setIsInfografisModalOpen(false)}
								className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						<form onSubmit={handleSaveInfografis} className="p-6 space-y-4 overflow-y-auto flex-1">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Kolom Kiri: Metadata Infografis */}
								<div className="space-y-4">
									<div>
										<label className={labelCls}>Judul Infografis *</label>
										<input
											type="text"
											required
											placeholder="contoh: Peta Sebaran Rumah Ibadah 2026"
											value={formInfografis.judul}
											onChange={(e) => setFormInfografis({ ...formInfografis, judul: e.target.value })}
											className={inputCls}
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className={labelCls}>Kategori Sektor *</label>
											<select
												value={formInfografis.kategori}
												onChange={(e) => setFormInfografis({ ...formInfografis, kategori: e.target.value })}
												className={inputCls}
											>
												<option value="Keagamaan">Keagamaan</option>
												<option value="Pendidikan">Pendidikan</option>
												<option value="Layanan KUA">Layanan KUA</option>
												<option value="Haji &amp; Umrah">Haji &amp; Umrah</option>
												<option value="Layanan Publik">Layanan Publik</option>
											</select>
										</div>

										<div>
											<label className={labelCls}>Tanggal Terbit *</label>
											<input
												type="text"
												placeholder="contoh: 15 Jan 2026"
												value={formInfografis.tanggal}
												onChange={(e) => setFormInfografis({ ...formInfografis, tanggal: e.target.value })}
												className={inputCls}
											/>
										</div>
									</div>

									<div>
										<label className={labelCls}>Deskripsi Penjelasan</label>
										<textarea
											rows={4}
											placeholder="Tuliskan ringkasan data atau poin utama yang disajikan dalam infografis..."
											value={formInfografis.deskripsi}
											onChange={(e) => setFormInfografis({ ...formInfografis, deskripsi: e.target.value })}
											className={inputCls}
										/>
									</div>

									<div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40">
										<div className="space-y-0.5">
											<p className="text-xs font-bold text-foreground">Status Publikasi</p>
											<p className="text-[11px] text-muted-foreground">Tampilkan di halaman publik</p>
										</div>
										<input
											type="checkbox"
											checked={formInfografis.is_aktif}
											onChange={(e) => setFormInfografis({ ...formInfografis, is_aktif: e.target.checked })}
											className="w-4 h-4 rounded text-[#007144] focus:ring-[#007144] cursor-pointer"
										/>
									</div>
								</div>

								{/* Kolom Kanan: Upload Gambar Infografis */}
								<div className="space-y-4">
									<FileUploadField
										label="File Poster / Gambar Infografis"
										value={formInfografis.image_url}
										onChange={(url) => setFormInfografis({ ...formInfografis, image_url: url })}
										uploading={uploadingImage}
										onUploadingChange={setUploadingImage}
										error={imageUploadError}
										onError={setImageUploadError}
										folder="infografis"
										onPreview={(url) => {
											setPreviewImageUrl(url);
											setPreviewImageTitle(formInfografis.judul || 'Pratinjau Poster');
										}}
									/>

									{/* Image Live Preview */}
									{formInfografis.image_url && (
										<div className="rounded-xl border border-border/60 overflow-hidden bg-accent/20 p-2 text-center">
											<img
												src={formInfografis.image_url}
												alt="Pratinjau"
												className="max-h-44 w-auto mx-auto object-contain rounded-lg"
											/>
										</div>
									)}
								</div>
							</div>

							<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
								<button
									type="button"
									onClick={() => setIsInfografisModalOpen(false)}
									className="px-4 py-2.5 rounded-xl border border-input bg-background hover:bg-accent text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={savingInfografis || uploadingImage}
									className="bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs disabled:opacity-60 disabled:pointer-events-none inline-flex items-center gap-2 cursor-pointer transition-all"
								>
									{savingInfografis && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
									<span>{editingInfografis ? 'Simpan Perubahan' : 'Tambah Infografis'}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════════════
			    MODAL 3: IMAGE LIGHTBOX PREVIEW
			   ═══════════════════════════════════════════════════════════════════════ */}
			{previewImageUrl && (
				<div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
					<div className="bg-card border border-border/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20 shrink-0">
							<h4 className="text-xs font-bold text-foreground truncate max-w-md">
								{previewImageTitle || 'Pratinjau Gambar Infografis'}
							</h4>
							<div className="flex items-center gap-2">
								<a
									href={previewImageUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-input bg-background hover:bg-accent text-xs font-semibold text-foreground transition-colors"
								>
									<ExternalLink className="w-3.5 h-3.5" />
									<span>Buka Tab Baru</span>
								</a>
								<button
									type="button"
									onClick={() => setPreviewImageUrl(null)}
									className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						</div>
						<div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950">
							<img
								src={previewImageUrl}
								alt={previewImageTitle}
								className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Confirm Delete Modals */}
			<ConfirmModal
				isOpen={!!deleteStatistikItem}
				title="Hapus Indikator Statistik"
				description={`Apakah Anda yakin ingin menghapus indikator "${deleteStatistikItem?.label}"? Tindakan ini tidak dapat dibatalkan.`}
				confirmText="Hapus Indikator"
				loading={deletingStatistik}
				onConfirm={handleDeleteStatistik}
				onCancel={() => setDeleteStatistikItem(null)}
			/>

			<ConfirmModal
				isOpen={!!deleteInfografisItem}
				title="Hapus Infografis"
				description={`Apakah Anda yakin ingin menghapus infografis "${deleteInfografisItem?.judul}"? Tindakan ini tidak dapat dibatalkan.`}
				confirmText="Hapus Infografis"
				loading={deletingInfografis}
				onConfirm={handleDeleteInfografis}
				onCancel={() => setDeleteInfografisItem(null)}
			/>
		</div>
	);
}
