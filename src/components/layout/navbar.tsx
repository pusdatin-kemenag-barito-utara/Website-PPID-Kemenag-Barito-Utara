"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
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
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-6">
            <span className="text-primary">PPID</span> Kemenag
          </Link>
          
          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Beranda
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Profil</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {profilItems.map((item) => (
                        <ListItem key={item.title} title={item.title} href={item.href} />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Data</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {dataInformasiItems.map((item) => (
                        <ListItem key={item.title} title={item.title} href={item.href} />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Informasi</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {informasiPublikItems.map((item) => (
                        <ListItem key={item.title} title={item.title} href={item.href} />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Layanan</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {layananInformasiItems.map((item) => (
                        <ListItem key={item.title} title={item.title} href={item.href} />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Standar</NavigationMenuTrigger>
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
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Regulasi
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
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
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || "#"}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">{children}</p>}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
