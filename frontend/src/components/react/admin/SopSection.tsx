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
	CheckCircle2,
	ExternalLink,
} from 'lucide-react';
import { apiGet, apiSend, ApiError } from '@/lib/api-client';
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

export interface AdminSopItem {
	id: string;
	judul: string;
	no_sop: string;
	kategori: string;
	tgl_terbit: string;
	ukuran: string;
	keterangan?: string;
	file_url: string;
	urutan: number;
	is_aktif: boolean;
	created_at?: string;
	updated_at?: string;
}

const KATEGORI_OPTIONS = [
	{ value: 'Permohonan Informasi', label: 'SOP Permohonan Informasi' },
	{ value: 'Pengajuan Keberatan', label: 'SOP Penanganan Keberatan' },
	{ value: 'Informasi Dikecualikan', label: 'SOP Informasi Dikecualikan' },
	{ value: 'Pengaduan Masyarakat', label: 'SOP Pengaduan Masyarakat' },
	{ value: 'Umum & Tata Kelola', label: 'SOP Umum & Tata Kelola' },
];

export default function SopSection() {
	const [items, setItems] = useState<AdminSopItem[]>([]);
	const [loading, setLoading] = useState(true);
	const { toasts, showToast, removeToast } = useToast();

	const [kategoriFilter, setKategoriFilter] = useState(() => {
		if (typeof window !== 'undefined') {
			return new URLSearchParams(window.location.search).get('kategori') ?? 'Permohonan Informasi';
		}
		return 'Permohonan Informasi';
	});
	const [q, setQ] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
	const [editing, setEditing] = useState<AdminSopItem | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [form, setForm] = useState({
		judul: '',
		no_sop: '',
		kategori: 'Permohonan Informasi',
		tgl_terbit: '',
		ukuran: '',
		keterangan: '',
		file_url: '',
		urutan: 1,
		is_aktif: true,
	});
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);

	const load = () => {
		setLoading(true);
		apiGet<{ items?: AdminSopItem[] }>('/admin/sop')
			.then((p) => setItems(p?.items ?? []))
			.catch(() => setItems([]))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
		const handleUrlChange = () => {
			const p = new URLSearchParams(window.location.search).get('kategori');
			setKategoriFilter(p ?? 'Permohonan Informasi');
		};
		window.addEventListener('popstate', handleUrlChange);
		return () => window.removeEventListener('popstate', handleUrlChange);
	}, []);

	const openCreate = () => {
		setEditing(null);
		setForm({
			judul: '',
			no_sop: `SOP/PPID/00${items.length + 1}/2026`,
			kategori: kategoriFilter,
			tgl_terbit: new Date().toLocaleDateString('id-ID', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			}),
			ukuran: '1.2 MB',
			keterangan: '',
			file_url: '',
			urutan: items.length + 1,
			is_aktif: true,
		});
		setModalOpen(true);
	};

	const openEdit = (item: AdminSopItem) => {
		setEditing(item);
		setForm({
			judul: item.judul,
			no_sop: item.no_sop,
			kategori: item.kategori || kategoriFilter,
			tgl_terbit: item.tgl_terbit,
			ukuran: item.ukuran || '1.0 MB',
			keterangan: item.keterangan || '',
			file_url: item.file_url || '',
			urutan: item.urutan || 1,
			is_aktif: item.is_aktif,
		});
		setModalOpen(true);
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (saving) return;
		setSaving(true);
		try {
			if (editing) {
				await apiSend(`/admin/sop/${editing.id}`, 'PUT', form);
				showToast('Dokumen SOP berhasil diperbarui.', 'success');
			} else {
				await apiSend('/admin/sop', 'POST', form);
				showToast('Dokumen SOP baru berhasil ditambahkan.', 'success');
			}
			setModalOpen(false);
			load();
		} catch (err) {
			showToast(
				err instanceof ApiError ? err.message : 'Gagal menyimpan dokumen SOP.',
				'error',
			);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await apiSend(`/admin/sop/${id}`, 'DELETE');
			showToast('Dokumen SOP berhasil dihapus.', 'success');
			setDeletingId(null);
			load();
		} catch (err) {
			showToast(
				err instanceof ApiError ? err.message : 'Gagal menghapus dokumen SOP.',
				'error',
			);
		}
	};

	const filtered = items.filter((it) => {
		const matchCat = !kategoriFilter || it.kategori === kategoriFilter;
		const query = q.toLowerCase();
		const matchQ =
			!query ||
			it.judul.toLowerCase().includes(query) ||
			it.no_sop.toLowerCase().includes(query) ||
			(it.keterangan || '').toLowerCase().includes(query);
		return matchCat && matchQ;
	});

	return (
		<div className="space-y-6">
			<Toaster toasts={toasts} onRemove={removeToast} />

			{/* Top Header Card */}
			<div className="p-6 md:p-8 rounded-3xl bg-card border border-border/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2">
						<span className="p-2 rounded-xl bg-emerald-500/10 text-[#007144]">
							<FileText className="w-5 h-5" />
						</span>
						<span className="text-xs font-black uppercase text-[#007144] tracking-wider">
							Pengelolaan PPID
						</span>
					</div>
					<h1 className="text-2xl font-black text-foreground tracking-tight">
						Dokumen Standard Operating Procedure (SOP)
					</h1>
					<p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
						Kelola dokumen resmi SOP pelayanan informasi publik, penanganan keberatan, pengujian konsekuensi, dan pengaduan masyarakat Kantor Kemenag Barito Utara.
					</p>
				</div>

				<button
					type="button"
					onClick={openCreate}
					className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#007144] hover:bg-[#005935] text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer shrink-0"
				>
					<Plus className="w-4 h-4" />
					<span>Tambah SOP Baru</span>
				</button>
			</div>

			{/* Filter Header & Search Bar (Bubble filter dihapus agar tidak double dengan sidebar) */}
			<div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
						Kategori:
					</span>
					<span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#007144] text-xs font-black">
						{kategoriFilter || 'Semua SOP'}
					</span>
					<span className="text-xs text-muted-foreground font-mono">
						({filtered.length} Dokumen)
					</span>
				</div>

				<div className="relative min-w-[280px]">
					<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari nomor atau judul SOP..."
						className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
					/>
				</div>
			</div>

			{/* Main Table */}
			<div className="rounded-3xl bg-card border border-border/70 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs border-collapse">
						<thead>
							<tr className="border-b border-border/50 bg-muted/20 text-muted-foreground uppercase tracking-wider font-extrabold text-[10px]">
								<th className="py-3.5 px-4 w-12 text-center">Urutan</th>
								<th className="py-3.5 px-4">Dokumen &amp; Judul SOP</th>
								<th className="py-3.5 px-4">Kategori Layanan</th>
								<th className="py-3.5 px-4">Tgl Terbit</th>
								<th className="py-3.5 px-4">Berkas</th>
								<th className="py-3.5 px-4 text-center">Status</th>
								<th className="py-3.5 px-4 text-right pr-6">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40">
							{loading ? (
								<LoadingRows cols={7} />
							) : filtered.length === 0 ? (
								<tr>
									<td colSpan={7} className="py-12 text-center text-muted-foreground">
										<FileText className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#007144]" />
										<p className="font-bold text-sm text-foreground">Tidak Ada Dokumen SOP</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{q
												? 'Tidak ada hasil yang sesuai dengan pencarian Anda.'
												: 'Belum ada dokumen SOP yang ditambahkan pada kategori ini.'}
										</p>
									</td>
								</tr>
							) : (
								filtered.map((item) => (
									<tr
										key={item.id}
										className="hover:bg-accent/30 transition-colors group"
									>
										<td className="py-4 px-4 text-center font-mono font-bold text-muted-foreground">
											{item.urutan}
										</td>
										<td className="py-4 px-4">
											<div className="space-y-1 max-w-md">
												<span className="inline-block font-mono text-[11px] font-black text-[#007144] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
													{item.no_sop}
												</span>
												<h3 className="font-bold text-sm text-foreground leading-snug">
													{item.judul}
												</h3>
												{item.keterangan && (
													<p className="text-[11px] text-muted-foreground line-clamp-1">
														{item.keterangan}
													</p>
												)}
											</div>
										</td>
										<td className="py-4 px-4">
											<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-accent border border-border text-foreground">
												{item.kategori}
											</span>
										</td>
										<td className="py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">
											{item.tgl_terbit || '-'}
										</td>
										<td className="py-4 px-4 whitespace-nowrap">
											{item.file_url ? (
												<button
													type="button"
													onClick={() =>
														setPreviewDoc({
															url: item.file_url,
															title: `${item.no_sop} - ${item.judul}`,
														})
													}
													className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#007144] hover:underline cursor-pointer group/eye"
													title="Lihat Pratinjau Dokumen SOP"
												>
													<Eye className="w-3.5 h-3.5 text-[#007144] transition-transform group-hover/eye:scale-110" />
													<span>PDF ({item.ukuran || 'File'})</span>
												</button>
											) : (
												<span className="text-[11px] text-muted-foreground italic">
													Belum ada file
												</span>
											)}
										</td>
										<td className="py-4 px-4 text-center">
											<span
												className={cn(
													'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border',
													item.is_aktif
														? 'bg-emerald-500/10 border-emerald-500/30 text-[#007144]'
														: 'bg-muted border-border text-muted-foreground',
												)}
											>
												{item.is_aktif ? 'Aktif' : 'Nonaktif'}
											</span>
										</td>
										<td className="py-4 px-4 text-right pr-6 whitespace-nowrap">
											<div className="flex items-center justify-end gap-1.5">
												{/* Fitur View Mata untuk Dokumen */}
												{item.file_url && (
													<button
														type="button"
														onClick={() =>
															setPreviewDoc({
																url: item.file_url,
																title: `${item.no_sop} - ${item.judul}`,
															})
														}
														className="p-2 rounded-xl text-[#007144] hover:bg-emerald-500/10 transition-all cursor-pointer"
														title="Lihat Dokumen SOP (Mata)"
													>
														<Eye className="w-4 h-4" />
													</button>
												)}
												<button
													type="button"
													onClick={() => openEdit(item)}
													className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
													title="Edit Dokumen SOP"
												>
													<Pencil className="w-3.5 h-3.5" />
												</button>
												<button
													type="button"
													onClick={() => setDeletingId(item.id)}
													className="p-2 rounded-xl text-muted-foreground hover:text-red-700 hover:bg-red-500/10 transition-all cursor-pointer"
													title="Hapus Dokumen SOP"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal Form Tambah / Edit SOP (Dioptimasi 2 Kolom Lebar agar Tidak Scroll) */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
					<div
						className="bg-card border border-border/80 rounded-3xl w-full max-w-3xl lg:max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col my-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="p-4 sm:p-5 border-b border-border/50 flex items-start justify-between bg-muted/20">
							<div className="flex items-center gap-3">
								<div className="p-2.5 rounded-2xl bg-[#007144] text-white shadow-xs">
									<FileText className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-base font-bold text-foreground">
										{editing ? 'Perbarui Dokumen SOP' : 'Tambah Dokumen SOP Baru'}
									</h2>
									<p className="text-xs text-muted-foreground mt-0.5">
										Standar Operasional Prosedur pelayanan informasi publik
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setModalOpen(false)}
								className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
								title="Tutup (Esc)"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Form Body - 2 Kolom Sejajar */}
						<form onSubmit={submit} className="p-5 sm:p-6 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
								{/* Kolom Kiri: Metadata Dokumen */}
								<div className="space-y-3.5">
									<div className="grid grid-cols-2 gap-3">
										<Field label="Nomor SOP *">
											<input
												type="text"
												required
												value={form.no_sop}
												onChange={(e) => setForm({ ...form, no_sop: e.target.value })}
												placeholder="Contoh: SOP/PPID/001/2026"
												className={inputCls}
											/>
										</Field>

										<Field label="Kategori Layanan *">
											<ModernSelect
												value={form.kategori}
												onChange={(val) => setForm({ ...form, kategori: val })}
												options={KATEGORI_OPTIONS}
											/>
										</Field>
									</div>

									<Field label="Judul Dokumen SOP *">
										<input
											type="text"
											required
											value={form.judul}
											onChange={(e) => setForm({ ...form, judul: e.target.value })}
											placeholder="Contoh: SOP Pelayanan Permohonan Informasi Publik PPID"
											className={inputCls}
										/>
									</Field>

									<div className="grid grid-cols-2 gap-3">
										<Field label="Tanggal Terbit *">
											<ModernDatePicker
												value={form.tgl_terbit}
												onChange={(val) => setForm({ ...form, tgl_terbit: val })}
												placeholder="Pilih tanggal terbit"
											/>
										</Field>

										<Field label="Urutan Tampilan">
											<input
												type="number"
												min={1}
												value={form.urutan}
												onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value, 10) || 1 })}
												className={inputCls}
											/>
										</Field>
									</div>

									<Field label="Keterangan Ringkas">
										<input
											type="text"
											value={form.keterangan}
											onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
											placeholder="Catatan / ruang lingkup SOP..."
											className={inputCls}
										/>
									</Field>

									<div className="flex items-center gap-2 pt-1">
										<input
											type="checkbox"
											id="is_aktif_sop"
											checked={form.is_aktif}
											onChange={(e) => setForm({ ...form, is_aktif: e.target.checked })}
											className="w-4 h-4 rounded text-[#007144] focus:ring-[#007144] cursor-pointer"
										/>
										<label htmlFor="is_aktif_sop" className="text-xs font-bold text-foreground cursor-pointer">
											Publikasikan di Portal SOP Publik (Status Aktif)
										</label>
									</div>
								</div>

								{/* Kolom Kanan: Upload Berkas & Pratinjau Dokumen */}
								<div className="space-y-3.5 bg-accent/20 border border-border/60 rounded-2xl p-4">
									<Field label="Berkas Dokumen SOP (PDF)">
										<FileUploadField
											value={form.file_url}
											onChange={(url: string) => setForm((prev) => ({ ...prev, file_url: url }))}
											uploading={uploading}
											onUploadingChange={(v: boolean) => setUploading(v)}
											error=""
											onError={(msg: string) => { if (msg) showToast(msg, 'error'); }}
											folder="sop"
											onFileUploaded={({ size, name }: { size: string; name: string }) => {
												setForm((prev) => ({
													...prev,
													ukuran: size,
													judul: prev.judul && prev.judul.trim().length > 0 ? prev.judul : name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
												}));
											}}
											onPreview={(url: string) => setPreviewDoc({ url, title: form.judul || 'Pratinjau SOP' })}
											label="Unggah Berkas SOP (PDF)"
										/>
									</Field>

									<Field label="Ukuran Berkas">
										<input
											type="text"
											value={form.ukuran}
											onChange={(e) => setForm({ ...form, ukuran: e.target.value })}
											placeholder="Contoh: 1.4 MB (otomatis)"
											className={inputCls}
										/>
									</Field>

									{/* Fitur View Mata Dokumen yang Sudah Diunggah */}
									{form.file_url && (
										<button
											type="button"
											onClick={() => setPreviewDoc({ url: form.file_url, title: form.judul || 'Pratinjau Dokumen SOP' })}
											className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-[#007144] text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer shadow-2xs"
											title="Lihat Pratinjau Dokumen (Mata)"
										>
											<Eye className="w-4 h-4" />
											<span>Pratinjau Dokumen Terunggah ({form.ukuran || 'PDF'})</span>
										</button>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="pt-4 border-t border-border/50 flex items-center justify-end gap-2.5">
								<button
									type="button"
									onClick={() => setModalOpen(false)}
									className="px-5 py-2 rounded-xl border border-border bg-accent/40 text-foreground text-xs font-bold hover:bg-accent transition-all cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={saving || uploading}
									className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-[#007144] hover:bg-[#005935] text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
								>
									{saving ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>Menyimpan...</span>
										</>
									) : (
										<span>Simpan Dokumen SOP</span>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deletingId && (
				<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-card border border-border/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
						<div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-700 flex items-center justify-center mx-auto">
							<Trash2 className="w-6 h-6" />
						</div>
						<div className="text-center space-y-1">
							<h3 className="font-extrabold text-base text-foreground">Hapus Dokumen SOP?</h3>
							<p className="text-xs text-muted-foreground">
								Tindakan ini tidak dapat dibatalkan. Dokumen SOP akan dihapus permanen dari sistem.
							</p>
						</div>
						<div className="flex items-center gap-2 pt-2">
							<button
								type="button"
								onClick={() => setDeletingId(null)}
								className="flex-1 py-2.5 rounded-xl border border-border bg-accent/40 text-foreground text-xs font-bold hover:bg-accent transition-all cursor-pointer"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={() => handleDelete(deletingId)}
								className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
							>
								Hapus SOP
							</button>
						</div>
					</div>
				</div>
			)}

			{/* PDF Viewer Floating Modal */}
			<PdfViewerModal
				isOpen={!!previewDoc}
				onClose={() => setPreviewDoc(null)}
				url={previewDoc?.url ?? ''}
				title={previewDoc?.title}
			/>
		</div>
	);
}
