"use client";

import * as React from "react";
import {
  Search,
  X,
  LogIn,
  Home,
  UserCheck,
  Users,
  Target,
  FileText,
  GitFork,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  Clock,
  Lock,
  FileCheck2,
  AlertTriangle,
  Gavel,
  MessageSquareWarning,
  HelpCircle,
  FileCheck,
  Scroll,
  CalendarDays,
  Receipt,
  Award,
  Compass,
  Workflow,
  ChevronDown,
  Info,
  ShieldCheck
} from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import LacakTiketModal from "@/components/react/LacakTiketModal";
import GlobalSearchModal from "@/components/ui/global-search-modal";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface MenuItem {
  title: string;
  href: string;
  description?: string;
  icon: React.ElementType;
}

const profilItems: MenuItem[] = [
  { title: "Profil PPID", href: "/profil", description: "Gambaran umum PPID Kemenag Barito Utara", icon: UserCheck },
  { title: "Profil Pejabat", href: "/profil/pejabat", description: "Struktur dan pimpinan pejabat pengelola", icon: Users },
  { title: "Visi Misi Motto", href: "/profil/visi-misi", description: "Landasan Visi, Misi dan Motto pelayanan", icon: Target },
  { title: "Tugas dan Fungsi", href: "/profil/tugas-fungsi", description: "Tugas pokok dan fungsi operasional", icon: FileText },
  { title: "Struktur Organisasi", href: "/profil/struktur", description: "Bagan susunan organisasi PPID", icon: GitFork },
];

const dataInformasiItems: MenuItem[] = [
  { title: "Dashboard Data", href: "/data-informasi", description: "Visualisasi & statistik data informasi", icon: BarChart3 },
  { title: "Infografis Keagamaan", href: "/data-informasi/infografis", description: "Sajian data visual keagamaan", icon: PieChart },
];

const informasiPublikItems: MenuItem[] = [
  { title: "Informasi Berkala", href: "/informasi-publik/berkala", description: "Diumumkan secara berkala", icon: Calendar },
  { title: "Informasi Serta Merta", href: "/informasi-publik/serta-merta", description: "Informasi darurat & mendadak", icon: AlertCircle },
  { title: "Tersedia Setiap Saat", href: "/informasi-publik/setiap-saat", description: "Informasi publik setiap saat", icon: Clock },
  { title: "Dikecualikan", href: "/informasi-publik/dikecualikan", description: "Daftar informasi dikecualikan", icon: Lock },
];

const layananInformasiItems: MenuItem[] = [
  { title: "Permohonan Informasi", href: "/layanan-informasi/permohonan", description: "Pengajuan permohonan informasi publik", icon: FileCheck2 },
  { title: "Pengajuan Keberatan", href: "/layanan-informasi/keberatan", description: "Formulir keberatan, alasan sah & sengketa", icon: AlertTriangle },
  { title: "Pengaduan Masyarakat", href: "/layanan-informasi/pengaduan", description: "Layanan pengaduan & aspirasi", icon: MessageSquareWarning },
  { title: "SOP & Standar Layanan", href: "/layanan-informasi/sop", description: "Standard Operating Procedure & Maklumat", icon: FileCheck },
];

