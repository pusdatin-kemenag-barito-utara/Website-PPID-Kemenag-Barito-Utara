import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
	Search,
	X,
	CheckCircle2,
	AlertCircle,
	Clock,
	FileText,
	AlertTriangle,
	MessageSquareWarning,
	ArrowRight,
	ExternalLink,
	Loader2,
	Hash,
	Calendar,
	User,
	Ticket,
	ShieldCheck,
	ShieldAlert,
	Lock,
	Copy,
	Check,
} from 'lucide-react';
import { apiGet, ApiError } from '@/lib/api-client';
import { trackTicketLookup, trackCopyTicket } from '@/lib/analytics';

interface TicketDTO {
	id: string;
	tiket_no: string;
	jenis: 'PERMOHONAN' | 'KEBERATAN' | 'PENGADUAN' | string;
	status: 'MENUNGGU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK' | string;
	nama?: string;
	nik?: string;
	email?: string;
	phone?: string;
	rincian?: string;
	tujuan?: string;
	alasan?: string;
	tiket_terkait?: string;
	created_at?: string;
	updated_at?: string;
}

const STATUS_CONFIG: Record<
	string,
	{ label: string; bg: string; text: string; step: number; desc: string }
> = {
	MENUNGGU: {
		label: 'Menunggu Verifikasi',
		bg: 'bg-amber-500/15 border-amber-500/30',
		text: 'text-amber-800 dark:text-amber-400',
		step: 1,
		desc: 'Tiket telah terdaftar dan sedang dalam antrean verifikasi administrasi oleh Tim PPID.',
	},
	DIPROSES: {
		label: 'Sedang Diproses',
		bg: 'bg-blue-500/15 border-blue-500/30',
		text: 'text-blue-800 dark:text-blue-400',
		step: 2,
		desc: 'Berkas permohonan sedang ditelaah atau dikoordinasikan dengan seksi terkait untuk penyiapan data.',
	},
	SELESAI: {
		label: 'Telah Selesai',
		bg: 'bg-emerald-500/15 border-emerald-500/30',
		text: 'text-emerald-800 dark:text-emerald-400',
		step: 3,
		desc: 'Tanggapan dan salinan dokumen telah selesai disiapkan dan dikirimkan kepada pemohon.',
	},
	DITOLAK: {
		label: 'Permohonan Ditolak',
		bg: 'bg-red-500/15 border-red-500/30',
		text: 'text-red-800 dark:text-red-400',
		step: 3,
		desc: 'Permohonan tidak dapat dipenuhi karena informasi termasuk kategori yang dikecualikan atau syarat tidak terpenuhi.',
	},
};

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_DURATION_SEC = 60;

