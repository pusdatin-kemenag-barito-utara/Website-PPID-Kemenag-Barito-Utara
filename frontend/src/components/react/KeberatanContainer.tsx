import { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Gavel, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import KeberatanForm from './KeberatanForm';

interface KeberatanContainerProps {
	alasanKeberatan: string[];
	prosedurSengketa: string[];
	siteKey?: string;
}

type TabType = 'formulir' | 'alasan' | 'sengketa';

export default function KeberatanContainer({
	alasanKeberatan,
	prosedurSengketa,
	siteKey = '0x4AAAAAADR1O_LSp1lgc3km',
}: KeberatanContainerProps) {
	const [activeTab, setActiveTab] = useState<TabType>('formulir');

	// Sinkronisasi dengan URL Hash pada saat dimuat dan saat hash berubah
	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.toLowerCase();
			if (hash === '#alasan-keberatan' || hash === '#kriteria' || hash === '#alasan') {
				setActiveTab('alasan');
			} else if (hash === '#prosedur-sengketa' || hash === '#sengketa' || hash === '#prosedur') {
				setActiveTab('sengketa');
			} else if (hash === '#formulir' || hash === '#form') {
				setActiveTab('formulir');
			}
		};

		handleHashChange();
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	const handleTabSwitch = (tab: TabType) => {
		setActiveTab(tab);
		let targetHash = '#formulir';
		if (tab === 'alasan') targetHash = '#alasan-keberatan';
		if (tab === 'sengketa') targetHash = '#prosedur-sengketa';

		try {
			window.history.replaceState(null, '', targetHash);
		} catch {
			// ignore
		}
	};

	return (
		<div className="w-full space-y-6 sm:space-y-8">
			{/* Segmented Navigation Tab Bar - Pastikan 1 Baris Penuh di Desktop */}
			<div className="w-full max-w-5xl mx-auto p-1.5 sm:p-2 rounded-2xl bg-muted/40 border border-border/60 shadow-2xs">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
					<button
						type="button"
						onClick={() => handleTabSwitch('formulir')}
						className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
							activeTab === 'formulir'
								? 'bg-[#007144] text-white shadow-sm border border-[#007144]'
								: 'bg-card text-muted-foreground border border-border/60 hover:text-foreground hover:bg-accent'
						}`}
					>
						<FileText className="w-4 h-4 shrink-0" />
						<span className="truncate">1. Formulir Pengajuan Keberatan</span>
					</button>

					<button
						type="button"
						onClick={() => handleTabSwitch('alasan')}
						className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
							activeTab === 'alasan'
								? 'bg-[#007144] text-white shadow-sm border border-[#007144]'
								: 'bg-card text-muted-foreground border border-border/60 hover:text-foreground hover:bg-accent'
						}`}
					>
						<ShieldCheck
							className={`w-4 h-4 shrink-0 ${activeTab === 'alasan' ? 'text-white' : 'text-[#007144]'}`}
						/>
						<span className="truncate">2. Kriteria Alasan Keberatan Sah</span>
					</button>

					<button
						type="button"
						onClick={() => handleTabSwitch('sengketa')}
						className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
							activeTab === 'sengketa'
								? 'bg-amber-600 text-white shadow-sm border border-amber-600'
								: 'bg-card text-muted-foreground border border-border/60 hover:text-foreground hover:bg-accent'
						}`}
					>
						<Gavel
							className={`w-4 h-4 shrink-0 ${activeTab === 'sengketa' ? 'text-white' : 'text-amber-600'}`}
						/>
						<span className="truncate">3. Prosedur Penyelesaian Sengketa</span>
					</button>
				</div>
			</div>

			{/* TAB CONTENT 1: FORMULIR KEBERATAN */}
			{activeTab === 'formulir' && (
				<div className="w-full animate-in fade-in zoom-in-99 duration-200">
					<KeberatanForm alasanKeberatan={alasanKeberatan} siteKey={siteKey} />
				</div>
			)}

			{/* TAB CONTENT 2: KRITERIA ALASAN KEBERATAN SAH */}
			{activeTab === 'alasan' && (
				<div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-99 duration-200">
					<div className="p-6 sm:p-10 rounded-3xl bg-card border border-border/70 shadow-sm space-y-6">
						<div className="flex items-center gap-3 border-b border-border/50 pb-4">
							<div className="p-2.5 rounded-2xl bg-emerald-500/10 text-[#007144]">
								<ShieldCheck className="w-6 h-6" />
							</div>
							<div>
								<h2 className="text-xl sm:text-2xl font-black text-foreground">
									Kriteria Alasan Keberatan Sah (Pasal 35 UU KIP)
								</h2>
								<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
									Dasar hukum sah bagi pemohon informasi untuk menyampaikan keberatan tertulis kepada Atasan PPID
								</p>
							</div>
						</div>

						<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
							Berdasarkan <strong>Pasal 35 Undang-Undang No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik</strong>, Pemohon Informasi Publik berhak mengajukan keberatan secara tertulis kepada <strong>Atasan PPID</strong> apabila menemukan salah satu atau lebih kondisi sah berikut:
						</p>

						<div className="grid gap-3.5">
							{alasanKeberatan.map((ak, idx) => (
								<div
									key={idx}
									className="p-4 sm:p-5 rounded-2xl bg-accent/25 border border-border/40 flex items-start gap-4 hover:border-[#007144]/40 hover:bg-accent/40 transition-all"
								>
									<div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-[#007144] font-black text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5">
										{idx + 1}
									</div>
									<div className="space-y-0.5">
										<p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
											{ak}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[#007144] font-medium flex items-center gap-2.5">
							<CheckCircle2 className="w-4 h-4 shrink-0" />
							<span>Pilihlah salah satu alasan di atas saat mengisi formulir pengajuan keberatan resmi.</span>
						</div>

						{/* Call to Action Button */}
						<div className="pt-2 flex justify-end">
							<button
								type="button"
								onClick={() => handleTabSwitch('formulir')}
								className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#007144] hover:bg-[#005935] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-all active:scale-[0.98]"
							>
								<span>Isi Formulir Pengajuan Keberatan</span>
								<ArrowRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* TAB CONTENT 3: PROSEDUR PENYELESAIAN SENGKETA */}
			{activeTab === 'sengketa' && (
				<div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-99 duration-200">
					<div className="p-6 sm:p-10 rounded-3xl bg-card border border-border/70 shadow-sm space-y-6">
						<div className="flex items-center gap-3 border-b border-border/50 pb-4">
							<div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
								<Gavel className="w-6 h-6" />
							</div>
							<div>
								<h2 className="text-xl sm:text-2xl font-black text-foreground">
									Prosedur Penyelesaian Sengketa Informasi Publik
								</h2>
								<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
									Alur penanganan lanjutan apabila tanggapan Atasan PPID tidak memuaskan atau tidak diberikan
								</p>
							</div>
						</div>

						<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
							Sengketa Informasi Publik adalah sengketa yang terjadi antara Badan Publik dan Pemohon Informasi Publik yang berkaitan dengan hak memperoleh dan menggunakan informasi sesuai peraturan perundang-undangan (Pasal 37 - 39 UU KIP).
						</p>

						<div className="grid gap-4 sm:grid-cols-2">
							{prosedurSengketa.map((p, idx) => (
								<div
									key={idx}
									className="p-5 rounded-2xl bg-accent/25 border border-border/40 space-y-2 hover:border-amber-600/40 transition-all flex flex-col justify-between"
								>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-xs font-mono shadow-2xs">
												{idx + 1}
											</span>
											<span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
												Tahap {idx + 1}
											</span>
										</div>
										<p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
											{p}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Lembaga Penyelesaian Sengketa Callout */}
						<div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground/90 space-y-2">
							<div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
								<AlertTriangle className="w-4 h-4" />
								<span className="text-xs sm:text-sm font-extrabold">Lembaga Penyelesaian Sengketa Informasi</span>
							</div>
							<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
								Permohonan penyelesaian sengketa informasi dapat diajukan kepada <strong>Komisi Informasi Provinsi Kalimantan Tengah</strong> paling lambat <strong>14 (empat belas) hari kerja</strong> setelah diterimanya tanggapan tertulis dari Atasan PPID atau setelah batas waktu 30 hari kerja terlampaui tanpa tanggapan.
							</p>
						</div>

						{/* Call to Action Button */}
						<div className="pt-2 flex justify-end">
							<button
								type="button"
								onClick={() => handleTabSwitch('formulir')}
								className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#007144] hover:bg-[#005935] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-all active:scale-[0.98]"
							>
								<span>Ajukan Keberatan Terlebih Dahulu</span>
								<ArrowRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
