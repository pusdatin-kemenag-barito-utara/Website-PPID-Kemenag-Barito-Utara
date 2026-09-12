import { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { apiSend } from '../../lib/api-client';
import TurnstileWidget from './TurnstileWidget';

type Props = {
	siteKey: string;
};

export default function LoginForm({ siteKey }: Props) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [turnstileToken, setTurnstileToken] = useState('');
	const [turnstileKey, setTurnstileKey] = useState(0);

	// Load remembered email on mount
	useEffect(() => {
		try {
			const savedEmail = localStorage.getItem('ppid_remember_email');
			const savedRemember = localStorage.getItem('ppid_remember_me') === 'true';
			if (savedEmail) setEmail(savedEmail);
			if (savedRemember) setRememberMe(true);
		} catch {}
	}, []);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await apiSend('/auth/login', 'POST', {
				email: email.trim(),
				password,
				turnstile_token: turnstileToken,
			});

			// Handle "Ingat Saya"
			try {
				if (rememberMe) {
					localStorage.setItem('ppid_remember_email', email.trim());
					localStorage.setItem('ppid_remember_me', 'true');
				} else {
					localStorage.removeItem('ppid_remember_email');
					localStorage.removeItem('ppid_remember_me');
				}
			} catch {}

			window.location.href = '/admin/dashboard';
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Gagal masuk. Periksa kembali email dan password.');
			setTurnstileToken('');
			setTurnstileKey((k) => k + 1);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md space-y-7">
			{/* Clean Header */}
			<div className="space-y-1.5 text-left">
				<h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
					Masuk Admin
				</h2>
				<p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
					Masukkan kredensial akun administrator resmi PPID.
				</p>
			</div>

			{error && (
				<div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-medium animate-in fade-in duration-200">
					<AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
					<div className="flex-1 leading-relaxed">{error}</div>
				</div>
			)}

			<form className="space-y-4" onSubmit={submit}>
				{/* Input Email */}
				<div className="space-y-1.5 text-left">
					<label htmlFor="email-address" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
						Email Administrator
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
							<Mail className="w-4 h-4" />
						</div>
						<input
							id="email-address"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2 text-sm font-medium transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#007144] focus:ring-4 focus:ring-[#007144]/15 focus:bg-white dark:focus:bg-zinc-900 shadow-xs"
							placeholder="admin@kemenag.go.id"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
				</div>

				{/* Input Password */}
				<div className="space-y-1.5 text-left">
					<label htmlFor="password" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
						Kata Sandi
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
							<Lock className="w-4 h-4" />
						</div>
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="current-password"
							required
							className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-10 pr-10 py-2 text-sm font-medium transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#007144] focus:ring-4 focus:ring-[#007144]/15 focus:bg-white dark:focus:bg-zinc-900 shadow-xs"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							tabIndex={-1}
							className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
							aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
						>
							{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
						</button>
					</div>
				</div>

				{/* Checkbox Ingat Saya (Tanpa Lupa Kata Sandi) */}
				<div className="flex items-center pt-0.5">
					<label htmlFor="remember-me" className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
						<input
							id="remember-me"
							name="remember-me"
							type="checkbox"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
							className="h-4 w-4 rounded-md border-zinc-300 text-[#007144] focus:ring-[#007144] bg-white dark:bg-zinc-900 cursor-pointer accent-[#007144]"
						/>
						<span>Ingat saya di perangkat ini</span>
					</label>
				</div>

				{/* Cloudflare Turnstile Security CAPTCHA (Full Width matching Submit Button) */}
				<div className="w-full py-1">
					<TurnstileWidget
						key={turnstileKey}
						siteKey={siteKey}
						onToken={setTurnstileToken}
						size="flexible"
						className="w-full"
					/>
				</div>

				{/* Tombol Submit */}
				<button
					type="submit"
					disabled={loading}
					className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#007144] py-3 px-4 text-xs md:text-sm font-bold text-white hover:bg-[#005935] focus:outline-none focus:ring-4 focus:ring-[#007144]/25 transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
				>
					{loading ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							<span>Memverifikasi...</span>
						</>
					) : (
						<>
							<KeyRound className="w-4 h-4" />
							<span>Masuk ke Dashboard</span>
						</>
					)}
				</button>
			</form>
		</div>
	);
}