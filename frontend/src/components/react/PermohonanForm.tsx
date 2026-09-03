import { useState } from 'react';
import {
	CheckCircle2,
	Send,
	Printer,
	Copy,
	Check,
	User,
	Building2,
	Mail,
	Phone,
	MapPin,
	Briefcase,
	FileText,
	HelpCircle,
	AlertCircle,
	ShieldCheck,
	Loader2,
	Lock,
	X,
	Download,
} from 'lucide-react';
import { apiSend, ApiError } from '@/lib/api-client';
import { trackFormSubmit, trackFormError, trackCopyTicket, trackDocumentAction } from '@/lib/analytics';
import { downloadTicketPdf } from '@/lib/ticket-pdf';
import PdfTicketModal from './PdfTicketModal';
import TurnstileWidget from './TurnstileWidget';
import ModernSelect from './ModernSelect';

const fieldClass =
	'w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all placeholder:text-muted-foreground/70';
const textareaClass =
	'w-full p-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all placeholder:text-muted-foreground/70';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between';

const PEKERJAAN_OPTIONS = [
	'Masyarakat Umum / Lainnya',
	'PNS / ASN / TNI / Polri',
	'Karyawan BUMN / BUMD',
	'Karyawan Swasta',
	'Wiraswasta / Pengusaha',
	'Peneliti / Dosen / Akademisi',
	'Mahasiswa / Pelajar',
	'Jurnalis / Media Massa',
	'LSM / Advokat / NGO',
];

const CARA_MEMPEROLEH_OPTIONS = [
	{
		label: 'Melihat / Membaca / Mendengarkan / Mencatat',
		value: 'Melihat / Membaca / Mendengarkan / Mencatat',
		description: 'Akses langsung di tempat pelayanan informasi',
	},
	{
		label: 'Mendapatkan Salinan Softcopy (Dokumen Elektronik / PDF)',
		value: 'Mendapatkan Salinan Softcopy (Dokumen Elektronik/PDF)',
		description: 'Format file digital dikirimkan ke email atau WhatsApp',
	},
	{
		label: 'Mendapatkan Salinan Hardcopy (Dokumen Cetak Fisik)',
		value: 'Mendapatkan Salinan Hardcopy (Dokumen Cetak Fisik)',
		description: 'Dokumen dicetak fisik resmi berkop instansi',
	},
];

const CARA_PENYERAHAN_OPTIONS = [
	{
		label: 'Email / WhatsApp Dokumen Resmi',
		value: 'Email / WhatsApp Dokumen Resmi',
		description: 'Pengiriman tercepat secara digital tanpa antri',
	},
	{
		label: 'Mengambil Langsung ke Meja Layanan PPID Kemenag Barito Utara',
		value: 'Mengambil Langsung ke Meja Layanan PPID Kemenag Barito Utara',
		description: 'Ambil langsung di kantor pada jam operasional kerja',
	},
	{
		label: 'Pos / Jasa Ekspedisi (Biaya Pengiriman Ditanggung Pemohon)',
		value: 'Pos / Jasa Ekspedisi (Biaya Pengiriman Ditanggung Pemohon)',
		description: 'Dikirimkan ke alamat domisili melalui kurir',
	},
];

interface PermohonanFormProps {
	siteKey?: string;
}

