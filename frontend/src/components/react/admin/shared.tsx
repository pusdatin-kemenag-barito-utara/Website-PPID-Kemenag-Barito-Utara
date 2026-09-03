import { useState, useEffect, useRef } from 'react';
import {
	Clock,
	Loader2,
	AlertCircle,
	CheckCircle2,
	Activity,
	X,
	Cloud,
	Check,
	FileUp,
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Eye,
} from 'lucide-react';
import { ApiError, apiUploadFile } from '@/lib/api-client';

export const cn = (...parts: (string | false | undefined | null)[]) => parts.filter(Boolean).join(' ');

// ---- shared label maps ----
export const KATEGORI_INFO: Record<string, { label: string; badge: string }> = {
	BERKALA: { label: 'Informasi Berkala', badge: 'bg-[#007144]/10 text-[#007144] border border-[#007144]/20' },
	SERTA_MERTA: { label: 'Informasi Serta Merta', badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20' },
	SETIAP_SAAT: { label: 'Informasi Setiap Saat', badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700' },
	DIKECUALIKAN: { label: 'Informasi Dikecualikan', badge: 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20' },
};

export const STATUS_LABEL: Record<string, { label: string; dot: string; badge: string }> = {
	MENUNGGU: {
		label: 'Menunggu',
		dot: 'bg-amber-500',
		badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20',
	},
	DIPROSES: {
		label: 'Diproses',
		dot: 'bg-sky-500',
		badge: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20',
	},
	SELESAI: {
		label: 'Selesai',
		dot: 'bg-emerald-600',
		badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20',
	},
	DITOLAK: {
		label: 'Ditolak',
		dot: 'bg-rose-500',
		badge: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20',
	},
};

export const JENIS_LABEL: Record<string, string> = {
	PERMOHONAN: 'Permohonan',
	KEBERATAN: 'Keberatan',
	PENGADUAN: 'Pengaduan',
};

export const inputCls =
	'w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all';

export const Upload = ({ className = 'w-4 h-4' }: { className?: string }) => (
	<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="17 8 12 3 7 8" />
		<line x1="12" x2="12" y1="3" y2="15" />
	</svg>
);

export const Download = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="7 10 12 15 17 10" />
		<line x1="12" x2="12" y1="15" y2="3" />
	</svg>
);

export function fmtDate(value?: string): string {
	if (!value) return '-';
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return value;
	return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatBytes(bytes: number | string | undefined | null): string {
	if (bytes === undefined || bytes === null || bytes === '') return '0 KB';
	const n = typeof bytes === 'string' ? parseFloat(bytes) : Number(bytes);
	if (isNaN(n) || n <= 0) return '0 KB';
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) {
		const val = (n / 1024).toFixed(1);
		return `${val.endsWith('.0') ? val.slice(0, -2) : val} KB`;
	}
	if (n < 1024 * 1024 * 1024) {
		const val = (n / (1024 * 1024)).toFixed(1);
		return `${val.endsWith('.0') ? val.slice(0, -2) : val} MB`;
	}
	const val = (n / (1024 * 1024 * 1024)).toFixed(2);
	return `${val.endsWith('.00') ? val.slice(0, -3) : val} GB`;
}

export function StatusBadge({ status }: { status: string }) {
	const meta = STATUS_LABEL[status] ?? {
		label: status,
		dot: 'bg-zinc-400',
		badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
	};
	return (
		<span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide', meta.badge)}>
			<span className={cn('w-1.5 h-1.5 rounded-full', meta.dot)} />
			{meta.label}
		</span>
	);
}

export function LoadingRows({ cols }: { cols: number }) {
	return (
		<>
			{[0, 1, 2, 3].map((i) => (
				<tr key={i}>
					<td colSpan={cols} className="py-6 px-6">
						<div className="h-10 rounded-xl bg-accent/60 animate-pulse" />
					</td>
				</tr>
			))}
		</>
	);
}

export function NoticeBar({ text, tone = 'ok' }: { text: string; tone?: 'ok' | 'err' }) {
	if (!text) return null;
	return (
		<div
			className={cn(
				'flex items-center gap-3 p-4 rounded-xl text-sm font-semibold animate-in fade-in',
				tone === 'ok'
					? 'bg-emerald-500/15 border border-emerald-500/30 text-[#007144]'
					: 'bg-red-500/10 border border-red-500/30 text-red-700',
			)}
		>
			{tone === 'ok' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
			<span>{text}</span>
		</div>
	);
}

// -------------------------------------------------------------
// TOASTER NOTIFICATION SYSTEM (Bottom Right)
// -------------------------------------------------------------
export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
	id: string;
	message: string;
	tone?: ToastTone;
	title?: string;
}

export function useToast() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const showToast = (message: string, tone: ToastTone = 'success', title?: string) => {
		if (!message || !message.trim()) return;
		const id = Math.random().toString(36).substring(2, 9);
		setToasts((prev) => [...prev, { id, message, tone, title }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	};

	return { toasts, showToast, removeToast };
}

export function Toaster({
	toasts,
	onRemove,
}: {
	toasts: ToastItem[];
	onRemove: (id: string) => void;
}) {
	if (!toasts || toasts.length === 0) return null;

	return (
		<div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-auto pointer-events-none items-end">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={cn(
						'pointer-events-auto inline-flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200',
						t.tone === 'error'
							? 'bg-rose-950/95 text-white border-rose-500/50 shadow-rose-950/30'
							: t.tone === 'info'
							? 'bg-zinc-900/95 text-white border-zinc-700/60 shadow-black/30'
							: 'bg-zinc-900/95 text-white border-[#007144]/60 shadow-emerald-950/30'
					)}
				>
					<div className="shrink-0 flex items-center">
						{t.tone === 'error' ? (
							<div className="p-1 rounded-full bg-rose-500/20 text-rose-400">
								<AlertCircle className="w-4 h-4" />
							</div>
						) : t.tone === 'info' ? (
							<div className="p-1 rounded-full bg-sky-500/20 text-sky-400">
								<Activity className="w-4 h-4" />
							</div>
						) : (
							<div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
								<CheckCircle2 className="w-4 h-4" />
							</div>
						)}
					</div>
					<div className="flex items-center min-w-0 pr-1">
						<p className="text-xs font-semibold text-zinc-100 whitespace-nowrap leading-none">{t.message}</p>
					</div>
					<button
						type="button"
						onClick={() => onRemove(t.id)}
						className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-1"
						title="Tutup Notifikasi"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			))}
		</div>
	);
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
			{children}
		</div>
	);
}

