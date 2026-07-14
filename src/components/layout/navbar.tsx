import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            {/* <img src="/logo-kemenag.svg" alt="Logo Kemenag" className="h-8 w-8" /> */}
            <span className="text-primary">PPID</span> Kemenag Barito Utara
          </Link>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
          <Link href="/profil" className="hover:text-primary transition-colors">Profil</Link>
          <Link href="/informasi-publik" className="hover:text-primary transition-colors">Informasi Publik</Link>
          <Link href="/layanan-informasi" className="hover:text-primary transition-colors">Layanan</Link>
          <Link href="/regulasi" className="hover:text-primary transition-colors">Regulasi</Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
