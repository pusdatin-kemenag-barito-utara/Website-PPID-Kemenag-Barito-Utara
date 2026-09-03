import { useEffect, useState } from 'react';
import {
	Search,
	FileText,
	Plus,
	X,
	Pencil,
	Trash2,
	Loader2,
	Upload,
	Eye,
} from 'lucide-react';
import { apiGet, apiSend, ApiError } from '@/lib/api-client';
import type { InformasiItem } from './types';
import PdfViewerModal from './PdfViewerModal';
import {
	cn,
	Field,
	FileUploadField,
	LoadingRows,
	KATEGORI_INFO,
	fmtDate,
	inputCls,
	ModernDatePicker,
	ModernSelect,
	useToast,
	Toaster,
} from './shared';

export default function InformasiSection() {
	const [docs, setDocs] = useState<InformasiItem[]>([]);
	const [loading, setLoading] = useState(true);
	const { toasts, showToast, removeToast } = useToast();

	const [filter, setFilter] = useState(() => {
		if (typeof window !== 'undefined') {
			const p = new URLSearchParams(window.location.search).get('kategori');
			if (p) return p.toUpperCase();
		}
		return 'BERKALA';
	});
	const [q, setQ] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
	const [editing, setEditing] = useState<InformasiItem | null>(null);
	const [form, setForm] = useState({
		judul: '',
		kategori: 'BERKALA',
		deskripsi: '',
		tanggal: '',
		ukuran: '',
		file_url: '',
		is_aktif: true,
	});
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);

	const load = () =>
		apiGet<{ items?: InformasiItem[] }>('/admin/informasi-publik')
			.then((p) => setDocs(p?.items ?? []))
			.catch(() => setDocs([]))
			.finally(() => setLoading(false));

	useEffect(() => {
		load();
		const handleUrlChange = () => {
			const p = new URLSearchParams(window.location.search).get('kategori');
			if (p) setFilter(p.toUpperCase());
			else setFilter('BERKALA');
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
				await apiSend(`/admin/informasi-publik/${editing.id}`, 'PUT', form);
				showToast('Dokumen berhasil diperbarui.', 'success');
			} else {
				await apiSend('/admin/informasi-publik', 'POST', form);
				showToast('Dokumen berhasil ditambahkan.', 'success');
			}
			setModalOpen(false);
			setEditing(null);
			load();
		} catch (err) {
			showToast(err instanceof ApiError ? err.message : 'Gagal menyimpan dokumen.', 'error');
		} finally {
			setSaving(false);
		}
	};

	const remove = async (id: string) => {
		if (!window.confirm('Hapus dokumen ini? Tindakan tidak dapat dibatalkan.')) return;
		try {
			await apiSend(`/admin/informasi-publik/${id}`, 'DELETE');
			showToast('Dokumen berhasil dihapus.', 'success');
			load();
		} catch (err) {
			showToast(err instanceof ApiError ? err.message : 'Gagal menghapus dokumen.', 'error');
		}
	};

	const openEdit = (doc: InformasiItem) => {
		setEditing(doc);
		setForm({
			judul: doc.judul,
			kategori: doc.kategori,
			deskripsi: doc.deskripsi ?? '',
			tanggal: doc.tanggal ?? '',
			ukuran: doc.ukuran ?? '',
			file_url: doc.file_url ?? '',
			is_aktif: doc.is_aktif ?? true,
		});
		setModalOpen(true);
	};

	const openCreate = () => {
		setEditing(null);
		const todayFormatted = new Date().toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});
		setForm({
			judul: '',
			kategori: filter !== 'Semua' ? filter : 'BERKALA',
			deskripsi: '',
			tanggal: todayFormatted,
			ukuran: '',
			file_url: '',
			is_aktif: true,
		});
		setModalOpen(true);
	};

	const filtered = docs.filter((d) => {
		const matchesFilter = filter === 'Semua' || d.kategori === filter;
		const hay = `${d.judul} ${d.deskripsi ?? ''}`.toLowerCase();
		return matchesFilter && hay.includes(q.toLowerCase());
	});

	const activeCategoryLabel = KATEGORI_INFO[filter]?.label ?? 'Informasi Publik';
	const uploadFolder = `informasi-publik/${(form.kategori || filter).toLowerCase().replace('_', '-')}`;

	return (
		<div className="space-y-6 w-full max-w-none">
			{/* Clean Editorial Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
						{activeCategoryLabel}
					</h1>
					<p className="text-muted-foreground text-xs mt-1">
						Kelola dan publikasikan dokumen resmi khusus kategori {activeCategoryLabel} ke penyimpanan Cloudflare R2.
					</p>
				</div>
				<button
					onClick={openCreate}
					className="inline-flex items-center gap-2 bg-[#007144] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs shrink-0 cursor-pointer"
				>
					<Plus className="w-4 h-4" />
					<span>Upload Dokumen Baru</span>
				</button>
			</div>

			{/* Search & Counter Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-2.5">
					<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Daftar Berkas:
					</span>
					<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
						{filtered.length} Dokumen
					</span>
				</div>

				<div className="relative w-full sm:w-80">
					<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						placeholder={`Cari di ${activeCategoryLabel}...`}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
					/>
				</div>
			</div>

			{/* Documents Table */}
			<div className="rounded-2xl bg-card border border-border/60 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-border/60 bg-accent/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								<th className="py-3.5 px-6">Judul Dokumen</th>
								<th className="py-3.5 px-6">Kategori</th>
								<th className="py-3.5 px-6">Tgl Unggah</th>
								<th className="py-3.5 px-6">Ukuran</th>
								<th className="py-3.5 px-6 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40 text-xs">
							{loading ? (
								<LoadingRows cols={5} />
							) : filtered.length > 0 ? (
								filtered.map((doc) => (
									<tr key={doc.id} className="hover:bg-accent/20 transition-colors">
										<td className="py-4 px-6">
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-lg bg-emerald-500/10 text-[#007144] shrink-0">
													<FileText className="w-4 h-4" />
												</div>
												<div className="min-w-0">
													<span className="font-bold text-foreground block truncate max-w-lg">{doc.judul}</span>
													{doc.deskripsi && (
														<span className="text-[11px] text-muted-foreground block mt-0.5 truncate max-w-lg">
															{doc.deskripsi}
														</span>
													)}
												</div>
											</div>
										</td>
										<td className="py-4 px-6 whitespace-nowrap">
											<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent/40 text-muted-foreground">
												{KATEGORI_INFO[doc.kategori]?.label ?? doc.kategori}
											</span>
										</td>
										<td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
											{doc.tanggal || fmtDate(doc.created_at)}
										</td>
										<td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
											{doc.ukuran || 'PDF'}
										</td>
										<td className="py-4 px-6 text-right whitespace-nowrap">
											<div className="flex items-center justify-end gap-1.5">
												{doc.file_url && (
													<button
														type="button"
														onClick={() => setPreviewDoc({ url: doc.file_url!, title: doc.judul })}
														className="p-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer"
														title="Lihat / Pratinjau Dokumen (Mata)"
													>
														<Eye className="w-4 h-4" />
													</button>
												)}
												<button
													onClick={() => openEdit(doc)}
													className="p-2 rounded-lg text-blue-600 hover:bg-blue-500/10 transition-colors cursor-pointer"
													title="Edit Dokumen"
												>
													<Pencil className="w-4 h-4" />
												</button>
												<button
													onClick={() => remove(doc.id)}
													className="p-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
													title="Hapus Dokumen"
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
										Belum ada dokumen di kategori {activeCategoryLabel}.
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
									{editing ? 'Edit Dokumen Informasi Publik' : 'Upload Dokumen Informasi Publik'}
								</h2>
								<p className="text-xs text-muted-foreground mt-0.5">
									Penyimpanan terhubung langsung ke Cloudflare R2 Bucket (<span className="text-[#007144] font-semibold">data-ppid</span>)
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
								{/* Kolom Kiri: Metadata Dokumen */}
								<div className="space-y-3">
									<Field label="Judul Dokumen Resmi">
										<input
											type="text"
											required
											placeholder="Contoh: Laporan Realisasi Anggaran PPID TA 2026..."
											value={form.judul}
											onChange={(e) => setForm({ ...form, judul: e.target.value })}
											className={inputCls}
										/>
									</Field>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Field label="Kategori Informasi">
											<ModernSelect
												value={form.kategori}
												onChange={(val) => setForm({ ...form, kategori: val })}
												options={Object.entries(KATEGORI_INFO).map(([k, v]) => ({
													value: k,
													label: v.label,
												}))}
											/>
										</Field>

										<Field label="Tanggal Dokumen">
											<ModernDatePicker
												value={form.tanggal}
												onChange={(val) => setForm({ ...form, tanggal: val })}
												placeholder="Pilih tanggal dokumen..."
											/>
										</Field>
									</div>

									<Field label="Keterangan Ringkas (Deskripsi)">
										<textarea
											rows={2}
											placeholder="Ringkasan singkat isi atau tujuan dokumen informasi publik ini..."
											value={form.deskripsi}
											onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
											className="w-full p-2.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all resize-none"
										/>
									</Field>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-0.5">
										<Field label="Ukuran Berkas">
											<input
												type="text"
												placeholder="Otomatis saat upload"
												value={form.ukuran}
												onChange={(e) => setForm({ ...form, ukuran: e.target.value })}
												className={inputCls}
											/>
										</Field>

										<div className="pt-4">
											<label className="flex items-center gap-2.5 cursor-pointer select-none">
												<button
													type="button"
													onClick={() => setForm({ ...form, is_aktif: !form.is_aktif })}
													className={cn(
														'h-5 w-10 rounded-full transition-colors relative cursor-pointer shrink-0',
														form.is_aktif ? 'bg-[#007144]' : 'bg-border',
													)}
												>
													<span
														className={cn(
															'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
															form.is_aktif ? 'left-[22px]' : 'left-0.5',
														)}
													/>
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
										folder={uploadFolder}
										onFileUploaded={({ size, name }) => {
											setForm((prev) => ({
												...prev,
												ukuran: size,
												judul: prev.judul && prev.judul.trim().length > 0 ? prev.judul : name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
											}));
										}}
										onPreview={(url) => setPreviewDoc({ url, title: form.judul || 'Pratinjau Berkas Unggahan' })}
										label={`Unggah Berkas ke Folder R2 (${uploadFolder})`}
									/>
								</div>
							</div>

							<div className="flex items-center justify-end gap-3 pt-3.5 border-t border-border/50">
								<button
									type="button"
									onClick={() => setModalOpen(false)}
									className="px-5 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-accent transition-colors cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={saving || uploading}
									className="bg-[#007144] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs disabled:opacity-60 disabled:pointer-events-none inline-flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
								>
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

			{/* Floating PDF.js Document Viewer Modal */}
			<PdfViewerModal
				isOpen={!!previewDoc}
				onClose={() => setPreviewDoc(null)}
				url={previewDoc?.url || ''}
				title={previewDoc?.title}
			/>
		</div>
	);
}