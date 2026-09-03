import { useState } from 'react';
import { Search, FileText, Eye } from 'lucide-react';
import PdfViewerModal from './admin/PdfViewerModal';

export interface SopItem {
	id: string;
	judul: string;
	noSop: string;
	tglTerbit: string;
	fileSize: string;
	fileUrl?: string;
}

interface SopListProps {
	sopList: SopItem[];
}

export default function SopList({ sopList }: SopListProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

	const filteredSop = sopList.filter(
		(s) =>
			s.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.noSop.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<section className="space-y-6">
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
				<h2 className="text-xl font-extrabold text-foreground">
					Daftar Dokumen SOP Layanan ({filteredSop.length})
				</h2>
				<div className="relative min-w-[280px]">
					<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						placeholder="Cari SOP..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
					/>
				</div>
			</div>

			<div className="grid gap-4">
				{filteredSop.map((sop) => {
					const targetUrl =
						sop.fileUrl ||
						'https://files.kemenag-baritoutara.com/ppid/informasi-publik/berkala/2026/09/1788403230_Buku_Agenda_Surat_Masuk_2026-08-29.pdf';

					return (
						<div
							key={sop.id}
							className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#007144]/40 transition-all"
						>
							<div className="flex items-start gap-4">
								<div className="p-3 rounded-2xl bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
									<FileText className="w-6 h-6" />
								</div>
								<div className="space-y-1">
									<h3 className="font-extrabold text-base text-foreground leading-snug">
										{sop.judul}
									</h3>
									<div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
										<span className="font-bold text-[#007144]">{sop.noSop}</span>
										<span>•</span>
										<span>Terbit: {sop.tglTerbit}</span>
										<span>•</span>
										<span>Ukuran: {sop.fileSize}</span>
									</div>
								</div>
							</div>
							<button
								type="button"
								onClick={() =>
									setPreviewDoc({
										url: targetUrl,
										title: `${sop.noSop} - ${sop.judul}`,
									})
								}
								className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs shrink-0 cursor-pointer"
							>
								<Eye className="w-4 h-4" />
								<span>Lihat Dokumen SOP</span>
							</button>
						</div>
					);
				})}
			</div>

			{/* Floating PDF Document Viewer Modal */}
			<PdfViewerModal
				isOpen={!!previewDoc}
				onClose={() => setPreviewDoc(null)}
				url={previewDoc?.url ?? ''}
				title={previewDoc?.title}
			/>
		</section>
	);
}