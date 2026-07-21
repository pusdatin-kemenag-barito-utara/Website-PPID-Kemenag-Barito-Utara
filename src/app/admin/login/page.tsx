"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, ShieldCheck, KeyRound, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const turnstileInput = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
      const turnstileToken = turnstileInput?.value || "";

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal login. Silakan periksa kredensial Anda.");
      }

      // Berhasil login, arahkan ke dashboard admin
      window.location.href = "/admin/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan koneksi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background selection:bg-emerald-500/20 selection:text-[#007144]">
      {/* Left Branding Showcase Tier */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-950 via-[#004d2e] to-emerald-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative Grid & Glow Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,180,100,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Navigation back link */}
        <div className="relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Center Showcase Branding */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl">
            <Image src="/hapakat.png" alt="Logo Hapakat" width={220} height={70} className="object-contain filter drop-shadow" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sistem Manajemen Admin PPID</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Portal Pengelolaan Informasi Publik
            </h1>
            <p className="text-emerald-100/80 text-sm leading-relaxed font-normal">
              Kementerian Agama Kabupaten Barito Utara. Kelola permohonan informasi, keberatan, serta dokumentasi secara terpadu dan aman.
            </p>
          </div>

          <div className="flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10">
            <Image src="/logo-kemenag.svg" alt="Logo Kemenag" width={64} height={64} className="object-contain drop-shadow" />
          </div>
        </div>

        {/* Footer info badge */}
        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-200/60 border-t border-white/10 pt-4">
          <span>&copy; PPID Kemenag Barito Utara</span>
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Secure SSL Authentication
          </span>
        </div>
      </div>

      {/* Right Login Form Tier */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 relative bg-background">
        <div className="flex items-center justify-between lg:justify-end">
          <Link 
            href="/" 
            className="lg:hidden inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-[#007144] transition-colors bg-accent/60 px-3.5 py-1.5 rounded-full border border-border/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <ShieldCheck className="w-4 h-4 text-[#007144]" />
            <span>Enkripsi 256-bit</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto space-y-8 py-8">
          <div className="flex flex-col items-center lg:hidden mb-4">
            <Image src="/logo-kemenag.svg" alt="Logo Kemenag" width={70} height={70} className="object-contain mb-2" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#007144]">
              <Lock className="w-3.5 h-3.5" /> Autentikasi Pengguna
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Masuk Admin</h2>
            <p className="text-sm text-muted-foreground">
              Masukkan alamat email & password resmi untuk mengakses dashboard administrator.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="email-address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm font-medium transition-all placeholder:text-muted-foreground focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="admin@kemenag.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2 text-sm font-medium transition-all placeholder:text-muted-foreground focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember-me" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-[#007144] focus:ring-[#007144] bg-background cursor-pointer"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>

              <a href="#" className="text-xs font-semibold text-[#007144] hover:text-emerald-700 transition-colors">
                Lupa kata sandi?
              </a>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center my-4">
              <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
              <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#007144] py-3 px-4 text-sm font-semibold text-white hover:bg-[#005935] focus:outline-none focus:ring-2 focus:ring-[#007144]/40 transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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

        <div className="text-center text-xs text-muted-foreground">
          Sistem Informasi Publik PPID Kementerian Agama Kabupaten Barito Utara
        </div>
      </div>
    </div>
  );
}
