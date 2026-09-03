"use client";

import { Music } from "lucide-react";

interface FooterProps {
  currentPath?: string;
}

export default function Footer({ currentPath = "" }: FooterProps) {
  if (currentPath?.startsWith('/admin')) return null;

  return (
    <footer className="w-full bg-gradient-to-br from-green-50/80 via-white to-green-50/50 dark:from-green-950/20 dark:via-background dark:to-green-950/10 border-t mt-auto">
      <div className="w-full px-4 md:px-8 lg:px-12 py-7 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Column 1: Logos and Intro */}
          <div className="flex flex-col space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/logo-kemenag.svg"
                alt="Logo Kemenag"
                width={44}
                height={44}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-[#007144] text-base sm:text-lg tracking-wide leading-tight">
                  PPID KEMENAG
                </span>
                <span className="text-muted-foreground text-xs sm:text-sm tracking-wide leading-tight">
                  Kabupaten Barito Utara
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <img
                src="/hapakat.png"
                alt="Logo Hapakat"
                width={110}
                height={28}
                className="object-contain"
              />
              <div className="text-[10px] font-bold tracking-tight text-[#007144]">
                <span className="text-orange-500">H</span>armonis,{" "}
                <span className="text-orange-500">A</span>manah,{" "}
                <span className="text-orange-500">P</span>rofesional,{" "}
                <span className="text-orange-500">A</span>kuntabel,{" "}
                <span className="text-orange-500">K</span>reatif,{" "}
                <span className="text-orange-500">A</span>dil &{" "}
                <span className="text-orange-500">T</span>ransparan
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
              Portal Pejabat Pengelola Informasi dan Dokumentasi (PPID) sebagai wujud komitmen Kementerian Agama Kabupaten Barito Utara dalam menyelenggarakan layanan informasi publik yang transparan, akuntabel, dan responsif.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="/layanan-informasi/pengaduan"
                className="bg-[#007144] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-[#005a36] transition-colors"
              >
                Pengaduan
              </a>
              <a
                href="/profil"
                className="bg-white text-foreground border border-input shadow-2xs px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-accent transition-colors dark:bg-background"
              >
                Profil PPID
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2 Kolom di Mobile agar ringkas & hemat tempat) */}
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:ml-4">
            <h3 className="font-extrabold text-xs sm:text-sm tracking-widest uppercase text-foreground">
              Tautan Cepat
            </h3>
            <ul className="grid grid-cols-2 sm:flex sm:flex-col gap-x-4 gap-y-2 sm:space-y-2.5 text-xs sm:text-sm font-medium text-muted-foreground">
              <li>
                <a href="/" className="hover:text-[#007144] transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/profil" className="hover:text-[#007144] transition-colors">
                  Profil
                </a>
              </li>
              <li>
                <a href="/data-informasi" className="hover:text-[#007144] transition-colors">
                  Data Informasi
                </a>
              </li>
              <li>
                <a href="/informasi-publik" className="hover:text-[#007144] transition-colors">
                  Informasi Publik
                </a>
              </li>
              <li>
                <a href="/layanan-informasi/permohonan" className="hover:text-[#007144] transition-colors">
                  Permohonan
                </a>
              </li>
              <li>
                <a href="/layanan-informasi/keberatan" className="hover:text-[#007144] transition-colors">
                  Keberatan
                </a>
              </li>
              <li>
                <a href="/standar-layanan" className="hover:text-[#007144] transition-colors">
                  Standar Layanan
                </a>
              </li>
              <li>
                <a href="/regulasi" className="hover:text-[#007144] transition-colors">
                  Regulasi
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <h3 className="font-extrabold text-xs sm:text-sm tracking-widest uppercase text-foreground">
              Kontak Resmi
            </h3>

            <div className="grid grid-cols-1 gap-2.5 sm:space-y-3 sm:gap-0 text-xs sm:text-sm">
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
                  Email
                </span>
                <a
                  href="mailto:ppidkemenagbaritoutara@gmail.com"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-[#007144] transition-colors break-all"
                >
                  ppidkemenagbaritoutara@gmail.com
                </a>
              </div>

              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
                  Telepon Kantor
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                  (0519) 21269
                </span>
              </div>

              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
                  Jam Layanan
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Senin - Kamis (07.30 - 16.00 WIB) &bull; Jumat (07.30 - 16.30 WIB)
                </span>
              </div>

              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
                  Alamat Kantor
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Jl. Ahmad Yani No. 126, Muara Teweh, Barito Utara, Kalteng
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <h3 className="font-extrabold text-xs sm:text-sm tracking-widest uppercase text-foreground">
              Ikuti Kami
            </h3>
            <div className="flex items-center gap-2.5">
              <a
                href="#"
                className="p-2 rounded-xl bg-white border border-border/80 shadow-2xs hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-xl bg-white border border-border/80 shadow-2xs hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
                title="YouTube"
                aria-label="YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-xl bg-white border border-border/80 shadow-2xs hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
                title="TikTok"
                aria-label="TikTok"
              >
                <Music className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-xl bg-white border border-border/80 shadow-2xs hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-xl bg-white border border-border/80 shadow-2xs hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
                title="Twitter / X"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="w-full px-4 md:px-8 lg:px-12 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PPID Kemenag Barito Utara. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="/pusdatin/auth"
              className="inline-flex items-center rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Akses Portal Khusus Admin PPID"
            >
              Portal Admin
            </a>
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              Layanan Aktif
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              Keterbukaan Publik
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}