// -------------------------------------------------------------
// 1. MODERN CUSTOM DATE PICKER COMPONENT (Indonesian Locale)
// -------------------------------------------------------------
const INDONESIAN_MONTHS = [
	'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
	'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_MONTHS_SHORT = [
	'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
	'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const INDONESIAN_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function parseDateInput(str: string): Date {
	if (!str) return new Date();
	// Try parsing standard DD MMM YYYY (e.g., "02 Sep 2026")
	const parts = str.trim().split(/\s+/);
	if (parts.length === 3) {
		const day = parseInt(parts[0], 10);
		const year = parseInt(parts[2], 10);
		let monthIdx = INDONESIAN_MONTHS_SHORT.findIndex(
			(m) => m.toLowerCase() === parts[1].toLowerCase()
		);
		if (monthIdx === -1) {
			monthIdx = INDONESIAN_MONTHS.findIndex(
				(m) => m.toLowerCase() === parts[1].toLowerCase()
			);
		}
		if (day && monthIdx !== -1 && year) {
			return new Date(year, monthIdx, day);
		}
	}
	const d = new Date(str);
	return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatDateIndo(d: Date): string {
	const day = String(d.getDate()).padStart(2, '0');
	const month = INDONESIAN_MONTHS_SHORT[d.getMonth()];
	const year = d.getFullYear();
	return `${day} ${month} ${year}`;
}

export function ModernDatePicker({
	value,
	onChange,
	placeholder = 'Pilih tanggal...',
}: {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [viewDate, setViewDate] = useState<Date>(() => parseDateInput(value));
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (value) setViewDate(parseDateInput(value));
	}, [value]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	const currentYear = viewDate.getFullYear();
	const currentMonth = viewDate.getMonth();

	const prevMonth = () => {
		setViewDate(new Date(currentYear, currentMonth - 1, 1));
	};

	const nextMonth = () => {
		setViewDate(new Date(currentYear, currentMonth + 1, 1));
	};

	const selectDay = (day: number) => {
		const selected = new Date(currentYear, currentMonth, day);
		onChange(formatDateIndo(selected));
		setIsOpen(false);
	};

	const setToday = () => {
		const today = new Date();
		setViewDate(today);
		onChange(formatDateIndo(today));
		setIsOpen(false);
	};

	// Calendar calculation
	const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
	const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

	const selectedDate = value ? parseDateInput(value) : null;
	const isSelected = (day: number) => {
		if (!selectedDate) return false;
		return (
			selectedDate.getDate() === day &&
			selectedDate.getMonth() === currentMonth &&
			selectedDate.getFullYear() === currentYear
		);
	};

	const isToday = (day: number) => {
		const now = new Date();
		return (
			now.getDate() === day &&
			now.getMonth() === currentMonth &&
			now.getFullYear() === currentYear
		);
	};

	return (
		<div className="relative w-full" ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium flex items-center justify-between transition-all cursor-pointer select-none text-left',
					isOpen
						? 'border-[#007144] ring-2 ring-[#007144]/20 shadow-xs'
						: 'hover:border-[#007144]/60'
				)}
			>
				<div className="flex items-center gap-2.5 truncate">
					<CalendarIcon className="w-4 h-4 text-[#007144] shrink-0" />
					<span className={cn('truncate text-xs font-semibold', !value ? 'text-muted-foreground' : 'text-foreground')}>
						{value || placeholder}
					</span>
				</div>
				<ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0', isOpen ? 'rotate-180 text-[#007144]' : '')} />
			</button>

			{/* Floating Calendar Dropdown */}
			{isOpen && (
				<div className="absolute left-0 top-full mt-2 z-50 w-72 bg-background border border-border/80 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 select-none">
					{/* Header Navigation */}
					<div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
						<button
							type="button"
							onClick={prevMonth}
							className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							title="Bulan sebelumnya"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<span className="text-xs font-bold text-foreground">
							{INDONESIAN_MONTHS[currentMonth]} {currentYear}
						</span>
						<button
							type="button"
							onClick={nextMonth}
							className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							title="Bulan berikutnya"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>

					{/* Day Header */}
					<div className="grid grid-cols-7 gap-1 text-center mb-1.5">
						{INDONESIAN_DAYS.map((d, idx) => (
							<span
								key={d}
								className={cn(
									'text-[10px] font-extrabold uppercase tracking-wider',
									idx === 0 ? 'text-rose-500' : 'text-muted-foreground'
								)}
							>
								{d}
							</span>
						))}
					</div>

					{/* Days Grid */}
					<div className="grid grid-cols-7 gap-1 text-center">
						{/* Leading Empty / Prev Month Days */}
						{Array.from({ length: firstDayIndex }).map((_, i) => {
							const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
							return (
								<span
									key={`prev-${i}`}
									className="text-[11px] font-normal text-muted-foreground/30 py-1.5"
								>
									{prevDay}
								</span>
							);
						})}

						{/* Current Month Days */}
						{Array.from({ length: daysInCurrentMonth }).map((_, i) => {
							const day = i + 1;
							const active = isSelected(day);
							const today = isToday(day);

							return (
								<button
									key={day}
									type="button"
									onClick={() => selectDay(day)}
									className={cn(
										'h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer',
										active
											? 'bg-[#007144] text-white shadow-xs font-bold scale-105'
											: today
											? 'border border-[#007144] text-[#007144] font-bold hover:bg-emerald-500/10'
											: 'text-foreground/90 hover:bg-accent hover:text-foreground'
									)}
								>
									{day}
								</button>
							);
						})}
					</div>

					{/* Today Shortcut Button */}
					<div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
						<button
							type="button"
							onClick={setToday}
							className="text-[11px] font-bold text-[#007144] hover:underline cursor-pointer"
						>
							Hari Ini
						</button>
						{value && (
							<button
								type="button"
								onClick={() => {
									onChange('');
									setIsOpen(false);
								}}
								className="text-[11px] font-semibold text-muted-foreground hover:text-red-500 cursor-pointer"
							>
								Hapus
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// -------------------------------------------------------------
// 2. MODERN CUSTOM SELECT / DROPDOWN COMPONENT
// -------------------------------------------------------------
export interface SelectOption {
	value: string;
	label: string;
	description?: string;
}

export function ModernSelect({
	value,
	onChange,
	options,
	placeholder = 'Pilih salah satu...',
	className = '',
}: {
	value: string;
	onChange: (val: string) => void;
	options: SelectOption[] | { value: string; label: string }[];
	placeholder?: string;
	className?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	return (
		<div className={cn('relative', className || 'w-full')} ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium flex items-center justify-between transition-all cursor-pointer select-none text-left',
					isOpen
						? 'border-[#007144] ring-2 ring-[#007144]/20 shadow-xs'
						: 'hover:border-[#007144]/60'
				)}
			>
				<span className={cn('truncate text-xs font-semibold', !selectedOption ? 'text-muted-foreground' : 'text-foreground')}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					className={cn(
						'w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2',
						isOpen ? 'rotate-180 text-[#007144]' : ''
					)}
				/>
			</button>

			{/* Floating Dropdown Menu */}
			{isOpen && (
				<div className="absolute left-0 top-full mt-1.5 z-50 w-full bg-background border border-border/80 rounded-2xl shadow-2xl py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
					{options.map((option) => {
						const isSelected = option.value === value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => {
									onChange(option.value);
									setIsOpen(false);
								}}
								className={cn(
									'w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer',
									isSelected
										? 'bg-emerald-500/10 text-[#007144] font-bold'
										: 'text-foreground/90 hover:bg-accent hover:text-foreground font-medium'
								)}
							>
								<div className="flex flex-col truncate">
									<span>{option.label}</span>
									{'description' in option && option.description && (
										<span className="text-[10px] text-muted-foreground font-normal truncate mt-0.5">
											{option.description}
										</span>
									)}
								</div>
								{isSelected && <Check className="w-4 h-4 text-[#007144] shrink-0 ml-2" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

// -------------------------------------------------------------
// 3. FILE UPLOAD FIELD WITH CLOUDFLARE R2 INTEGRATION
// -------------------------------------------------------------
export function FileUploadField({
	value,
	onChange,
	uploading,
	onUploadingChange,
	error,
	onError,
	folder = 'dokumen-ppid',
	onFileUploaded,
	onPreview,
	label = 'Berkas Dokumen (Cloudflare R2 Storage)',
}: {
	value: string;
	onChange: (url: string) => void;
	uploading: boolean;
	onUploadingChange: (v: boolean) => void;
	error: string;
	onError: (msg: string) => void;
	folder?: string;
	onFileUploaded?: (meta: { url: string; size: string; name: string }) => void;
	onPreview?: (url: string) => void;
	label?: string;
}) {
	const [dragOver, setDragOver] = useState(false);
	const [uploadedName, setUploadedName] = useState('');
	const [uploadedSize, setUploadedSize] = useState('');

	const handleFile = async (f: File | null) => {
		if (!f) return;

		// Immediately calculate and apply file size & name from the chosen browser file
		const initialSizeStr = formatBytes(f.size);
		setUploadedName(f.name);
		setUploadedSize(initialSizeStr);

		if (onFileUploaded) {
			onFileUploaded({
				url: value || '',
				size: initialSizeStr,
				name: f.name,
			});
		}

		onUploadingChange(true);
		onError('');
		try {
			const fd = new FormData();
			fd.append('file', f);
			if (folder) fd.append('folder', folder);
			const res = await apiUploadFile(fd);
			onChange(res.url);
			setUploadedName(res.name || f.name);

			const finalSize = res.size ? formatBytes(res.size) : initialSizeStr;
			setUploadedSize(finalSize);

			if (onFileUploaded) {
				onFileUploaded({
					url: res.url,
					size: finalSize,
					name: res.name || f.name,
				});
			}
		} catch (err) {
			onError(err instanceof ApiError ? err.message : 'Gagal mengunggah berkas ke Cloudflare R2.');
		} finally {
			onUploadingChange(false);
		}
	};

	return (
		<Field label={label}>
			<div className="space-y-2.5">
				{/* Dropzone Upload Container */}
				<div
					onDragOver={(e) => {
						e.preventDefault();
						setDragOver(true);
					}}
					onDragLeave={() => setDragOver(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragOver(false);
						const file = e.dataTransfer.files?.[0] ?? null;
						handleFile(file);
					}}
					className={cn(
						'relative flex flex-col items-center justify-center p-3.5 border-2 border-dashed rounded-2xl transition-all',
						dragOver ? 'border-[#007144] bg-emerald-500/10' : 'border-border/80 bg-accent/20 hover:bg-accent/40',
						uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer',
					)}
				>
					<input
						type="file"
						id="r2-berkas-upload"
						disabled={uploading}
						onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
						className="hidden"
						accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.zip"
					/>
					<label
						htmlFor="r2-berkas-upload"
						className="flex flex-col items-center justify-center w-full cursor-pointer select-none space-y-1.5"
					>
						<div className="p-2 rounded-full bg-background border border-border/80 text-[#007144] shadow-xs">
							{uploading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : value || uploadedName ? (
								<Check className="w-5 h-5 text-emerald-600" />
							) : (
								<FileUp className="w-5 h-5" />
							)}
						</div>
						<div className="text-center">
							<div className="text-xs font-bold text-foreground">
								{uploading ? (
									<span>Mengunggah ke Cloudflare R2...</span>
								) : value || uploadedName ? (
									<div className="flex flex-col items-center gap-1">
										<span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
											Berkas Siap: {uploadedName || value.split('/').pop()}
										</span>
										{uploadedSize && (
											<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#007144] text-[11px] font-bold">
												Ukuran: {uploadedSize}
											</span>
										)}
										{value && onPreview && (
											<button
												type="button"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													onPreview(value);
												}}
												className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#007144] text-white text-[11px] font-bold hover:bg-[#005935] shadow-xs cursor-pointer transition-all active:scale-95"
											>
												<Eye className="w-3.5 h-3.5" />
												<span>Lihat Pratinjau PDF</span>
											</button>
										)}
									</div>
								) : (
									<span>
										Klik untuk memilih berkas atau <span className="text-[#007144] underline">tarik berkas ke sini</span>
									</span>
								)}
							</div>
							<p className="text-[10px] text-muted-foreground mt-0.5">
								Format: PDF, Word, Excel, JPG, PNG, ZIP (Maks. 25 MB)
							</p>
						</div>

						{/* R2 Cloud Path Tag */}
						<div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-background/80 border border-border/60 text-[10px] text-muted-foreground font-medium">
							<Cloud className="w-3 h-3 text-[#007144]" />
							<span>R2 Folder: <strong className="text-foreground">{folder}</strong></span>
						</div>
					</label>
				</div>

				{/* Fallback Direct URL Input */}
				<div className="flex items-center gap-2">
					<input
						type="url"
						placeholder="Atau tautan URL berkas langsung (https://...)"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className={cn(inputCls, 'text-xs h-9')}
					/>
				</div>
			</div>
		</Field>
	);
}