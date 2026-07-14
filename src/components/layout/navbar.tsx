"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const profilItems = [
  { title: "Profil PPID", href: "/profil" },
  { title: "Profil Pejabat", href: "/profil/pejabat" },
  { title: "Visi Misi Motto", href: "/profil/visi-misi" },
  { title: "Tugas dan Fungsi", href: "/profil/tugas-fungsi" },
  { title: "Struktur Organisasi PPID", href: "/profil/struktur" },
];

const dataInformasiItems = [
  { title: "Dashboard Data", href: "/data-informasi" },
  { title: "Infografis Keagamaan", href: "/data-informasi/infografis" },
];

const informasiPublikItems = [
  { title: "Informasi Berkala", href: "/informasi-publik/berkala" },
  { title: "Serta Merta", href: "/informasi-publik/serta-merta" },
  { title: "Tersedia Setiap Saat", href: "/informasi-publik/setiap-saat" },
  { title: "Dikecualikan", href: "/informasi-publik/dikecualikan" },
];

const layananInformasiItems = [
  { title: "Permohonan Informasi", href: "/layanan-informasi" },
  { title: "Pengajuan Keberatan", href: "/layanan-informasi/keberatan" },
  { title: "Pengajuan Sengketa", href: "/layanan-informasi/sengketa" },
  { title: "Pengaduan Masyarakat", href: "/layanan-informasi/pengaduan" },
  { title: "Alasan Pengajuan Keberatan", href: "/layanan-informasi/alasan-keberatan" },
  { title: "SOP Layanan", href: "/layanan-informasi/sop" },
];

const standarLayananItems = [
  { title: "Maklumat Pelayanan", href: "/standar-layanan/maklumat" },
  { title: "Jadwal Pelayanan", href: "/standar-layanan/jadwal" },
  { title: "Biaya/Tarif", href: "/standar-layanan/biaya" },
  { title: "Standar Pelayanan", href: "/standar-layanan" },
  { title: "Arah Kebijakan", href: "/standar-layanan/kebijakan" },
  { title: "Strategi dan Metode PPEM", href: "/standar-layanan/strategi" },
];

export function Navbar() {
  const pathname = usePathname();

  // Helper to check if a route is active
  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  const navItemClass = (path: string) => cn(
    "group inline-flex h-10 w-max items-center justify-center bg-transparent px-4 py-2 text-[13px] font-bold uppercase text-muted-foreground transition-colors hover:text-[#007144] focus:text-[#007144] focus:outline-none disabled:pointer-events-none disabled:opacity-50 border-b-2",
    isActive(path) ? "border-[#007144] text-[#007144]" : "border-transparent"
  );

  return (
    <header className="w-full bg-background shadow-sm">
      {/* Top Tier */}
      <div className="container max-w-7xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Image src="/logo-kemenag.svg" alt="Logo Kemenag" width={56} height={56} priority className="object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-[#007144] text-lg md:text-xl tracking-wide leading-tight">PPID KEMENAG</span>
            <span className="text-muted-foreground text-sm tracking-wide leading-tight">Kabupaten Barito Utara</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-xs font-bold tracking-wide">
            <span className="text-[#007144]">HAPAKAT</span>{" "}
            <span className="text-orange-500 font-medium">Harmonis,</span>{" "}
            <span className="text-orange-500 font-medium">Amanah,</span>{" "}
            <span className="text-orange-500 font-medium">Profesional,</span>{" "}
            <span className="text-orange-500 font-medium">Akuntabel,</span>{" "}
            <span className="text-orange-500 font-medium">Kreatif,</span>{" "}
            <span className="text-orange-500 font-medium">Adil dan</span>{" "}
            <span className="text-orange-500 font-medium">Transparan</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom Tier */}
      <div className="border-t border-border/50 hidden md:block">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-center relative">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navItemClass("/")}>
                    BERANDA
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/profil"), "!bg-transparent data-[state=open]:text-[#007144]")}>PROFIL</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {profilItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/data-informasi"), "!bg-transparent data-[state=open]:text-[#007144]")}>DATA INFORMASI</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    {dataInformasiItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/informasi-publik"), "!bg-transparent data-[state=open]:text-[#007144]")}>INFORMASI PUBLIK</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    {informasiPublikItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/layanan-informasi"), "!bg-transparent data-[state=open]:text-[#007144]")}>LAYANAN INFORMASI</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {layananInformasiItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/standar-layanan"), "!bg-transparent data-[state=open]:text-[#007144]")}>STANDAR LAYANAN</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {standarLayananItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/regulasi" legacyBehavior passHref>
                  <NavigationMenuLink className={navItemClass("/regulasi")}>
                    REGULASI
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4">
             <button className="text-muted-foreground hover:text-[#007144] transition-colors">
               <Search className="h-5 w-5" />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <Link href={href || "#"} legacyBehavior passHref>
        <NavigationMenuLink
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">{children}</p>}
        </NavigationMenuLink>
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";