export default function LacakTiketModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [ticketNo, setTicketNo] = useState('');
	const [ticketData, setTicketData] = useState<TicketDTO | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Anti-Brute-Force state
	const [failedAttempts, setFailedAttempts] = useState(0);
	const [cooldownRemaining, setCooldownRemaining] = useState(0);
	const [copiedTicket, setCopiedTicket] = useState(false);

	const handleCopyTicket = (no: string) => {
		if (!no) return;
		navigator.clipboard.writeText(no).then(() => {
			setCopiedTicket(true);
			trackCopyTicket(no, 'lacak_modal');
			setTimeout(() => setCopiedTicket(false), 2000);
		});
	};

	const handleResetSearch = () => {
		setTicketNo('');
		setTicketData(null);
		setErrorMsg(null);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		handleResetSearch();
	};

	useEffect(() => {
		setMounted(true);
		// Check persisted lockout on mount
		try {
			const lockUntilStr = localStorage.getItem('ppid_track_lock_until');
			if (lockUntilStr) {
				const lockUntil = parseInt(lockUntilStr, 10);
				const diff = Math.ceil((lockUntil - Date.now()) / 1000);
				if (diff > 0) {
					setCooldownRemaining(diff);
				} else {
					localStorage.removeItem('ppid_track_lock_until');
				}
			}
		} catch {
			// ignore localStorage issues
		}
	}, []);

	// Countdown timer for anti-brute force cooldown
	useEffect(() => {
		if (cooldownRemaining <= 0) return;
		const timer = setInterval(() => {
			setCooldownRemaining((prev) => {
				if (prev <= 1) {
					try {
						localStorage.removeItem('ppid_track_lock_until');
					} catch {}
					setFailedAttempts(0);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [cooldownRemaining]);

	const triggerCooldown = (seconds = COOLDOWN_DURATION_SEC) => {
		const lockUntil = Date.now() + seconds * 1000;
		try {
			localStorage.setItem('ppid_track_lock_until', lockUntil.toString());
		} catch {}
		setCooldownRemaining(seconds);
		setErrorMsg(null);
	};

	// Keyboard shortcut ESC to close and reset
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				handleCloseModal();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	// Prevent background scrolling when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	const handleTrack = async (targetNo?: string) => {
		if (cooldownRemaining > 0) return;

		const rawNo = (targetNo || ticketNo).trim().toUpperCase();
		if (!rawNo) return;

		// Client-side regex pre-validation: must follow official PPID ticket pattern
		// Example: PPID-2026-0001
		const ticketPattern = /^PPID-\d{4}-\d{3,6}$/i;
		if (!ticketPattern.test(rawNo)) {
			setErrorMsg('Format nomor registrasi tiket harus sesuai standar resmi, contoh: PPID-2026-0001');
			return;
		}

		setLoading(true);
		setErrorMsg(null);
		setTicketData(null);

		try {
			const res = await apiGet<TicketDTO>(
				`/permohonan/lacak/${encodeURIComponent(rawNo)}`,
			);
			if (res && res.tiket_no) {
				setTicketData(res);
				setFailedAttempts(0); // Reset attempt counter on success
				trackTicketLookup(rawNo, true, res.status);
			} else {
				trackTicketLookup(rawNo, false);
				handleFailedAttempt('Nomor tiket tidak ditemukan dalam database resmi PPID.');
			}
		} catch (err) {
			trackTicketLookup(rawNo, false);
			if (err instanceof ApiError && err.status === 429) {
				triggerCooldown(60);
			} else {
				handleFailedAttempt(
					err instanceof ApiError
						? err.message
						: 'Nomor registrasi tiket tidak ditemukan. Pastikan nomor tiket Anda benar sesuai bukti pendaftaran.',
				);
			}
		} finally {
			setLoading(false);
		}
	};

	// Auto-open and auto-track if ?tiket= or ?lacak= is present in URL
	useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			const searchParams = new URLSearchParams(window.location.search);
			const urlTicket = searchParams.get('tiket') || searchParams.get('lacak');
			if (urlTicket) {
				// Prevent duplicate execution if multiple modal instances are mounted
				if ((window as any).__ppid_auto_ticket_handled) return;
				(window as any).__ppid_auto_ticket_handled = true;

				const cleanTicket = urlTicket.trim().toUpperCase();
				setTicketNo(cleanTicket);
				setIsOpen(true);
				handleTrack(cleanTicket);

				// Clean URL parameter without reloading page
				const newUrl = new URL(window.location.href);
				newUrl.searchParams.delete('tiket');
				newUrl.searchParams.delete('lacak');
				window.history.replaceState({}, '', newUrl.toString());
			}
		} catch (e) {
			console.error('Failed to parse ticket query params:', e);
		}
	}, []);

	const handleFailedAttempt = (msg: string) => {
		const nextAttempts = failedAttempts + 1;
		setFailedAttempts(nextAttempts);

		if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
			triggerCooldown(COOLDOWN_DURATION_SEC);
		} else {
			const sisa = MAX_FAILED_ATTEMPTS - nextAttempts;
			setErrorMsg(`${msg} (Sisa percobaan: ${sisa} kali sebelum proteksi keamanan aktif)`);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleTrack();
	};

	const formatDate = (d?: string) => {
		if (!d) return '-';
		try {
			return new Date(d).toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return d;
		}
	};

	const statusInfo = ticketData ? STATUS_CONFIG[ticketData.status] || {
		label: ticketData.status,
		bg: 'bg-muted border-border',
		text: 'text-foreground',
		step: 1,
		desc: 'Status saat ini sedang dalam proses pembaruan oleh petugas PPID.',
	} : null;

	const isLocked = cooldownRemaining > 0;

	return (
		<>
			{/* Trigger Button in Navbar (Icon-only di mobile agar hemat ruang, dengan label di sm ke atas) */}
			<button
				type="button"
				onClick={() => {
					setIsOpen(true);
					setErrorMsg(null);
				}}
				className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#007144]/30 bg-emerald-500/10 hover:bg-[#007144] text-[#007144] hover:text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-2xs group"
				title="Lacak Status Permohonan / Tiket"
				aria-label="Lacak Tiket"
			>
				<Ticket className="w-4 h-4 sm:w-3.5 sm:h-3.5 transition-transform group-hover:rotate-12 shrink-0" />
				<span className="hidden sm:inline whitespace-nowrap">Lacak Tiket</span>
			</button>

			{/* Center Floating Modal with Full-Screen Blurred Backdrop (via React Portal) */}
			{mounted && isOpen && createPortal(
				<div
					className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
					onClick={handleCloseModal}
				>
					{/* Modal Dialog Card (Dead Center, Lebar Luas & Proporsional max-w-5xl) */}
					<div
						className="relative bg-card border border-border/80 rounded-2xl sm:rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col my-auto max-h-[94vh] sm:max-h-[92vh]"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header - Responsif & Ringkas di Mobile */}
						<div className="px-4 py-3 sm:px-7 sm:py-5 border-b border-border/50 flex items-center justify-between bg-muted/20">
							<div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
								<div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#007144] text-white shadow-xs shrink-0">
									<Search className="w-4 h-4 sm:w-6 sm:h-6" />
								</div>
								<div className="min-w-0">
									<h2 className="text-sm sm:text-lg md:text-xl font-extrabold text-foreground tracking-tight truncate">
										Lacak Status Tiket Pelayanan
									</h2>
									<p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
										Layanan pemantauan permohonan informasi &amp; pengaduan PPID real-time
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={handleCloseModal}
								className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer shrink-0 ml-2"
								title="Tutup & Reset (Esc)"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Body */}
						<div className="p-3.5 sm:p-7 overflow-y-auto space-y-3.5 sm:space-y-5 scrollbar-thin">
							{/* Anti-Brute-Force Cooldown Warning */}
							{isLocked && (
								<div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 sm:gap-3 animate-in fade-in duration-150">
									<ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
									<div className="space-y-0.5 text-xs sm:text-sm">
										<p className="font-extrabold text-amber-900 dark:text-amber-200">
											Proteksi Keamanan Anti Brute-Force Aktif
										</p>
										<p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
											Pencarian ditangguhkan sementara demi keamanan data warga selama{' '}
											<span className="font-mono font-black text-amber-950 dark:text-white px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 inline-block">
												{cooldownRemaining}s
											</span>.
										</p>
									</div>
								</div>
							)}

							{/* Form Input - Responsif & Ringkas */}
							<form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2">
								<div className="flex items-center justify-between px-0.5">
									<label className="block text-[11px] sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
										Nomor Registrasi Tiket
									</label>
									<span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground font-medium">
										<ShieldCheck className="w-3.5 h-3.5 text-[#007144]" />
										<span>Proteksi Terverifikasi</span>
									</span>
								</div>

								<div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-2.5">
									<div className="relative flex-1">
										<input
											type="text"
											value={ticketNo}
											disabled={isLocked || loading}
											onChange={(e) => {
												const val = e.target.value.toUpperCase();
												setTicketNo(val);
												if (!val) {
													setTicketData(null);
													setErrorMsg(null);
												}
											}}
											placeholder="Contoh: PPID-2026-0001"
											autoFocus
											className="w-full h-11 sm:h-13 pl-3.5 sm:pl-4 pr-10 sm:pr-11 rounded-xl sm:rounded-2xl border border-input bg-background font-mono font-bold text-xs sm:text-base text-foreground uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground/80 focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all disabled:opacity-50 shadow-xs"
										/>
										{(ticketNo || ticketData) && !isLocked && (
											<button
												type="button"
												onClick={handleResetSearch}
												className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 sm:p-1.5 rounded-lg hover:bg-accent transition-all cursor-pointer"
												title="Reset Pencarian Tiket"
											>
												<X className="w-4 h-4" />
											</button>
										)}
									</div>

									<button
										type="submit"
										disabled={loading || !ticketNo.trim() || isLocked}
										className="h-11 sm:h-13 px-5 sm:px-7 bg-[#007144] hover:bg-[#005935] text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shrink-0"
									>
										{isLocked ? (
											<>
												<Lock className="w-4 h-4" />
												<span>Terkunci ({cooldownRemaining}s)</span>
											</>
										) : loading ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												<span>Memeriksa Status...</span>
											</>
										) : (
											<>
												<Search className="w-4 h-4 sm:w-5 sm:h-5" />
												<span>Cek Status Tiket</span>
											</>
										)}
									</button>
								</div>
							</form>

							{/* Error Message Alert */}
							{errorMsg && !isLocked && (
								<div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in duration-150">
									<AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
									<div className="space-y-0.5 text-xs sm:text-sm">
										<p className="font-extrabold text-red-800 dark:text-red-300">
											Pemeriksaan Tiket Gagal
										</p>
										<p className="text-xs text-red-700 dark:text-red-400/90 leading-relaxed">
											{errorMsg}
										</p>
									</div>
								</div>
							)}

							{/* Result Display Card (Spacious 2-Column Grid) */}
							{ticketData && statusInfo && (
								<div className="space-y-3.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
									{/* Row 1: Status Banner & 3 Steps Progress Bar side-by-side */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
										{/* Status Banner */}
										<div className={`p-4 sm:p-5 rounded-2xl border ${statusInfo.bg} flex items-start justify-between gap-3 shadow-xs`}>
											<div className="space-y-1">
												<span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
													Status Terkini
												</span>
												<h3 className={`text-base sm:text-lg md:text-xl font-black ${statusInfo.text}`}>
													{statusInfo.label}
												</h3>
												<p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
													{statusInfo.desc}
												</p>
											</div>
											<div className="p-2.5 rounded-xl bg-background/60 shadow-xs shrink-0">
												{ticketData.status === 'SELESAI' ? (
													<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-800 dark:text-emerald-400" />
												) : ticketData.status === 'DITOLAK' ? (
													<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-800 dark:text-red-400" />
												) : (
													<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-800 dark:text-blue-400" />
												)}
											</div>
										</div>

										{/* 3 Steps Progress Bar */}
										<div className="p-4 sm:p-5 rounded-2xl bg-accent/30 border border-border/50 flex flex-col justify-between gap-3 shadow-xs">
											<div className="flex items-center justify-between text-xs sm:text-sm font-bold text-muted-foreground">
												<span>Alur Penanganan</span>
												<span className="text-foreground">Tahap {statusInfo.step} dari 3</span>
											</div>
											<div className="grid grid-cols-3 gap-2">
												{[
													{ label: '1. Verifikasi', step: 1 },
													{ label: '2. Proses', step: 2 },
													{ label: '3. Tanggapan', step: 3 },
												].map((st) => {
													const isPassed = statusInfo.step >= st.step;
													const isCurrent = statusInfo.step === st.step;
													return (
														<div key={st.step} className="space-y-1.5 text-center">
															<div
																className={`h-2 rounded-full transition-all ${
																	isPassed
																		? ticketData.status === 'DITOLAK'
																			? 'bg-red-500'
																			: 'bg-[#007144]'
																		: 'bg-muted'
																}`}
															/>
															<span
																className={`block text-[11px] sm:text-xs font-bold truncate ${
																	isCurrent
																		? 'text-foreground'
																		: 'text-muted-foreground font-medium'
																}`}
															>
																{st.label}
															</span>
														</div>
													);
												})}
											</div>
										</div>
									</div>

									{/* Row 2: Ticket Detail Key-Value Grid */}
									<div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
											<div className="flex items-center justify-between p-3 rounded-xl bg-accent/25 border border-border/40">
												<div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
													<Hash className="w-4 h-4" />
													<span>Nomor Tiket:</span>
												</div>
												<div className="flex items-center gap-1.5">
													<span className="font-mono font-black text-sm sm:text-base text-[#007144]">
														{ticketData.tiket_no}
													</span>
													<button
														type="button"
														onClick={() => handleCopyTicket(ticketData.tiket_no)}
														className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-muted-foreground hover:text-[#007144] transition-all cursor-pointer"
														title="Salin Nomor Tiket"
													>
														{copiedTicket ? (
															<Check className="w-4 h-4 text-emerald-600" />
														) : (
															<Copy className="w-4 h-4" />
														)}
													</button>
												</div>
											</div>

											<div className="flex items-center justify-between p-3 rounded-xl bg-accent/25 border border-border/40">
												<div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
													<Calendar className="w-4 h-4" />
													<span>Terdaftar:</span>
												</div>
												<span className="text-xs sm:text-sm font-bold text-foreground">
													{formatDate(ticketData.created_at)}
												</span>
											</div>

											<div className="flex items-center justify-between p-3 rounded-xl bg-accent/25 border border-border/40">
												<div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
													<User className="w-4 h-4" />
													<span>Nama Pemohon:</span>
												</div>
												<span className="text-xs sm:text-sm font-mono font-bold text-foreground">
													{ticketData.nama || '-'}
												</span>
											</div>

											<div className="flex items-center justify-between p-3 rounded-xl bg-accent/25 border border-border/40">
												<div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
													<FileText className="w-4 h-4" />
													<span>Jenis Layanan:</span>
												</div>
												<span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#007144]/10 text-[#007144] border border-[#007144]/20">
													{ticketData.jenis || 'Permohonan'}
												</span>
											</div>
										</div>

										{ticketData.rincian && (
											<div className="p-4 rounded-xl bg-accent/25 border border-border/40 space-y-1.5">
												<span className="text-xs font-extrabold text-muted-foreground block uppercase tracking-wider">
													Rincian Permohonan / Aspirasi:
												</span>
												<p className="text-xs sm:text-sm text-foreground leading-relaxed max-h-36 overflow-y-auto pr-1 whitespace-pre-line">
													{ticketData.rincian}
												</p>
											</div>
										)}

										<div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30">
											<span className="inline-flex items-center gap-1.5">
												<ShieldCheck className="w-4 h-4 text-[#007144]" />
												<span>Identitas disamarkan demi kepatuhan perlindungan data pribadi (UU PDP).</span>
											</span>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Footer - Ringkas di Mobile */}
						<div className="py-2.5 px-4 sm:py-3 sm:px-7 border-t border-border/50 bg-muted/20 flex items-center justify-between text-[11px] sm:text-sm text-muted-foreground">
							<span>Butuh bantuan lebih lanjut?</span>
							<a
								href="/kontak"
								className="font-bold text-[#007144] hover:underline inline-flex items-center gap-1.5"
							>
								<span>Hubungi Admin PPID</span>
								<ExternalLink className="w-3.5 h-3.5" />
							</a>
						</div>
					</div>
				</div>,
				document.body,
			)}
		</>
	);
}
