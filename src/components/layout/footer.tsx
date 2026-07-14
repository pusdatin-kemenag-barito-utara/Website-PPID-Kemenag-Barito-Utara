"use client";

import Image from "next/image";
import Link from "next/link";
import { Music } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="w-full bg-gradient-to-br from-green-50/80 via-white to-green-50/50 dark:from-green-950/20 dark:via-background dark:to-green-950/10 border-t mt-auto">
      <div className="w-[90%] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logos and Intro */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-kemenag.svg"
                alt="Logo Kemenag"
                width={48}
                height={48}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-[#007144] text-lg tracking-wide leading-tight">
                  PPID KEMENAG
                </span>
                <span className="text-muted-foreground text-sm tracking-wide leading-tight">
                  Kabupaten Barito Utara
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Image
                src="/hapakat.png"
                alt="Logo Hapakat"
                width={120}
                height={32}
                className="object-contain"
              />
              <div className="text-[10px] font-bold tracking-tight text-[#007144]">
                <span className="text-orange-500 text-[11px]">H</span>armonis,{" "}
                <span className="text-orange-500 text-[11px]">A</span>manah,{" "}
                <span className="text-orange-500 text-[11px]">P</span>
                rofesional,{" "}
                <span className="text-orange-500 text-[11px]">A</span>kuntabel,{" "}
                <span className="text-orange-500 text-[11px]">K</span>reatif,{" "}
                <span className="text-orange-500 text-[11px]">A</span>dil dan{" "}
                <span className="text-orange-500 text-[11px]">T</span>ransparan
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Portal Pejabat Pengelola Informasi dan Dokumentasi (PPID) sebagai wujud komitmen Kementerian Agama Kabupaten Barito Utara dalam menyelenggarakan layanan informasi publik yang transparan, akuntabel, dan responsif.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/layanan-informasi/pengaduan"
                className="bg-[#007144] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#005a36] transition-colors"
              >
                Kontak
              </Link>
              <Link
                href="/profil"
                className="bg-white text-foreground border border-input shadow-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-accent transition-colors dark:bg-background"
              >
                Profil
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-4 lg:ml-8">
            <h3 className="font-bold text-sm tracking-widest uppercase">
              Tautan Cepat
            </h3>
            <ul className="flex flex-col space-y-3 text-sm font-medium text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#007144] transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/profil"
                  className="hover:text-[#007144] transition-colors"
                >
                  Profil
                </Link>
              </li>
              <li>
                <Link
                  href="/data-informasi"
                  className="hover:text-[#007144] transition-colors"
                >
                  Data Informasi
                </Link>
              </li>
              <li>
                <Link
                  href="/informasi-publik"
                  className="hover:text-[#007144] transition-colors"
                >
                  Informasi Publik
                </Link>
              </li>
              <li>
                <Link
                  href="/layanan-informasi"
                  className="hover:text-[#007144] transition-colors"
                >
                  Layanan Informasi
                </Link>
              </li>
              <li>
                <Link
                  href="/standar-layanan"
                  className="hover:text-[#007144] transition-colors"
                >
                  Standar Layanan
                </Link>
              </li>
              <li>
                <Link
                  href="/regulasi"
                  className="hover:text-[#007144] transition-colors"
                >
                  Regulasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-bold text-sm tracking-widest uppercase">
              Kontak
            </h3>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Email
              </span>
              <a
                href="mailto:ppidkemenagbaritoutara@gmail.com"
                className="text-sm text-muted-foreground hover:text-[#007144] transition-colors"
              >
                ppidkemenagbaritoutara@gmail.com
              </a>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Telepon
              </span>
              <span className="text-sm text-muted-foreground">
                (0519) 21269
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Jam Layanan
              </span>
              <span className="text-sm text-muted-foreground">
                Senin - Kamis, 07.30 - 16.00 WIB
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Wilayah
              </span>
              <span className="text-sm text-muted-foreground">
                Kabupaten Barito Utara, Kalimantan Tengah
              </span>
            </div>
          </div>

          {/* Column 4: Social Media */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-sm tracking-widest uppercase">
              Ikuti Kami
            </h3>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 rounded-full bg-white border border-border shadow-sm hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
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
                className="p-2 rounded-full bg-white border border-border shadow-sm hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
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
                className="p-2 rounded-full bg-white border border-border shadow-sm hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
              >
                <Music className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white border border-border shadow-sm hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
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
                className="p-2 rounded-full bg-white border border-border shadow-sm hover:text-[#007144] hover:border-[#007144] transition-colors dark:bg-background"
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
      <div className="border-t">
        <div className="w-[90%] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} PPID Kemenag Barito Utara. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Aktif
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              Terbuka
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
