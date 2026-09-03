import { useState } from 'react';
import {
	Send,
	CheckCircle2,
	Copy,
	Check,
	User,
	Mail,
	Phone,
	MessageSquare,
	AlertCircle,
	ShieldCheck,
	Loader2,
	Lock,
	X,
	Download,
	Layers,
} from 'lucide-react';
import { apiSend, ApiError } from '@/lib/api-client';
import { trackFormSubmit, trackFormError, trackCopyTicket, trackDocumentAction } from '@/lib/analytics';
import { downloadTicketPdf } from '@/lib/ticket-pdf';
import TurnstileWidget from './TurnstileWidget';
import ModernSelect from './ModernSelect';

const fieldClass =
	'w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all placeholder:text-muted-foreground/70';
const textareaClass =
	'w-full p-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all placeholder:text-muted-foreground/70';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between';

const KATEGORI_PENGADUAN_OPTIONS = [
	'Pelayanan Nikah, Rujuk & KUA',
	'Penyelenggaraan Haji & Umrah',
	'Pendidikan Madrasah & Pesantren',
	'Pelayanan Informasi Publik & Dokumen PPID',
	'Bimbingan Masyarakat Islam & Agama',
	'Pelayanan Administrasi, Kepegawaian & Tata Usaha',
	'Sarana, Prasarana & Kualitas Pelayanan',
	'Lainnya / Aspirasi Umum Masyarakat',
];

interface PengaduanFormProps {
	siteKey?: string;
}