const standarLayananItems: MenuItem[] = [
  { title: "Maklumat Pelayanan", href: "/standar-layanan/maklumat", description: "Pernyataan komitmen pelayanan", icon: Scroll },
  { title: "Jadwal Pelayanan", href: "/standar-layanan/jadwal", description: "Waktu operasional layanan", icon: CalendarDays },
  { title: "Biaya / Tarif", href: "/standar-layanan/biaya", description: "Rincian biaya permohonan gratis", icon: Receipt },
  { title: "Standar Pelayanan", href: "/standar-layanan", description: "Komponen standar pelayanan public", icon: Award },
  { title: "Arah Kebijakan", href: "/standar-layanan/kebijakan", description: "Pedoman & arah kebijakan PPID", icon: Compass },
  { title: "Strategi & Metode PPEM", href: "/standar-layanan/strategi", description: "Strategi pengelolaan informasi", icon: Workflow },
];

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath = "" }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleOpenSearch = () => setIsSearchModalOpen(true);
    window.addEventListener("open_global_search", handleOpenSearch);
    return () => window.removeEventListener("open_global_search", handleOpenSearch);
  }, []);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  if (currentPath?.startsWith('/admin')) return null;

  const isActive = (path: string) => {
    if (path === "/" && currentPath !== "/") return false;
    return currentPath.startsWith(path);
  };

  const navItemClass = (path: string) => cn(
    "group inline-flex h-10 w-max items-center justify-center rounded-md px-3.5 py-2 text-[13px] font-semibold tracking-wide text-foreground/80 transition-all hover:bg-emerald-500/10 hover:text-[#007144] focus:outline-none disabled:pointer-events-none disabled:opacity-50",
    isActive(path) ? "bg-emerald-500/15 text-[#007144] font-bold" : ""
  );

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs transition-all">
      {/* Top Tier Header */}
      <div className="w-full px-4 md:px-8 lg:px-12 py-3 md:py-4 flex justify-between items-center">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
          <div className="relative overflow-hidden rounded-xl p-1 bg-emerald-500/5 group-hover:bg-emerald-500/15 transition-all shrink-0">
            <img src="/logo-kemenag.svg" alt="Logo Kemenag" width={44} height={44} loading="eager" className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[#007144] text-base sm:text-lg md:text-xl tracking-tight leading-none group-hover:text-emerald-700 transition-colors whitespace-nowrap">
              PPID KEMENAG
            </span>
            <span className="text-muted-foreground text-[11px] sm:text-xs md:text-sm font-medium tracking-tight sm:tracking-wide leading-tight mt-0.5 whitespace-nowrap">
              Kabupaten Barito Utara
            </span>
          </div>
        </a>

        {/* Desktop Slogan & Action Controls */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-accent/50 border border-border/40">
            <img src="/hapakat.png" alt="Logo Hapakat" width={80} height={20} className="object-contain" />
            <div className="text-[10.5px] font-bold tracking-tight text-[#007144] hidden xl:block border-l border-border/60 pl-3">
              <span className="text-orange-500">H</span>armonis,{" "}
              <span className="text-orange-500">A</span>manah,{" "}
              <span className="text-orange-500">P</span>rofesional,{" "}
              <span className="text-orange-500">A</span>kuntabel,{" "}
              <span className="text-orange-500">K</span>reatif,{" "}
              <span className="text-orange-500">A</span>dil &{" "}
              <span className="text-orange-500">T</span>ransparan
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-l border-border/60 pl-4">
            <LacakTiketModal />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Action & Animated Hamburger Trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <LacakTiketModal />
          <ThemeToggle />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-[#007144] hover:bg-emerald-500/10 focus:outline-none transition-all group"
            aria-label="Toggle Navigation Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between items-center relative">
              <span
                className={cn(
                  "w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-right",
                  isMobileMenuOpen ? "-rotate-45 -translate-y-0.5 w-full" : ""
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-current rounded-full transition-all duration-300",
                  isMobileMenuOpen ? "opacity-0 scale-x-0" : ""
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-right",
                  isMobileMenuOpen ? "rotate-45 translate-y-0.5 w-full" : ""
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Desktop Navigation Tier */}
      <div className="border-t border-border/40 hidden lg:block bg-background/50">
        <div className="w-full px-4 md:px-8 lg:px-12 flex items-center justify-between">
          <NavigationMenu className="max-w-none">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink render={<a href="/" data-analytics-event="nav_click" data-analytics-category="navigation" data-analytics-label="BERANDA" data-analytics-section="desktop_nav" className={navItemClass("/")} />}>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#007144]" />
                    <span>BERANDA</span>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Profil Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/profil"), "!bg-transparent data-[state=open]:bg-emerald-500/10 data-[state=open]:text-[#007144]")}>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#007144]" />
                    <span>PROFIL</span>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[450px] gap-2 p-3 md:w-[550px] md:grid-cols-2 lg:w-[620px]">
                    {profilItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Data Informasi Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/data-informasi"), "!bg-transparent data-[state=open]:bg-emerald-500/10 data-[state=open]:text-[#007144]")}>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#007144]" />
                    <span>DATA INFORMASI</span>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-3 md:w-[480px] md:grid-cols-2">
                    {dataInformasiItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Informasi Publik Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/informasi-publik"), "!bg-transparent data-[state=open]:bg-emerald-500/10 data-[state=open]:text-[#007144]")}>
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#007144]" />
                    <span>INFORMASI PUBLIK</span>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[450px] gap-2 p-3 md:w-[520px] md:grid-cols-2">
                    {informasiPublikItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Layanan Informasi Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/layanan-informasi"), "!bg-transparent data-[state=open]:bg-emerald-500/10 data-[state=open]:text-[#007144]")}>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#007144]" />
                    <span>LAYANAN INFORMASI</span>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[450px] gap-2 p-3 md:w-[550px] md:grid-cols-2 lg:w-[640px]">
                    {layananInformasiItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Standar Layanan Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navItemClass("/standar-layanan"), "!bg-transparent data-[state=open]:bg-emerald-500/10 data-[state=open]:text-[#007144]")}>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#007144]" />
                    <span>STANDAR LAYANAN</span>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[450px] gap-2 p-3 md:w-[550px] md:grid-cols-2 lg:w-[640px]">
                    {standarLayananItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Regulasi Link */}
              <NavigationMenuItem>
                <NavigationMenuLink render={<a href="/regulasi" data-analytics-event="nav_click" data-analytics-category="navigation" data-analytics-label="REGULASI" data-analytics-section="desktop_nav" className={navItemClass("/regulasi")} />}>
                  <div className="flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-[#007144]" />
                    <span>REGULASI</span>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center pl-2">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              data-analytics-event="search_modal_open"
              data-analytics-category="search"
              data-analytics-label="Header Global Search"
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-[#007144] px-3 py-1.5 rounded-full hover:bg-emerald-500/10 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Cari Informasi...</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-foreground/80 dark:text-foreground/90 bg-muted/90 rounded border border-border/80 ml-1">
                Ctrl K
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Global Search Modal */}
    <GlobalSearchModal
      isOpen={isSearchModalOpen}
      onClose={() => setIsSearchModalOpen(false)}
    />

    {/* Mobile Right-to-Left Sliding Side Drawer (Root Mounted) */}
    {isMobileMenuOpen && (
      <div className="lg:hidden fixed inset-0 z-[9999] h-screen w-screen flex justify-end">
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/60 transition-all duration-300 animate-in fade-in"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sliding Panel Content */}
        <div className="relative w-[280px] max-w-[85vw] bg-background h-screen shadow-2xl border-l border-border/60 flex flex-col z-[10000] animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-border/50 bg-accent/20 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#007144]" />
              <span className="font-extrabold text-sm text-[#007144]">Navigasi Utama</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu List Container */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-none">
            <a
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn("flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors", isActive("/") ? "bg-[#007144] text-white shadow-xs" : "text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144]")}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Beranda</span>
            </a>

            {/* Mobile Profil Section */}
            <div>
              <button
                onClick={() => toggleMobileSection('profil')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-[#007144]" />
                  Profil
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expandedMobileSection === 'profil' ? "rotate-180" : "")} />
              </button>
              {expandedMobileSection === 'profil' && (
                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#007144]/20 ml-4 my-1">
                  {profilItems.map(item => (
                    <a key={item.title} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors", isActive(item.href) ? "text-[#007144] bg-emerald-500/10" : "text-muted-foreground hover:bg-accent")}>
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Data Informasi Section */}
            <div>
              <button
                onClick={() => toggleMobileSection('data')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-[#007144]" />
                  Data Informasi
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expandedMobileSection === 'data' ? "rotate-180" : "")} />
              </button>
              {expandedMobileSection === 'data' && (
                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#007144]/20 ml-4 my-1">
                  {dataInformasiItems.map(item => (
                    <a key={item.title} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors", isActive(item.href) ? "text-[#007144] bg-emerald-500/10" : "text-muted-foreground hover:bg-accent")}>
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Informasi Publik Section */}
            <div>
              <button
                onClick={() => toggleMobileSection('publik')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-[#007144]" />
                  Informasi Publik
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expandedMobileSection === 'publik' ? "rotate-180" : "")} />
              </button>
              {expandedMobileSection === 'publik' && (
                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#007144]/20 ml-4 my-1">
                  {informasiPublikItems.map(item => (
                    <a key={item.title} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors", isActive(item.href) ? "text-[#007144] bg-emerald-500/10" : "text-muted-foreground hover:bg-accent")}>
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Layanan Informasi Section */}
            <div>
              <button
                onClick={() => toggleMobileSection('layanan')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4 text-[#007144]" />
                  Layanan Informasi
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expandedMobileSection === 'layanan' ? "rotate-180" : "")} />
              </button>
              {expandedMobileSection === 'layanan' && (
                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#007144]/20 ml-4 my-1">
                  {layananInformasiItems.map(item => (
                    <a key={item.title} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors", isActive(item.href) ? "text-[#007144] bg-emerald-500/10" : "text-muted-foreground hover:bg-accent")}>
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Standar Layanan Section */}
            <div>
              <button
                onClick={() => toggleMobileSection('standar')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-[#007144]" />
                  Standar Layanan
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expandedMobileSection === 'standar' ? "rotate-180" : "")} />
              </button>
              {expandedMobileSection === 'standar' && (
                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#007144]/20 ml-4 my-1">
                  {standarLayananItems.map(item => (
                    <a key={item.title} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors", isActive(item.href) ? "text-[#007144] bg-emerald-500/10" : "text-muted-foreground hover:bg-accent")}>
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/regulasi"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn("flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors", isActive("/regulasi") ? "bg-[#007144] text-white shadow-xs" : "text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144]")}
            >
              <Scroll className="w-4 h-4 shrink-0" />
              <span>Regulasi</span>
            </a>
          </nav>
        </div>
      </div>
    )}
    </>
  );
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
  href?: string;
  icon?: React.ElementType;
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, href, icon: Icon, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink
          render={
            <a
              ref={ref}
              href={href || "#"}
              data-analytics-event="nav_click"
              data-analytics-category="navigation"
              data-analytics-label={title}
              data-analytics-section="desktop_dropdown"
              className={cn(
                "group flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-emerald-500/10 hover:text-emerald-950 dark:hover:text-emerald-100 focus:bg-emerald-500/10 outline-none border border-transparent hover:border-emerald-500/20",
                className
              )}
            />
          }
          {...props}
        >
          {Icon && (
            <div className="p-2 rounded-lg bg-emerald-500/10 text-[#007144] group-hover:bg-[#007144] group-hover:text-white transition-colors shrink-0 mt-0.5">
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            </div>
          )}
          <div className="space-y-1">
            <div className="text-xs font-bold leading-none text-foreground group-hover:text-[#007144] transition-colors">{title}</div>
            <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground/80">
              {children}
            </p>
          </div>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";