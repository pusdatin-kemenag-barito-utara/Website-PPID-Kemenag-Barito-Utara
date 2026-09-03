import { useState } from 'react';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiGet, ApiError } from '@/lib/api-client';

interface TicketDTO {
	tiket_no: string;
	jenis: string;
	status: string;
	nama?: string;
	created_at?: string;
}

const STATUS_LABEL: Record<string, string> = {
	MENUNGGU: 'SEDANG MENUNGGU VERIFIKASI OLEH TIM PPID.',
	DIPROSES: 'SEDANG DIPROSES OLEH TIM PPID.',
	SELESAI: 'TELAH SELESAI DIPROSES. SILAKAN HUBUNGI PPID UNTUK MENGAMBIL HASIL.',
	DITOLAK: 'DITOLAK / TIDAK DAPAT DIPENUHI OLEH TIM PPID.',
};

export default function TrackingWidget() {
	const [trackingId, setTrackingId] = useState('');
	const [trackingResult, setTrackingResult] = useState<string | null>(null);
	const [trackingError, setTrackingError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleTrack = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!trackingId.trim()) return;
		setIsLoading(true);
		setTrackingError(null);
		setTrackingResult(null);
		try {
			const ticket = await apiGet<TicketDTO>(
				`/permohonan/lacak/${encodeURIComponent(trackingId.trim())}`,
			);
			setTrackingResult(
				`Status permohonan dengan ID "${ticket.tiket_no}": ${
					STATUS_LABEL[ticket.status] ?? ticket.status
				}`,
			);
		} catch (err) {
			setTrackingError(
				err instanceof ApiError
					? err.message
					: 'Nomor registrasi tidak ditemukan. Pastikan format nomor tiket Anda benar.',
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleTrack} className="space-y-3">
			<div className="space-y-1.5">
				<label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
					Nomor Registrasi Tiket
				</label>
				<input
					type="text"
					placeholder="Contoh: PPID-2026-0001"
					value={trackingId}
					onChange={(e) => setTrackingId(e.target.value)}
					className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-xs font-bold focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
				/>
			</div>
			<button
				type="submit"
				disabled={isLoading}
				className="w-full h-11 bg-[#007144] text-white rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs disabled:opacity-60 disabled:pointer-events-none"
			>
				{isLoading ? 'Memeriksa...' : 'Cek Status Pemrosesan Tiket'}
			</button>

			{trackingResult && (
				<div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#007144] text-xs font-bold animate-in fade-in flex items-center gap-2">
					<CheckCircle2 className="w-4 h-4 shrink-0" />
					<span>{trackingResult}</span>
				</div>
			)}

			{trackingError && (
				<div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-bold animate-in fade-in flex items-center gap-2">
					<AlertCircle className="w-4 h-4 shrink-0" />
					<span>{trackingError}</span>
				</div>
			)}
		</form>
	);
}