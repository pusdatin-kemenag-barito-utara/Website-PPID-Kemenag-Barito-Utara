import { useEffect, useState } from 'react';
import {
	Search,
	FileText,
	Plus,
	X,
	Pencil,
	Trash2,
	Loader2,
	Eye,
} from 'lucide-react';
import { apiGet, apiSend, ApiError } from '@/lib/api-client';
import type { RegulasiItem } from './types';
import PdfViewerModal from './PdfViewerModal';
import {
	cn,
	Field,
	FileUploadField,
	LoadingRows,
	fmtDate,
	inputCls,
	ModernDatePicker,
	ModernSelect,
	useToast,
	Toaster,
} from './shared';

const REGULASI_SUBMENU: Record<string, { label: string; desc: string; categories: string[] }> = {
	'Undang-Undang': {
		label: 'Undang-Undang & Peraturan Pemerintah (PP)',
		desc: 'Arsip undang-undang nasional dan peraturan pemerintah terkait keterbukaan informasi dan tata kelola pelayanan publik.',
		categories: ['Undang-Undang', 'Peraturan Pemerintah'],
	},
	'Peraturan Menteri': {
		label: 'Peraturan & Keputusan Menteri (PMA/KMA)',
		desc: 'Arsip Peraturan Menteri Agama (PMA) dan Keputusan Menteri Agama (KMA) terkait pengelolaan informasi publik.',
		categories: ['Peraturan Menteri', 'Keputusan Menteri'],
	},
	'SK Kepala Kantor': {
		label: 'Surat Keputusan (SK) Tim PPID',
		desc: 'Surat Keputusan resmi Kepala Kantor Kemenag Kabupaten Barito Utara terkait pembentukan tim pengelola dan SOP PPID.',
		categories: ['SK Kepala Kantor'],
	},
};