export default function PermohonanForm({
	siteKey = '0x4AAAAAADR1O_LSp1lgc3km',
}: PermohonanFormProps) {
	const [kategoriPemohon, setKategoriPemohon] = useState<'PERORANGAN' | 'LEMBAGA'>('PERORANGAN');
	const [submitted, setSubmitted] = useState(false);
	const [regNumber, setRegNumber] = useState('');
	const [lastSubmittedTicket, setLastSubmittedTicket] = useState<{
		tiketNo: string;
		nama: string;
		nik: string;
		rincian: string;
		email: string;
	} | null>(null);
	const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [copied, setCopied] = useState(false);

	// Cloudflare Turnstile state
	const [turnstileToken, setTurnstileToken] = useState('');
	const [turnstileKey, setTurnstileKey] = useState(0);

	// Form values
	const [formData, setFormData] = useState({
		nama: '',
		nik: '',
		email: '',
		phone: '',
		pekerjaan: 'Masyarakat Umum / Lainnya',
		alamat: '',
		rincian: '',
		tujuan: '',
		caraMemperoleh: CARA_MEMPEROLEH_OPTIONS[1].value,
		caraMendapatkan: CARA_PENYERAHAN_OPTIONS[0].value,
	});

	const [agreement, setAgreement] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Real-time field validation statuses
	const isNamaValid = formData.nama.trim().length >= 3;
	const isNikValid =
		kategoriPemohon === 'PERORANGAN'
			? formData.nik.trim().length === 16 && /^\d{16}$/.test(formData.nik.trim())
			: formData.nik.trim().length >= 4;

	const cleanedDigits = formData.phone.trim().replace(/[^\d]/g, '');
	const cleanPhoneWithPlus = formData.phone.trim().replace(/[^\d+]/g, '');
	const isPhoneValid =
		/^(08[1-9][0-9]{7,11}|(\+?62)8[1-9][0-9]{7,11})$/.test(cleanPhoneWithPlus) &&
		cleanedDigits.length >= 10 &&
		cleanedDigits.length <= 14;

	const isEmailValid =
		!formData.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
	const isAlamatValid = formData.alamat.trim().length >= 6;
	const isRincianValid = formData.rincian.trim().length >= 10;
	const isTujuanValid = formData.tujuan.trim().length >= 5;
	const isAgreementValid = agreement === true;
	const isTurnstileValid = Boolean(turnstileToken);

	// Seluruh kolom wajib harus terpenuhi agar tombol aktif
	const isFormValid =
		isNamaValid &&
		isNikValid &&
		isPhoneValid &&
		isEmailValid &&
		isAlamatValid &&
		isRincianValid &&
		isTujuanValid &&
		isAgreementValid &&
		isTurnstileValid;

	const handleCopy = () => {
		if (!regNumber) return;
		navigator.clipboard.writeText(regNumber).then(() => {
			setCopied(true);
			trackCopyTicket(regNumber, 'permohonan_form');
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};

		// Nama Lengkap
		if (!formData.nama.trim() || formData.nama.trim().length < 3) {
			newErrors.nama =
				kategoriPemohon === 'PERORANGAN'
					? 'Nama lengkap wajib diisi minimal 3 karakter sesuai KTP.'
					: 'Nama resmi lembaga/organisasi wajib diisi minimal 3 karakter.';
		}

		// NIK / Nomor Legalitas (Harus tepat 16 digit jika Perorangan)
		if (kategoriPemohon === 'PERORANGAN') {
			const cleanNik = formData.nik.trim();
			if (!cleanNik) {
				newErrors.nik = 'Nomor NIK KTP wajib diisi tepat 16 digit angka.';
			} else if (cleanNik.length !== 16 || !/^\d{16}$/.test(cleanNik)) {
				newErrors.nik = `NIK harus tepat 16 digit angka, tidak boleh kurang atau lebih (saat ini: ${cleanNik.length} digit).`;
			}
		} else {
			if (!formData.nik.trim() || formData.nik.trim().length < 4) {
				newErrors.nik = 'Nomor Akta Pendirian / SK Kemenkumham / NIK Penanggung Jawab wajib diisi.';
			}
		}

		// Email Aktif (Opsional, tapi jika diisi wajib valid)
		const cleanEmail = formData.email.trim();
		if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
			newErrors.email = 'Format alamat email tidak valid (contoh: pemohon@domain.com).';
		}

		// Phone / WhatsApp (Wajib: 10 - 14 digit, diawali 08 atau 628)
		if (!formData.phone.trim()) {
			newErrors.phone = 'Nomor HP/WhatsApp aktif wajib diisi.';
		} else if (!isPhoneValid) {
			if (!/^(08|628|\+?628)/.test(cleanPhoneWithPlus)) {
				newErrors.phone = 'Nomor HP/WhatsApp harus diawali 08 atau 628.';
			} else if (cleanedDigits.length < 10) {
				newErrors.phone = `Nomor WhatsApp terlalu pendek (minimal 10 digit, saat ini: ${cleanedDigits.length} digit).`;
			} else if (cleanedDigits.length > 14) {
				newErrors.phone = `Nomor WhatsApp terlalu panjang (maksimal 14 digit, saat ini: ${cleanedDigits.length} digit).`;
			} else {
				newErrors.phone =
					'Nomor HP/WhatsApp tidak valid. Wajib format nomor seluler Indonesia (contoh: 081234567890).';
			}
		}

		// Alamat Domisili
		if (!formData.alamat.trim() || formData.alamat.trim().length < 6) {
			newErrors.alamat = 'Alamat domisili lengkap wajib diisi (minimal 6 karakter).';
		}

		// Rincian Informasi
		if (!formData.rincian.trim() || formData.rincian.trim().length < 10) {
			newErrors.rincian =
				'Rincian informasi yang dibutuhkan wajib dijelaskan secara spesifik (minimal 10 karakter).';
		}

		// Tujuan Penggunaan
		if (!formData.tujuan.trim() || formData.tujuan.trim().length < 5) {
			newErrors.tujuan = 'Tujuan penggunaan informasi wajib diisi secara jelas (minimal 5 karakter).';
		}

		// Pernyataan / Pakta Integritas
		if (!agreement) {
			newErrors.agreement =
				'Anda wajib mencentang persetujuan kebenaran data & kepatuhan UU KIP No. 14 Tahun 2008.';
		}

		// Cloudflare Turnstile
		if (!turnstileToken) {
			newErrors.turnstile =
				'Silakan selesaikan verifikasi Cloudflare Turnstile di samping terlebih dahulu.';
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

		// Format detail rincian terstruktur
		const rincianLengkap = [
			`[KATEGORI: ${kategoriPemohon === 'PERORANGAN' ? 'Perorangan (Individu WNI)' : 'Lembaga / Badan Hukum / Organisasi'}]`,
			`Pekerjaan: ${formData.pekerjaan || '-'}`,
			`Alamat Domisili: ${formData.alamat}`,
			`Cara Memperoleh Informasi: ${formData.caraMemperoleh}`,
			`Cara Penyerahan Salinan: ${formData.caraMendapatkan}`,
			`----------------------------------------`,
			`RINCIAN INFORMASI YANG DIBUTUHKAN:`,
			formData.rincian.trim(),
		].join('\n');

		try {
			const data = await apiSend<{ tiket_no: string }>('/permohonan', 'POST', {
				jenis: 'PERMOHONAN',
				nama: formData.nama.trim(),
				nik: formData.nik.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim(),
				rincian: rincianLengkap,
				tujuan: formData.tujuan.trim(),
				turnstile_token: turnstileToken,
			});

			setLastSubmittedTicket({
				tiketNo: data.tiket_no,
				nama: formData.nama.trim(),
				nik: formData.nik.trim(),
				rincian: formData.rincian.trim(),
				email: formData.email.trim(),
			});
			setRegNumber(data.tiket_no);
			setSubmitted(true);
			trackFormSubmit('Permohonan Informasi Online', 'PERMOHONAN', data.tiket_no);
		} catch (err) {
			const errMsg =
				err instanceof ApiError ? err.message : 'Gagal mengirim permohonan. Silakan coba lagi.';
			setSubmitError(errMsg);
			trackFormError('Permohonan Informasi Online', errMsg);
			// Reset turnstile token bila submit gagal
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
			nik: '',
			email: '',
			phone: '',
			pekerjaan: 'Masyarakat Umum / Lainnya',
			alamat: '',
			rincian: '',
			tujuan: '',
			caraMemperoleh: CARA_MEMPEROLEH_OPTIONS[1].value,
			caraMendapatkan: CARA_PENYERAHAN_OPTIONS[0].value,
		});
		setAgreement(false);
		setErrors({});
		setTurnstileToken('');
		setTurnstileKey((k) => k + 1);
	};

	return (
		<section className="w-full space-y-6">
			{/* Form Container (Selalu tampil di halaman) */}
			<div className="p-6 sm:p-8 md:p-12 rounded-3xl bg-card border border-border/70 shadow-sm space-y-8 w-full">
				{/* Header Info Banner */}
				<div className="p-4 rounded-2xl bg-[#007144]/10 border border-[#007144]/20 flex items-start gap-3">
					<ShieldCheck className="w-5 h-5 text-[#007144] shrink-0 mt-0.5" />
					<div className="space-y-1 text-xs">
						<p className="font-extrabold text-[#007144] text-xs sm:text-sm">
							Standar Pelayanan Informasi Publik Online (UU KIP No. 14/2008)
						</p>
						<p className="text-muted-foreground leading-relaxed">
							Pastikan data diri dan rincian informasi publik diisi dengan benar dan dapat dipertanggungjawabkan. Identitas Anda dilindungi sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} noValidate className="space-y-8">
					{/* SEKSI 1: Kategori & Data Pemohon */}
					<div className="space-y-4">
						<div className="border-b border-border/50 pb-2 flex items-center justify-between">
							<div className="flex items-center gap-2 font-black text-sm sm:text-base text-foreground">
								<User className="w-4 h-4 text-[#007144]" />
								<span>1. Identitas &amp; Profil Pemohon</span>
							</div>
							<span className="text-[11px] text-red-500 font-bold">* Wajib Diisi</span>
						</div>

						{/* Tab Kategori Pemohon */}
						<div className="space-y-1.5">
							<label className={labelClass}>
								<span>Kategori Pemohon <span className="text-red-500">*</span></span>
							</label>
							<div className="grid grid-cols-2 gap-3 max-w-md">
								<button
									type="button"
									onClick={() => {
										setKategoriPemohon('PERORANGAN');
										setErrors((prev) => ({ ...prev, nik: '' }));
									}}
									className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
										kategoriPemohon === 'PERORANGAN'
											? 'bg-[#007144] text-white border-[#007144] shadow-xs'
											: 'bg-background text-muted-foreground border-input hover:bg-accent'
									}`}
								>
									<User className="w-4 h-4" />
									<span>Perorangan (Individu)</span>
								</button>

								<button
									type="button"
									onClick={() => {
										setKategoriPemohon('LEMBAGA');
										setErrors((prev) => ({ ...prev, nik: '' }));
									}}
									className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
										kategoriPemohon === 'LEMBAGA'
											? 'bg-[#007144] text-white border-[#007144] shadow-xs'
											: 'bg-background text-muted-foreground border-input hover:bg-accent'
									}`}
								>
									<Building2 className="w-4 h-4" />
									<span>Lembaga / Organisasi</span>
								</button>
							</div>
						</div>

						{/* Nama Lengkap & NIK */}
						<div className="grid gap-5 md:grid-cols-2">
							<div id="field-nama" className="space-y-1.5">
								<label className={labelClass}>
									<span>
										{kategoriPemohon === 'PERORANGAN' ? 'Nama Lengkap Sesuai KTP' : 'Nama Resmi Lembaga / Organisasi'}{' '}
										<span className="text-red-500">*</span>
									</span>
								</label>
								<div className="relative">
									<input
										type="text"
										required
										placeholder={kategoriPemohon === 'PERORANGAN' ? 'Contoh: Ahmad Yani' : 'Contoh: Yayasan Al-Ikhlas'}
										value={formData.nama}
										onChange={(e) => {
											setFormData({ ...formData, nama: e.target.value });
											if (errors.nama) setErrors({ ...errors, nama: '' });
										}}
										className={`${fieldClass} pr-9 ${errors.nama ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : isNamaValid ? 'border-emerald-500/50' : ''}`}
									/>
									{isNamaValid && (
										<div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
											<CheckCircle2 className="w-4 h-4" />
										</div>
									)}
								</div>
								{errors.nama && (
									<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.nama}</span>
									</p>
								)}
							</div>

							<div id="field-nik" className="space-y-1.5">
								<label className={labelClass}>
									<span>
										{kategoriPemohon === 'PERORANGAN' ? 'NIK KTP (16 Digit)' : 'No. Akta / SK / Legalitas Lembaga'}{' '}
										<span className="text-red-500">*</span>
									</span>
									{kategoriPemohon === 'PERORANGAN' && (
										<span
											className={`text-[11px] font-mono font-bold transition-colors ${
												formData.nik.length === 16
													? 'text-emerald-600 dark:text-emerald-400'
													: formData.nik.length > 0
														? 'text-amber-600 dark:text-amber-400'
														: 'text-muted-foreground'
											}`}
										>
											{formData.nik.length}/16 digit
										</span>
									)}
								</label>
								<div className="relative">
									<input
										type="text"
										required
										maxLength={kategoriPemohon === 'PERORANGAN' ? 16 : 50}
										placeholder={
											kategoriPemohon === 'PERORANGAN'
												? '6205xxxxxxxxxxxx (16 Digit Angka)'
												: 'Nomor SK Kemenkumham / Akta'
										}
										value={formData.nik}
										onChange={(e) => {
											const val =
												kategoriPemohon === 'PERORANGAN'
													? e.target.value.replace(/\D/g, '').slice(0, 16)
													: e.target.value;
											setFormData({ ...formData, nik: val });
											if (kategoriPemohon === 'PERORANGAN') {
												if (val.length > 0 && val.length < 16) {
													setErrors((prev) => ({
														...prev,
														nik: `NIK harus tepat 16 digit angka (saat ini: ${val.length} digit, kurang ${16 - val.length} digit).`,
													}));
												} else {
													setErrors((prev) => ({ ...prev, nik: '' }));
												}
											} else {
												if (errors.nik) setErrors((prev) => ({ ...prev, nik: '' }));
											}
										}}
										className={`${fieldClass} font-mono pr-9 ${
											errors.nik
												? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
												: isNikValid
													? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
													: ''
										}`}
									/>
									{isNikValid && (
										<div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
											<CheckCircle2 className="w-4 h-4" />
										</div>
									)}
								</div>
								{errors.nik && (
									<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.nik}</span>
									</p>
								)}
							</div>
						</div>

						{/* Email (Opsional) & No WhatsApp */}
						<div className="grid gap-5 md:grid-cols-2">
							<div id="field-email" className="space-y-1.5">
								<label className={labelClass}>
									<span>
										Email Aktif{' '}
										<span className="text-[11px] font-normal text-muted-foreground lowercase">(opsional)</span>
									</span>
								</label>
								<input
									type="email"
									placeholder="contoh: pemohon@gmail.com (opsional)"
									value={formData.email}
									onChange={(e) => {
										setFormData({ ...formData, email: e.target.value });
										if (errors.email) setErrors({ ...errors, email: '' });
									}}
									className={`${fieldClass} ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
								/>
								{errors.email && (
									<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.email}</span>
									</p>
								)}
							</div>

							<div id="field-phone" className="space-y-1.5">
								<label className={labelClass}>
									<span>Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span></span>
									<span
										className={`text-[11px] font-mono font-bold transition-colors ${
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
										value={formData.phone}
										onChange={(e) => {
											const raw = e.target.value.replace(/[^\d+]/g, '').slice(0, 15);
											setFormData({ ...formData, phone: raw });
											const cleaned = raw.replace(/[^\d]/g, '');
											if (raw.length > 0) {
												if (!/^(08|628|\+?628)/.test(raw)) {
													setErrors((prev) => ({
														...prev,
														phone: 'Nomor HP/WhatsApp harus diawali 08 atau 628.',
													}));
												} else if (cleaned.length < 10) {
													setErrors((prev) => ({
														...prev,
														phone: `Nomor WhatsApp terlalu pendek (minimal 10 digit, saat ini: ${cleaned.length} digit).`,
													}));
												} else if (cleaned.length > 14) {
													setErrors((prev) => ({
														...prev,
														phone: `Nomor WhatsApp terlalu panjang (maksimal 14 digit, saat ini: ${cleaned.length} digit).`,
													}));
												} else {
													setErrors((prev) => ({ ...prev, phone: '' }));
												}
											} else {
												setErrors((prev) => ({ ...prev, phone: '' }));
											}
										}}
										className={`${fieldClass} font-mono pr-9 ${
											errors.phone
												? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
												: isPhoneValid
													? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
													: ''
										}`}
									/>
									{isPhoneValid && (
										<div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
											<CheckCircle2 className="w-4 h-4" />
										</div>
									)}
								</div>
								{errors.phone && (
									<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.phone}</span>
									</p>
								)}
							</div>
						</div>

						{/* Pekerjaan (ModernSelect) & Alamat Domisili */}
						<div className="grid gap-5 md:grid-cols-2">
							<div className="space-y-1.5">
								<label className={labelClass}>
									<span>Pekerjaan / Profesi</span>
								</label>
								<ModernSelect
									value={formData.pekerjaan}
									onChange={(val) => setFormData({ ...formData, pekerjaan: val })}
									options={PEKERJAAN_OPTIONS}
									icon={Briefcase}
									placeholder="Pilih pekerjaan / profesi..."
								/>
							</div>

							<div id="field-alamat" className="space-y-1.5">
								<label className={labelClass}>
									<span>Alamat Domisili Lengkap <span className="text-red-500">*</span></span>
								</label>
								<input
									type="text"
									required
									placeholder="Jl. Pramuka No. 12, Kel. Lanjas, Muara Teweh"
									value={formData.alamat}
									onChange={(e) => {
										setFormData({ ...formData, alamat: e.target.value });
										if (errors.alamat) setErrors({ ...errors, alamat: '' });
									}}
									className={`${fieldClass} ${errors.alamat ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : isAlamatValid ? 'border-emerald-500/50' : ''}`}
								/>
								{errors.alamat && (
									<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.alamat}</span>
									</p>
								)}
							</div>
						</div>
					</div>

					{/* SEKSI 2: Rincian Permohonan Informasi */}
					<div className="space-y-4 pt-2">
						<div className="border-b border-border/50 pb-2 flex items-center justify-between">
							<div className="flex items-center gap-2 font-black text-sm sm:text-base text-foreground">
								<FileText className="w-4 h-4 text-[#007144]" />
								<span>2. Rincian Informasi yang Diminta</span>
							</div>
							<span className="text-[11px] text-muted-foreground">Minimal 10 Karakter</span>
						</div>

						<div id="field-rincian" className="space-y-1.5">
							<label className={labelClass}>
								<span>Rincian Informasi Publik yang Dibutuhkan <span className="text-red-500">*</span></span>
								<span
									className={`text-[11px] font-mono font-bold transition-colors ${
										isRincianValid
											? 'text-emerald-600 dark:text-emerald-400'
											: formData.rincian.length > 0
												? 'text-amber-600 dark:text-amber-400'
												: 'text-muted-foreground'
									}`}
								>
									{formData.rincian.length} karakter {isRincianValid ? '(Valid)' : '(min. 10)'}
								</span>
							</label>
							<textarea
								required
								rows={4}
								placeholder="Jelaskan secara spesifik rincian dokumen atau data informasi publik yang Anda minta, tahun anggaran, serta unit/seksi terkait pada Kemenag Barito Utara..."
								value={formData.rincian}
								onChange={(e) => {
									setFormData({ ...formData, rincian: e.target.value });
									if (errors.rincian) setErrors({ ...errors, rincian: '' });
								}}
								className={`${textareaClass} ${errors.rincian ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : isRincianValid ? 'border-emerald-500/50' : ''}`}
							/>
							{errors.rincian && (
								<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.rincian}</span>
								</p>
							)}
						</div>

						<div id="field-tujuan" className="space-y-1.5">
							<label className={labelClass}>
								<span>Tujuan Penggunaan Informasi <span className="text-red-500">*</span></span>
								<span
									className={`text-[11px] font-mono font-bold transition-colors ${
										isTujuanValid
											? 'text-emerald-600 dark:text-emerald-400'
											: formData.tujuan.length > 0
												? 'text-amber-600 dark:text-amber-400'
												: 'text-muted-foreground'
									}`}
								>
									{formData.tujuan.length} karakter {isTujuanValid ? '(Valid)' : '(min. 5)'}
								</span>
							</label>
							<textarea
								required
								rows={2}
								placeholder="Sebutkan tujuan penggunaan informasi (contoh: Penyusunan Karya Tulis Ilmiah / Skripsi, Pengawasan Kebijakan Publik, Riset Keagamaan, dll)..."
								value={formData.tujuan}
								onChange={(e) => {
									setFormData({ ...formData, tujuan: e.target.value });
									if (errors.tujuan) setErrors({ ...errors, tujuan: '' });
								}}
								className={`${textareaClass} ${errors.tujuan ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : isTujuanValid ? 'border-emerald-500/50' : ''}`}
							/>
							{errors.tujuan && (
								<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.tujuan}</span>
								</p>
							)}
						</div>
					</div>

					{/* SEKSI 3: Preferensi Layanan (ModernSelect) */}
					<div className="space-y-4 pt-2">
						<div className="border-b border-border/50 pb-2 flex items-center justify-between">
							<div className="flex items-center gap-2 font-black text-sm sm:text-base text-foreground">
								<HelpCircle className="w-4 h-4 text-[#007144]" />
								<span>3. Cara Memperoleh &amp; Format Salinan Informasi</span>
							</div>
						</div>

						<div className="grid gap-5 md:grid-cols-2">
							<div className="space-y-1.5">
								<label className={labelClass}>
									<span>Cara Memperoleh Informasi</span>
								</label>
								<ModernSelect
									value={formData.caraMemperoleh}
									onChange={(val) => setFormData({ ...formData, caraMemperoleh: val })}
									options={CARA_MEMPEROLEH_OPTIONS}
									placeholder="Pilih cara memperoleh informasi..."
								/>
							</div>

							<div className="space-y-1.5">
								<label className={labelClass}>
									<span>Bentuk Penyerahan Salinan</span>
								</label>
								<ModernSelect
									value={formData.caraMendapatkan}
									onChange={(val) => setFormData({ ...formData, caraMendapatkan: val })}
									options={CARA_PENYERAHAN_OPTIONS}
									placeholder="Pilih bentuk penyerahan salinan..."
								/>
							</div>
						</div>
					</div>

					{/* SEKSI 4: Pakta Pernyataan & Pengiriman */}
					<div className="space-y-6 pt-2 border-t border-border/40">
						{/* Pernyataan / Pakta Integritas */}
						<div id="field-agreement" className="space-y-1.5">
							<label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer select-none">
								<input
									type="checkbox"
									checked={agreement}
									onChange={(e) => {
										setAgreement(e.target.checked);
										if (errors.agreement) setErrors({ ...errors, agreement: '' });
									}}
									className="w-4 h-4 mt-0.5 rounded text-[#007144] focus:ring-[#007144] border-input cursor-pointer"
								/>
								<span className="text-xs text-foreground/90 leading-relaxed">
									Saya menyatakan dengan sesungguhnya bahwa data yang saya isikan adalah benar dan sah. Informasi yang diperoleh hanya akan digunakan untuk tujuan yang telah disebutkan di atas serta tidak melanggar ketentuan peraturan perundang-undangan (UU KIP No. 14 Tahun 2008 &amp; UU PDP No. 27 Tahun 2022).
								</span>
							</label>
							{errors.agreement && (
								<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.agreement}</span>
								</p>
							)}
						</div>

						{/* Error Banner jika submit gagal */}
						{submitError && (
							<div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
								<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
								<div className="space-y-0.5">
									<p className="font-extrabold">Gagal Mengirim Permohonan</p>
									<p className="font-normal text-[11px]">{submitError}</p>
								</div>
							</div>
						)}

						{/* Action Footer: Trust Info di Kiri, CF Turnstile & Tombol Kirim Berdampingan Serasi di Kanan */}
						<div className="pt-4 border-t border-border/40 flex flex-col xl:flex-row items-center justify-between gap-4">
							<div className="space-y-1 text-xs text-muted-foreground text-center xl:text-left">
								<div className="flex items-center justify-center xl:justify-start gap-2 font-bold text-foreground">
									<ShieldCheck className="w-4 h-4 text-[#007144]" />
									<span>Layanan PPID Resmi Bebas Biaya (100% Gratis)</span>
								</div>
								<p className="text-[11px] text-muted-foreground">
									Data terenkripsi aman dan diproses sesuai standar SOP PPID Kemenag Barito Utara.
								</p>
							</div>

							{/* Turnstile dan Tombol Submit Menyatu Harmonis */}
							<div className="flex flex-col items-center xl:items-end gap-2 w-full xl:w-auto">
								<div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
									<div id="field-turnstile" className="shrink-0 flex flex-col items-center sm:items-start">
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
											<p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
												<AlertCircle className="w-3.5 h-3.5 shrink-0" />
												<span>{errors.turnstile}</span>
											</p>
										)}
									</div>

									<button
										type="submit"
										disabled={!isFormValid || isSubmitting}
										className={`w-full sm:w-auto h-[65px] px-8 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-2.5 whitespace-nowrap ${
											!isFormValid || isSubmitting
												? 'bg-muted text-muted-foreground/60 cursor-not-allowed border border-border/60 shadow-none'
												: 'bg-[#007144] hover:bg-[#005935] text-white cursor-pointer active:scale-[0.98]'
										}`}
										title={!isFormValid ? 'Lengkapi seluruh isian wajib dan verifikasi keamanan untuk mengaktifkan' : 'Kirim permohonan'}
									>
										{isSubmitting ? (
											<>
												<Loader2 className="w-5 h-5 animate-spin" />
												<span>Mengirim...</span>
											</>
										) : !isFormValid ? (
											<>
												<Lock className="w-4 h-4 text-muted-foreground/50" />
												<span>Kirim Permohonan</span>
											</>
										) : (
											<>
												<Send className="w-4 h-4" />
												<span>Kirim Permohonan</span>
											</>
										)}
									</button>
								</div>

								{/* Status panduan pemohon jika tombol belum aktif */}
								{!isFormValid && (
									<div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 justify-center xl:justify-end text-center">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>
											{!isNamaValid
												? 'Nama pemohon belum lengkap (min. 3 karakter)'
												: !isNikValid
													? kategoriPemohon === 'PERORANGAN'
														? `NIK harus tepat 16 digit angka (saat ini: ${formData.nik.length}/16)`
														: 'No. legalitas lembaga wajib diisi'
													: !isPhoneValid
														? 'Nomor WhatsApp belum valid (10-14 digit, diawali 08/628)'
														: !isAlamatValid
															? 'Alamat domisili wajib diisi lengkap'
															: !isRincianValid
																? `Rincian informasi minimal 10 karakter (${formData.rincian.length}/10)`
																: !isTujuanValid
																	? `Tujuan permohonan minimal 5 karakter (${formData.tujuan.length}/5)`
																	: !isAgreementValid
																		? 'Centang pernyataan pakta integritas di atas'
																		: !isTurnstileValid
																			? 'Selesaikan verifikasi Cloudflare Turnstile di samping'
																			: 'Lengkapi isian wajib'}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</form>
			</div>

			{/* Floating Success Modal with Subtle Backdrop Blur */}
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
						<div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-[#007144] flex items-center justify-center mx-auto shadow-inner">
							<CheckCircle2 className="w-9 h-9" />
						</div>

						{/* Title & Subtitle */}
						<div className="space-y-2">
							<span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 text-[#007144] inline-block">
								Registrasi Berhasil
							</span>
							<h2 className="text-xl sm:text-2xl font-black text-foreground">
								Permohonan Informasi Berhasil Terkirim!
							</h2>
							<p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
								Berkas permohonan informasi publik Anda telah tercatat pada sistem PPID Kemenag Barito Utara dan sedang diverifikasi oleh petugas.
							</p>
						</div>

						{/* Ticket Card Monospace */}
						<div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3 shadow-xs">
							<div className="text-left">
								<span className="text-[10px] uppercase font-extrabold text-muted-foreground block tracking-wider">
									Nomor Registrasi Tiket
								</span>
								<span className="font-mono font-black text-xl sm:text-2xl text-[#007144]">
									{regNumber}
								</span>
							</div>
							<button
								type="button"
								onClick={handleCopy}
								className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
									copied
										? 'bg-emerald-600 text-white border-emerald-600'
										: 'bg-emerald-50 text-[#007144] border-emerald-200 hover:bg-[#007144] hover:text-white dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-[#007144] dark:hover:text-white'
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
								<ShieldCheck className="w-4 h-4 text-[#007144]" />
								<span>Informasi Pemrosesan:</span>
							</div>
							<ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs">
								<li>Sesuai UU KIP No. 14/2008, tanggapan diberikan maksimal dalam <strong>10 hari kerja</strong> (+ perpanjangan 7 hari kerja bila dibutuhkan).</li>
								<li>Status permohonan dapat dipantau kapan saja lewat fitur <strong>Lacak Tiket</strong> di navbar.</li>
								<li>Notifikasi resmi akan dikirimkan melalui WhatsApp {lastSubmittedTicket?.email || formData.email ? 'dan Email' : ''} Anda.</li>
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
										namaPemohon: lastSubmittedTicket?.nama || formData.nama || 'Masyarakat Umum',
										nik: lastSubmittedTicket?.nik || formData.nik || '-',
										email: lastSubmittedTicket?.email || formData.email || '',
										phone: formData.phone || '',
										pekerjaan: formData.pekerjaan || '',
										alamat: formData.alamat || '',
										rincianInformasi: lastSubmittedTicket?.rincian || formData.rincian || '-',
										tujuan: formData.tujuan || '',
										caraMemperoleh: formData.caraMemperoleh,
										caraMendapatkan: formData.caraMendapatkan,
										tglPengajuan: new Date().toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										}),
										status: 'MENUNGGU VERIFIKASI',
									});
									trackDocumentAction('download', `${ticketId}.pdf`, 'Bukti Registrasi Tiket');
								}}
								className="w-full sm:w-auto flex-1 h-11 px-4 inline-flex items-center justify-center gap-2 bg-[#007144] hover:bg-[#005935] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer active:scale-[0.98] transition-all whitespace-nowrap"
							>
								<Download className="w-4 h-4 shrink-0" />
								<span className="whitespace-nowrap">Download Bukti Tiket PDF</span>
							</button>
							<button
								type="button"
								onClick={handleResetForm}
								className="w-full sm:w-auto h-11 px-4 border border-input bg-card hover:bg-accent rounded-xl text-xs font-bold text-foreground transition-all cursor-pointer whitespace-nowrap"
							>
								<span className="whitespace-nowrap">Tutup &amp; Buat Baru</span>
							</button>
						</div>
					</div>
				</div>
			)}

			<PdfTicketModal
				isOpen={isPdfModalOpen}
				onClose={() => setIsPdfModalOpen(false)}
				ticketData={{
					tiketId: lastSubmittedTicket?.tiketNo || regNumber,
					namaPemohon: lastSubmittedTicket?.nama || formData.nama || 'Masyarakat Umum',
					nik: lastSubmittedTicket?.nik || formData.nik || '6205010000000000',
					rincianInformasi: lastSubmittedTicket?.rincian || formData.rincian || 'Permohonan Berkas Publik PPID',
					tglPengajuan: new Date().toLocaleDateString('id-ID', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					}),
					status: 'Menunggu Verifikasi',
				}}
			/>
		</section>
	);
}