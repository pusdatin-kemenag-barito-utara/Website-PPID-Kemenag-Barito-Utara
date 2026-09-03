import { useState } from 'react';
import { Tag, Calendar, Eye, ExternalLink, X, Image as ImageIcon, Search } from 'lucide-react';
import type { DataInfografisItem } from './admin/types';

export default function InfografisPublicList({ initialItems }: { initialItems: DataInfografisItem[] }) {
	const [items] = useState<DataInfografisItem[]>(initialItems);
	const [selectedKategori, setSelectedKategori] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

	const categories = ['Semua', 'Keagamaan', 'Pendidikan', 'Layanan KUA', 'Haji & Umrah', 'Layanan Publik'];

	const filtered = items.filter((it) => {
		const matchKategori = !selectedKategori || selectedKategori === 'Semua' || it.kategori === selectedKategori;
		const matchSearch =
			it.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(it.deskripsi && it.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchKategori && matchSearch;
	});

	return (
		<div className="space-y-8">
			{/* Filter & Search Bar */}
			<div className="flex flex-col md:flex-row items-center justify-between gap-4">
				{/* Category Pills */}
				<div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
					{categories.map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setSelectedKategori(cat === 'Semua' ? '' : cat)}
							className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
								(!selectedKategori && cat === 'Semua') || selectedKategori === cat
									? 'bg-[#007144] text-white shadow-xs'
									: 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/80'
							}`}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Search Input */}
				<div className="relative w-full md:w-72">
					<Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Cari infografis..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-card text-foreground text-xs focus:ring-2 focus:ring-[#007144] focus:outline-hidden"
					/>
				</div>
			</div>

			{/* Infografis Cards Grid */}
			{filtered.length === 0 ? (
				<div className="py-20 text-center text-muted-foreground text-xs bg-card border border-border/60 rounded-3xl p-8">
					Tidak ada infografis yang sesuai dengan pencarian Anda.
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((info) => (
						<div
							key={info.id}
							className="rounded-3xl bg-card border border-border/60 shadow-xs overflow-hidden hover:border-[#007144]/40 hover:shadow-lg transition-all flex flex-col justify-between group"
						>
							{/* Poster Image Thumbnail */}
							<div
								onClick={() => setActiveImage({ url: info.image_url, title: info.judul })}
								className="relative h-52 bg-accent/40 border-b border-border/40 flex flex-col items-center justify-center p-4 text-center gap-2 group-hover:bg-emerald-500/5 transition-colors cursor-pointer overflow-hidden"
								title="Klik untuk melihat poster penuh"
							>
								{info.image_url ? (
									<img
										src={info.image_url}
										alt={info.judul}
										className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								) : (
									<div className="flex flex-col items-center gap-2">
										<ImageIcon className="w-12 h-12 text-[#007144]/40 group-hover:scale-110 transition-transform" />
										<span className="text-xs font-bold text-muted-foreground">{info.judul}</span>
									</div>
								)}
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
									<div className="bg-white/90 dark:bg-zinc-900/90 text-foreground px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
										<Eye className="w-3.5 h-3.5 text-[#007144]" />
										<span>Lihat Poster Penuh</span>
									</div>
								</div>
							</div>

							{/* Card Body */}
							<div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
								<div className="space-y-2">
									<div className="flex items-center justify-between gap-2 text-[11px] font-bold text-muted-foreground">
										<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-[#007144]">
											<Tag className="w-3 h-3" />
											{info.kategori}
										</span>
										<span className="flex items-center gap-1 font-mono text-[10px]">
											<Calendar className="w-3 h-3" />
											{info.tanggal}
										</span>
									</div>
									<h3 className="font-extrabold text-base text-foreground group-hover:text-[#007144] transition-colors leading-snug">
										{info.judul}
									</h3>
									<p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
										{info.deskripsi}
									</p>
								</div>

								<div className="pt-3 border-t border-border/40">
									<button
										type="button"
										onClick={() => setActiveImage({ url: info.image_url, title: info.judul })}
										className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#007144] text-[#007144] hover:bg-[#007144] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
									>
										<Eye className="w-4 h-4" />
										<span>Lihat Gambar Infografis</span>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Lightbox Modal */}
			{activeImage && (
				<div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
					<div className="bg-card border border-border/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/20 shrink-0 gap-3">
							<h4 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-lg">
								{activeImage.title}
							</h4>
							<div className="flex items-center gap-2 shrink-0">
								<a
									href={activeImage.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-input bg-background hover:bg-accent text-xs font-semibold text-foreground transition-colors cursor-pointer"
								>
									<ExternalLink className="w-3.5 h-3.5" />
									<span className="hidden sm:inline">Buka Resolusi Penuh</span>
								</a>
								<button
									type="button"
									onClick={() => setActiveImage(null)}
									className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						</div>
						<div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950">
							<img
								src={activeImage.url}
								alt={activeImage.title}
								className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