export default function RegulasiSection() {
	const [items, setItems] = useState<RegulasiItem[]>([]);
	const [loading, setLoading] = useState(true);
	const { toasts, showToast, removeToast } = useToast();

	const [kategoriFilter, setKategoriFilter] = useState(() => {
		if (typeof window !== 'undefined') {
			return new URLSearchParams(window.location.search).get('kategori') ?? 'Semua';
		}
		return 'Semua';
	});
	const [q, setQ] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
	const [editing, setEditing] = useState<RegulasiItem | null>(null);
	const [form, setForm] = useState({
		nomor: '',
		tahun: '2026',
		judul: '',
		kategori: 'Undang-Undang',
		tgl_terbit: '',
		ukuran: '',
		keterangan: '',
		file_url: '',
		is_aktif: true,
	});
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);

	const load = () =>
		apiGet<{ items?: RegulasiItem[] }>('/admin/regulasi')
			.then((p) => setItems(p?.items ?? []))
			.catch(() => setItems([]))
			.finally(() => setLoading(false));

	useEffect(() => {
		load();
		const handleUrlChange = () => {
			const p = new URLSearchParams(window.location.search).get('kategori');
			setKategoriFilter(p ?? 'Semua');
		};
		window.addEventListener('popstate', handleUrlChange);
		return () => window.removeEventListener('popstate', handleUrlChange);
	}, []);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (saving) return;
		setSaving(true);
		try {
			if (editing) {
				await apiSend(`/admin/regulasi/${editing.id}`, 'PUT', form);
				showToast('Regulasi berhasil diperbarui.', 'success');
			} else {
				await apiSend('/admin/regulasi', 'POST', form);
				showToast('Regulasi berhasil ditambahkan.', 'success');
			}
			setModalOpen(false);
			setEditing(null);
			load();
		} catch (err) {
			showToast(err instanceof ApiError ? err.message : 'Gagal menyimpan regulasi.', 'error');
		} finally {
			setSaving(false);
		}
	};

	const remove = async (id: string) => {
		if (!window.confirm('Hapus regulasi ini? Tindakan tidak dapat dibatalkan.')) return;
		try {
			await apiSend(`/admin/regulasi/${id}`, 'DELETE');
			showToast('Regulasi berhasil dihapus.', 'success');
			load();
		} catch (err) {
			showToast(err instanceof ApiError ? err.message : 'Gagal menghapus regulasi.', 'error');
		}
	};

	const openEdit = (item: RegulasiItem) => {
		setEditing(item);
		setForm({
			nomor: item.nomor,
			tahun: item.tahun ?? '',
			judul: item.judul,
			kategori: item.kategori,
			tgl_terbit: item.tgl_terbit ?? '',
			ukuran: item.ukuran ?? '',
			keterangan: item.keterangan ?? '',
			file_url: item.file_url ?? '',
			is_aktif: item.is_aktif ?? true,
		});
		setModalOpen(true);
	};

	const openCreate = () => {
		setEditing(null);
		let defKat = 'Undang-Undang';
		if (kategoriFilter && kategoriFilter !== 'Semua') {
			const k = kategoriFilter.toLowerCase();
			if (k.includes('menteri') || k.includes('pma') || k.includes('kma')) defKat = 'Peraturan Menteri';
			else if (k.includes('sk') || k.includes('kantor') || k.includes('ppid')) defKat = 'SK Kepala Kantor';
		}
		setForm({
			nomor: '',
			tahun: new Date().getFullYear().toString(),
			judul: '',
			kategori: defKat,
			tgl_terbit: '',
			ukuran: '',
			keterangan: '',
			file_url: '',
			is_aktif: true,
		});
		setModalOpen(true);
	};

	const activeSubmenu = REGULASI_SUBMENU[kategoriFilter];

	const filtered = items.filter((it) => {
		let matchesKat = true;
		if (kategoriFilter && kategoriFilter !== 'Semua') {
			if (activeSubmenu) {
				matchesKat = activeSubmenu.categories.includes(it.kategori);
			} else {
				matchesKat = it.kategori.toLowerCase().includes(kategoriFilter.toLowerCase());
			}
		}
		const hay = `${it.judul} ${it.nomor} ${it.kategori} ${it.keterangan || ''}`.toLowerCase();
		return matchesKat && hay.includes(q.toLowerCase());
	});

	return (
		<div className="space-y-6 w-full max-w-none">
			{/* Page Header matching InformasiSection */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
						{activeSubmenu?.label ?? 'Regulasi & SK PPID'}
					</h1>
					<p className="text-muted-foreground text-xs mt-1">
						{activeSubmenu?.desc ?? 'Kelola arsip peraturan, undang-undang, PMA, KMA, dan SK PPID yang terbit di publik.'}
					</p>
				</div>
				<button
					onClick={openCreate}
					className="inline-flex items-center gap-2 bg-[#007144] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs shrink-0 cursor-pointer"
				>
					<Plus className="w-4 h-4" />
					<span>Tambah Regulasi Baru</span>
				</button>
			</div>

			{/* Count Badge & Search Bar */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
					<span>DAFTAR REGULASI:</span>
					<span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#007144] font-extrabold border border-[#007144]/20">
						{filtered.length} Dokumen
					</span>
				</div>

				<div className="relative w-full sm:w-80">
					<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						placeholder={`Cari di ${activeSubmenu?.label ? activeSubmenu.label.split('&')[0].trim() : 'Regulasi & SK'}...`}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
					/>
				</div>
			</div>

			{/* Regulations Table */}
			<div className="rounded-2xl bg-card border border-border/60 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-border/60 bg-accent/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								<th className="py-3.5 px-6">Nomor &amp; Judul Regulasi</th>
								<th className="py-3.5 px-6">Kategori</th>
								<th className="py-3.5 px-6">Tgl Terbit</th>
								<th className="py-3.5 px-6">Ukuran</th>
								<th className="py-3.5 px-6 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40 text-xs font-medium">
							{loading ? (
								<LoadingRows cols={5} />
							) : filtered.length > 0 ? (
								filtered.map((item) => (
									<tr key={item.id} className="hover:bg-accent/20 transition-colors">
										<td className="py-4 px-6">
											<div className="flex items-start gap-3">
												<div className="p-2 rounded-lg bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
													<FileText className="w-4 h-4" />
												</div>
												<div>
													<span className="font-bold text-foreground block">{item.nomor}</span>
													<p className="text-xs text-foreground/80 mt-0.5 line-clamp-2 max-w-xl">{item.judul}</p>
													{item.keterangan && <p className="text-[11px] text-muted-foreground mt-1 max-w-xl">{item.keterangan}</p>}
												</div>
											</div>
										</td>
										<td className="py-4 px-6 whitespace-nowrap">
											<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent/40 text-muted-foreground">
												{item.kategori}
											</span>
										</td>
										<td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
											{item.tgl_terbit || fmtDate(item.created_at)}
										</td>
										<td className="py-4 px-6 text-muted-foreground whitespace-nowrap">{item.ukuran || 'PDF'}</td>
										<td className="py-4 px-6 text-right whitespace-nowrap">
											<div className="flex items-center justify-end gap-1.5">
												{item.file_url ? (
													<button
														type="button"
														onClick={() => setPreviewDoc({ url: item.file_url!, title: `${item.nomor} - ${item.judul}` })}
														className="p-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer"
														title="Lihat / Pratinjau Dokumen (Mata)"
													>
														<Eye className="w-4 h-4" />
													</button>
												) : (
													<span className="text-[10px] text-muted-foreground italic mr-2">Tanpa Berkas</span>
												)}
												<button
													onClick={() => openEdit(item)}
													className="p-2 rounded-lg text-blue-600 hover:bg-blue-500/10 transition-colors cursor-pointer"
													title="Edit Regulasi"
												>
													<Pencil className="w-4 h-4" />
												</button>
												<button
													onClick={() => remove(item.id)}
													className="p-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
													title="Hapus Regulasi"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="py-12 text-center text-muted-foreground">
										Tidak ada dokumen regulasi yang ditemukan pada kategori ini.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Sleek, Compact 2-Column Upload Modal (No Scrolling) */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 md:p-5">
					<div className="bg-background border border-border/70 rounded-3xl p-6 md:p-7 max-w-4xl w-full shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between border-b border-border/50 pb-3.5 mb-4">
							<div>
								<h2 className="text-lg font-bold text-foreground">
									{editing ? 'Edit Dokumen Regulasi / SK' : 'Tambah Dokumen Regulasi / SK'}
								</h2>
								<p className="text-xs text-muted-foreground mt-0.5">
									Penyimpanan terhubung langsung ke Cloudflare R2 Bucket (<span className="text-[#007144] font-semibold">data-ppid/regulasi</span>)
								</p>
							</div>
							<button
								onClick={() => setModalOpen(false)}
								className="p-1.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={submit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
								{/* Kolom Kiri: Metadata Regulasi */}
								<div className="space-y-3">
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<div className="sm:col-span-2">
											<Field label="Nomor Peraturan / SK">
												<input type="text" required placeholder="Contoh: UU No. 14 Tahun 2008" value={form.nomor} onChange={(e) => setForm({ ...form, nomor: e.target.value })} className={inputCls} />
											</Field>
										</div>
										<Field label="Tahun">
											<input type="text" required placeholder="2026" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} className={inputCls} />
										</Field>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Field label="Kategori Regulasi">
											<ModernSelect
												value={form.kategori}
												onChange={(val) => setForm({ ...form, kategori: val })}
												options={[
													{ value: 'Undang-Undang', label: 'Undang-Undang' },
													{ value: 'Peraturan Pemerintah', label: 'Peraturan Pemerintah' },
													{ value: 'Peraturan Menteri', label: 'Peraturan Menteri (PMA)' },
													{ value: 'Keputusan Menteri', label: 'Keputusan Menteri (KMA)' },
													{ value: 'SK Kepala Kantor', label: 'SK Kepala Kantor (PPID)' },
												]}
											/>
										</Field>
										<Field label="Tgl Terbit / Penetapan">
											<ModernDatePicker
												value={form.tgl_terbit}
												onChange={(val) => setForm({ ...form, tgl_terbit: val })}
												placeholder="Pilih tanggal penetapan..."
											/>
										</Field>
									</div>

									<Field label="Judul Lengkap Peraturan">
										<textarea required rows={2} placeholder="Judul lengkap undang-undang atau SK..." value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full p-2.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all resize-none" />
									</Field>

									<Field label="Keterangan Ringkas">
										<input type="text" placeholder="Ringkasan penjelasan isi peraturan..." value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className={inputCls} />
									</Field>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-0.5">
										<Field label="Ukuran Berkas">
											<input type="text" placeholder="Otomatis saat upload" value={form.ukuran} onChange={(e) => setForm({ ...form, ukuran: e.target.value })} className={inputCls} />
										</Field>
										<div className="pt-4">
											<label className="flex items-center gap-2.5 cursor-pointer select-none">
												<button
													type="button"
													onClick={() => setForm({ ...form, is_aktif: !form.is_aktif })}
													className={cn('h-5 w-10 rounded-full transition-colors relative cursor-pointer shrink-0', form.is_aktif ? 'bg-[#007144]' : 'bg-border')}
												>
													<span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', form.is_aktif ? 'left-[22px]' : 'left-0.5')} />
												</button>
												<span className="text-xs font-bold text-foreground">
													{form.is_aktif ? 'Status: Aktif' : 'Status: Draf'}
												</span>
											</label>
										</div>
									</div>
								</div>

								{/* Kolom Kanan: Upload Berkas */}
								<div>
									<FileUploadField
										value={form.file_url}
										onChange={(url) => setForm((prev) => ({ ...prev, file_url: url }))}
										uploading={uploading}
										onUploadingChange={(v) => setUploading(v)}
										error=""
										onError={(msg) => { if (msg) showToast(msg, 'error'); }}
										folder="regulasi"
										onFileUploaded={({ size, name }) => {
											setForm((prev) => ({
												...prev,
												ukuran: size,
												judul: prev.judul && prev.judul.trim().length > 0 ? prev.judul : name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
											}));
										}}
										onPreview={(url) => setPreviewDoc({ url, title: form.judul || 'Pratinjau Regulasi' })}
										label="Unggah Berkas ke Folder R2 (regulasi)"
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-3.5 border-t border-border/50">
								<button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-accent transition-colors cursor-pointer">
									Batal
								</button>
								<button type="submit" disabled={saving || uploading} className="bg-[#007144] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs disabled:opacity-60 disabled:pointer-events-none inline-flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
									{saving ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>Menyimpan ke Database...</span>
										</>
									) : (
										<span>Simpan &amp; Publikasikan</span>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Bottom-Right Toaster */}
			<Toaster toasts={toasts} onRemove={removeToast} />

			{/* Floating PDF Document Viewer Modal */}
			<PdfViewerModal
				isOpen={!!previewDoc}
				onClose={() => setPreviewDoc(null)}
				url={previewDoc?.url ?? ''}
				title={previewDoc?.title}
			/>
		</div>
	);
}