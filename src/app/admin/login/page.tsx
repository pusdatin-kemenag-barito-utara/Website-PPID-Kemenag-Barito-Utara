"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal login. Silakan coba lagi.");
      }

      // Berhasil login, arahkan ke dashboard admin
      window.location.href = "/admin/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-green-50/80 to-white dark:from-green-950/20 dark:to-background flex-col items-center justify-center p-12 relative overflow-hidden border-r">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#007144]/5 to-transparent pointer-events-none" />
        
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#007144] hover:text-[#005a36] transition-colors font-medium z-10 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm dark:bg-background/50">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <Image src="/hapakat.png" alt="Logo Hapakat" width={240} height={80} className="object-contain" />
          <div className="space-y-4 max-w-md">
            <h1 className="text-3xl font-bold text-[#007144] tracking-tight">Portal PPID</h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Sistem Informasi Layanan Publik Terintegrasi Kementerian Agama Kabupaten Barito Utara.
            </p>
          </div>
          <Image src="/logo-kemenag.svg" alt="Logo Kemenag" width={140} height={140} className="object-contain opacity-90 drop-shadow-sm" />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-24 relative bg-background">
        <Link href="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-[#007144] hover:text-[#005a36] transition-colors font-medium bg-secondary/50 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4 lg:hidden mb-8">
            <Image src="/logo-kemenag.svg" alt="Logo Kemenag" width={80} height={80} className="object-contain" />
          </div>

          <div className="text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Login Admin</h2>
            <p className="text-sm text-muted-foreground">
              Silakan masukkan kredensial Anda untuk masuk ke sistem.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007144] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="admin@kemenag.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 relative">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007144] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-[#007144] focus:ring-[#007144] bg-background cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground cursor-pointer">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#007144] hover:text-[#005a36] transition-colors">
                  Lupa password?
                </a>
              </div>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center my-6">
              <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
              <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-[#007144] py-2.5 px-4 text-sm font-semibold text-white hover:bg-[#005a36] focus:outline-none focus:ring-2 focus:ring-[#007144] focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