export default function PengaduanForm({
	siteKey = '0x4AAAAAADR1O_LSp1lgc3km',
}: PengaduanFormProps) {
	const [submitted, setSubmitted] = useState(false);
	const [regNumber, setRegNumber] = useState('');
	const [lastSubmittedTicket, setLastSubmittedTicket] = useState<{
		tiketNo: string;
		nama: string;
		email: string;
		phone: string;
		kategori: string;
		pesan: string;
	} | null>(null);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [copied, setCopied] = useState(false);

	// Cloudflare Turnstile state
	const [turnstileToken, setTurnstileToken] = useState('');
	const [turnstileKey, setTurnstileKey] = useState(0);

	const [formData, setFormData] = useState({
		nama: '',
		email: '',
		whatsapp: '',
		kategori: KATEGORI_PENGADUAN_OPTIONS[0],
		pesan: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Real-time Validation statuses
	const isNamaValid = formData.nama.trim().length >= 3;
	const cleanedDigits = formData.whatsapp.trim().replace(/[^\d]/g, '');
	const cleanPhoneWithPlus = formData.whatsapp.trim().replace(/[^\d+]/g, '');
	const isPhoneValid =
		/^(08[1-9][0-9]{7,11}|(\+?62)8[1-9][0-9]{7,11})$/.test(cleanPhoneWithPlus) &&
		cleanedDigits.length >= 10 &&
		cleanedDigits.length <= 14;

	const isEmailValid =
		!formData.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
	const isPesanValid = formData.pesan.trim().length >= 10;
	const isTurnstileValid = Boolean(turnstileToken);

	const isFormValid = isNamaValid && isPhoneValid && isEmailValid && isPesanValid && isTurnstileValid;

	const handleCopy = () => {
		if (!regNumber) return;
		navigator.clipboard.writeText(regNumber).then(() => {
			setCopied(true);
			trackCopyTicket(regNumber, 'pengaduan_form');
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.nama.trim() || formData.nama.trim().length < 3) {
			newErrors.nama = 'Nama pengadu / inisial wajib diisi minimal 3 karakter.';
		}

		if (!formData.whatsapp.trim()) {
			newErrors.whatsapp = 'Nomor HP/WhatsApp aktif wajib diisi.';
		} else if (!isPhoneValid) {
			if (!/^(08|628|\+?628)/.test(cleanPhoneWithPlus)) {
				newErrors.whatsapp = 'Nomor HP/WhatsApp harus diawali 08 atau 628.';
			} else if (cleanedDigits.length < 10) {
				newErrors.whatsapp = `Nomor WhatsApp terlalu pendek (minimal 10 digit, saat ini: ${cleanedDigits.length} digit).`;
			} else if (cleanedDigits.length > 14) {
				newErrors.whatsapp = `Nomor WhatsApp terlalu panjang (maksimal 14 digit, saat ini: ${cleanedDigits.length} digit).`;
			} else {
				newErrors.whatsapp = 'Format nomor HP/WhatsApp tidak valid (contoh: 081234567890).';
			}
		}

		const cleanEmail = formData.email.trim();
		if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
			newErrors.email = 'Format alamat email tidak valid (contoh: pengadu@domain.com).';
		}

		if (!formData.pesan.trim() || formData.pesan.trim().length < 10) {
			newErrors.pesan = 'Uraian pengaduan atau aspirasi wajib diisi minimal 10 karakter.';
		}

		if (!turnstileToken) {
			newErrors.turnstile = 'Silakan selesaikan verifikasi keamanan Cloudflare Turnstile.';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError('');

		if (!validate() || !isFormValid) {
			const firstErrorKey = Object.keys(errors)[0];
			if (firstErrorKey) {
				const el = document.getElementById(`field-${firstErrorKey}`);
				if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}

		setIsSubmitting(true);

		const rincianLengkap = [
			`[PENGADUAN & ASPIRASI MASYARAKAT]`,
			`Kategori Layanan: ${formData.kategori}`,
			`----------------------------------------`,
			formData.pesan.trim(),
		].join('\n');

		try {
			const data = await apiSend<{ tiket_no: string }>('/permohonan', 'POST', {
				jenis: 'PENGADUAN',
				nama: formData.nama.trim(),
				email: formData.email.trim(),
				phone: formData.whatsapp.trim(),
				rincian: rincianLengkap,
				tujuan: formData.kategori,
				turnstile_token: turnstileToken,
			});

			setLastSubmittedTicket({
				tiketNo: data.tiket_no,
				nama: formData.nama.trim(),
				email: formData.email.trim(),
				phone: formData.whatsapp.trim(),
				kategori: formData.kategori,
				pesan: formData.pesan.trim(),
			});
			setRegNumber(data.tiket_no);
			setSubmitted(true);
			trackFormSubmit('Pengaduan Masyarakat', 'PENGADUAN', data.tiket_no);
		} catch (err) {
			const errMsg =
				err instanceof ApiError ? err.message : 'Gagal mengirim pengaduan. Silakan coba lagi.';
			setSubmitError(errMsg);
			trackFormError('Pengaduan Masyarakat', errMsg);
			setTurnstileToken('');
			setTurnstileKey((k) => k + 1);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResetForm = () => {
		setSubmitted(false);
		setRegNumber('');
		setFormData({
			nama: '',
			email: '',
			whatsapp: '',
			kategori: KATEGORI_PENGADUAN_OPTIONS[0],
			pesan: '',
		});
		setErrors({});
		setTurnstileToken('');
		setTurnstileKey((k) => k + 1);
	};

	return (
		<div className="w-full space-y-6">
			{/* Form Container Ringkas & Sederhana */}
			<div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/70 shadow-sm space-y-6 w-full">
				<div className="border-b border-border/50 pb-3 flex items-center justify-between">
					<div className="space-y-0.5">
						<h3 className="font-black text-base sm:text-lg text-foreground flex items-center gap-2">
							<MessageSquare className="w-4 h-4 text-[#007144]" />
							<span>Formulir Pengaduan Online</span>
						</h3>
						<p className="text-xs text-muted-foreground">
							Identitas pengadu dijamin kerahasiaannya oleh Kemenag Barito Utara.
						</p>
					</div>
					<span className="text-[11px] text-red-500 font-bold">* Wajib</span>
				</div>

				<form onSubmit={handleSubmit} noValidate className="space-y-5">
					{/* Nama Lengkap / Inisial */}
					<div id="field-nama" className="space-y-1.5">
						<label className={labelClass}>
							<span>
								Nama Lengkap / Inisial Pengadu <span className="text-red-500">*</span>
							</span>
						</label>
						<div className="relative">
							<input
								type="text"
								required
								placeholder="Contoh: Ahmad Yani / Inisial (AY)"
								value={formData.nama}
								onChange={(e) => {
									setFormData({ ...formData, nama: e.target.value });
									if (errors.nama) setErrors({ ...errors, nama: '' });
								}}
								className={`${fieldClass} pr-9 ${errors.nama ? 'border-red-500' : isNamaValid ? 'border-emerald-500/50' : ''}`}
							/>
							{isNamaValid && (
								<div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
									<CheckCircle2 className="w-4 h-4" />
								</div>
							)}
						</div>
						{errors.nama && (
							<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
								<AlertCircle className="w-3.5 h-3.5 shrink-0" />
								<span>{errors.nama}</span>
							</p>
						)}
					</div>

					{/* Kontak: No WhatsApp & Email (Opsional) */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div id="field-whatsapp" className="space-y-1.5">
							<label className={labelClass}>
								<span>
									No. WhatsApp / HP Aktif <span className="text-red-500">*</span>
								</span>
								<span
									className={`text-[11px] font-mono font-bold ${
										isPhoneValid
											? 'text-emerald-600 dark:text-emerald-400'
											: cleanedDigits.length > 0
												? 'text-amber-600 dark:text-amber-400'
												: 'text-muted-foreground'
									}`}
								>
									{cleanedDigits.length} digit (10-14 digit)
								</span>
							</label>
							<div className="relative">
								<input
									type="tel"
									required
									maxLength={15}
									placeholder="contoh: 081234567890"
									value={formData.whatsapp}
									onChange={(e) => {
										const raw = e.target.value.replace(/[^\d+]/g, '').slice(0, 15);
										setFormData({ ...formData, whatsapp: raw });
										if (errors.whatsapp) setErrors({ ...errors, whatsapp: '' });
									}}
									className={`${fieldClass} font-mono pr-9 ${errors.whatsapp ? 'border-red-500' : isPhoneValid ? 'border-emerald-500/50' : ''}`}
								/>
								{isPhoneValid && (
									<div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
										<CheckCircle2 className="w-4 h-4" />
									</div>
								)}
							</div>
							{errors.whatsapp && (
								<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.whatsapp}</span>
								</p>
							)}
						</div>

						<div id="field-email" className="space-y-1.5">
							<label className={labelClass}>
								<span>
									Email Aktif{' '}
									<span className="text-[11px] font-normal text-muted-foreground lowercase">(opsional)</span>
								</span>
							</label>
							<input
								type="email"
								placeholder="contoh: pengadu@gmail.com (opsional)"
								value={formData.email}
								onChange={(e) => {
									setFormData({ ...formData, email: e.target.value });
									if (errors.email) setErrors({ ...errors, email: '' });
								}}
								className={`${fieldClass} ${errors.email ? 'border-red-500' : ''}`}
							/>
							{errors.email && (
								<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.email}</span>
								</p>
							)}
						</div>
					</div>

					{/* Kategori Layanan yang Diadukan */}
					<div className="space-y-1.5">
						<label className={labelClass}>
							<span>Kategori Layanan yang Diadukan</span>
						</label>
						<ModernSelect
							value={formData.kategori}
							onChange={(val) => setFormData({ ...formData, kategori: val })}
							options={KATEGORI_PENGADUAN_OPTIONS}
							icon={Layers}
							placeholder="Pilih kategori pelayanan..."
						/>
					</div>

					{/* Uraian Pengaduan */}
					<div id="field-pesan" className="space-y-1.5">
						<label className={labelClass}>
							<span>
								Uraian Pengaduan / Aspirasi / Masukan <span className="text-red-500">*</span>
							</span>
							<span
								className={`text-[11px] font-mono font-bold ${
									isPesanValid
										? 'text-emerald-600 dark:text-emerald-400'
										: formData.pesan.length > 0
											? 'text-amber-600 dark:text-amber-400'
											: 'text-muted-foreground'
								}`}
							>
								{formData.pesan.length} karakter {isPesanValid ? '(Valid)' : '(min. 10)'}
							</span>
						</label>
						<textarea
							required
							rows={4}
							placeholder="Tuliskan kronologi keluhan, ketidaksesuaian pelayanan, nama unit/seksi terkait, waktu kejadian, serta saran perbaikan yang Anda harapkan..."
							value={formData.pesan}
							onChange={(e) => {
								setFormData({ ...formData, pesan: e.target.value });
								if (errors.pesan) setErrors({ ...errors, pesan: '' });
							}}
							className={`${textareaClass} ${errors.pesan ? 'border-red-500' : isPesanValid ? 'border-emerald-500/50' : ''}`}
						/>
						{errors.pesan && (
							<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
								<AlertCircle className="w-3.5 h-3.5 shrink-0" />
								<span>{errors.pesan}</span>
							</p>
						)}
					</div>

					{/* Error Alert */}
					{submitError && (
						<div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-start gap-2 animate-in fade-in">
							<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
							<span>{submitError}</span>
						</div>
					)}

					{/* Action Footer: Turnstile & Tombol Kirim */}
					<div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
						<div id="field-turnstile" className="shrink-0">
							<TurnstileWidget
								key={turnstileKey}
								siteKey={siteKey}
								onToken={(token) => {
									setTurnstileToken(token);
									if (errors.turnstile) setErrors((prev) => ({ ...prev, turnstile: '' }));
								}}
								size="normal"
							/>
							{errors.turnstile && (
								<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.turnstile}</span>
								</p>
							)}
						</div>

						<div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-1.5">
							<button
								type="submit"
								disabled={!isFormValid || isSubmitting}
								className={`w-full sm:w-auto h-[65px] px-8 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-2.5 whitespace-nowrap ${
									!isFormValid || isSubmitting
										? 'bg-muted text-muted-foreground/60 cursor-not-allowed border border-border/60'
										: 'bg-[#007144] hover:bg-[#005935] text-white cursor-pointer active:scale-[0.98]'
								}`}
								title={!isFormValid ? 'Lengkapi seluruh isian wajib dan verifikasi keamanan' : 'Kirim pengaduan'}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										<span>Mengirim...</span>
									</>
								) : !isFormValid ? (
									<>
										<Lock className="w-4 h-4 text-muted-foreground/50" />
										<span>Kirim Pengaduan</span>
									</>
								) : (
									<>
										<Send className="w-4 h-4" />
										<span>Kirim Pengaduan</span>
									</>
								)}
							</button>

							{!isFormValid && (
								<span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
									{!isNamaValid
										? 'Nama belum lengkap'
										: !isPhoneValid
											? 'No. WhatsApp belum valid'
											: !isPesanValid
												? 'Uraian pengaduan min. 10 karakter'
												: !isTurnstileValid
													? 'Selesaikan verifikasi keamanan'
													: 'Lengkapi isian wajib'}
								</span>
							)}
						</div>
					</div>
				</form>
			</div>

			{/* Floating Success Modal with Backdrop Blur */}
			{submitted && (
				<div
					role="dialog"
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
				>
					<div className="relative w-full max-w-xl bg-card border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
						{/* Close X Button */}
						<button
							type="button"
							onClick={handleResetForm}
							className="absolute right-4 top-4 w-9 h-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
							title="Tutup Dialog"
						>
							<X className="w-5 h-5" />
						</button>

						{/* Success Icon */}
						<div className="w-16 h-16 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
							<CheckCircle2 className="w-9 h-9" />
						</div>

						{/* Title & Subtitle */}
						<div className="space-y-1.5">
							<span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 inline-block">
								Aspirasi Diterima
							</span>
							<h2 className="text-xl sm:text-2xl font-black text-foreground">
								Pengaduan Berhasil Terkirim!
							</h2>
							<p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
								Aspirasi Anda telah tercatat pada sistem dan diteruskan ke Tim Pengawasan Internal Kemenag Barito Utara.
							</p>
						</div>

						{/* Ticket Card Monospace */}
						<div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3 shadow-xs">
							<div className="text-left">
								<span className="text-[10px] uppercase font-extrabold text-muted-foreground block tracking-wider">
									Nomor Registrasi Tiket Pengaduan
								</span>
								<span className="font-mono font-black text-xl text-teal-700 dark:text-teal-300">
									{regNumber}
								</span>
							</div>
							<button
								type="button"
								onClick={handleCopy}
								className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
									copied
										? 'bg-emerald-600 text-white border-emerald-600'
										: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-700 hover:text-white dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-700 dark:hover:text-white'
								}`}
								title="Salin Nomor Tiket"
							>
								{copied ? (
									<>
										<Check className="w-4 h-4 text-white" />
										<span>Tersalin!</span>
									</>
								) : (
									<>
										<Copy className="w-4 h-4" />
										<span>Salin Tiket</span>
									</>
								)}
							</button>
						</div>

						{/* Processing Info */}
						<div className="p-4 rounded-2xl bg-accent/30 border border-border/50 text-xs text-muted-foreground text-left space-y-1.5">
							<div className="flex items-center gap-2 font-bold text-foreground">
								<ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
								<span>Jaminan Kerahasiaan &amp; Penanganan:</span>
							</div>
							<ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs">
								<li>Identitas pelapor dilindungi kerahasiaannya sesuai UU Perlindungan Data Pribadi (UU PDP).</li>
								<li>Laporan akan ditelaah oleh Tim Pengawasan Internal Kemenag Barito Utara dalam <strong>3-7 hari kerja</strong>.</li>
								<li>Status tindak lanjut dapat dipantau kapan saja lewat fitur <strong>Lacak Tiket</strong> di navbar.</li>
							</ul>
						</div>

						{/* Action Controls - 1 Baris Rapih Tanpa Wrap */}
						<div className="flex flex-col sm:flex-row justify-center items-center gap-2.5 pt-2 w-full">
							<button
								type="button"
								onClick={() => {
									const ticketId = lastSubmittedTicket?.tiketNo || regNumber;
									downloadTicketPdf({
										tiketId: ticketId,
										namaPemohon: lastSubmittedTicket?.nama || formData.nama || 'Masyarakat',
										phone: lastSubmittedTicket?.phone || formData.whatsapp || '',
										email: lastSubmittedTicket?.email || formData.email || '',
										kategori: lastSubmittedTicket?.kategori || formData.kategori,
										rincianInformasi: lastSubmittedTicket?.pesan || formData.pesan || '-',
										tglPengajuan: new Date().toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										}),
										status: 'MENUNGGU PENELAAHAN TIM PENGAWASAN',
										jenis: 'PENGADUAN',
									});
									trackDocumentAction('download', `${ticketId}.pdf`, 'Bukti Pengaduan Masyarakat');
								}}
								className="w-full sm:w-auto flex-1 h-11 px-4 inline-flex items-center justify-center gap-2 bg-[#007144] hover:bg-[#005935] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer active:scale-[0.98] transition-all whitespace-nowrap"
							>
								<Download className="w-4 h-4 shrink-0" />
								<span className="whitespace-nowrap">Download Bukti Pengaduan</span>
							</button>
							<button
								type="button"
								onClick={handleResetForm}
								className="w-full sm:w-auto h-11 px-4 border border-input bg-card hover:bg-accent rounded-xl text-xs font-bold text-foreground transition-all cursor-pointer whitespace-nowrap"
							>
								<span className="whitespace-nowrap">Tutup &amp; Kirim Baru</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}