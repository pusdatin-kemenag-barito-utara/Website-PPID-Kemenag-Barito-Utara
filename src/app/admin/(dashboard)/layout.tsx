"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Info, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Search,
  BarChart3,
  Award,
  Scroll
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sidebarMenu = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Profil Instansi", href: "/admin/profil", icon: Users },
  { title: "Data Informasi", href: "/admin/data-informasi", icon: BarChart3 },
  { title: "Informasi Publik", href: "/admin/informasi-publik", icon: Info },
  { title: "Standar Layanan", href: "/admin/standar-layanan", icon: Award },
  { title: "Regulasi & SK", href: "/admin/regulasi", icon: Scroll },
  { title: "Permohonan Layanan", href: "/admin/permohonan", icon: FileText },
  { title: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-muted/20 flex w-full overflow-x-hidden selection:bg-emerald-500/20 selection:text-[#007144]">
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-background border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out shadow-md",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 shrink-0">
              <Image src="/logo-kemenag.svg" alt="Logo Kemenag" width={28} height={28} className="object-contain" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-[#007144] tracking-tight text-base leading-none">
                  Admin PPID
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mt-0.5">
                  Barito Utara
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-none">
          {sidebarMenu.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  isActive 
                    ? "bg-[#007144] text-white shadow-xs" 
                    : "text-muted-foreground hover:bg-emerald-500/10 hover:text-[#007144]"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-white" : "text-muted-foreground group-hover:text-[#007144]")} />
                
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1">{item.title}</span>
                )}

                {isActive && (!isCollapsed || isMobileOpen) && (
                  <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Badge */}
        <div className="p-3 border-t border-border/50">
          <div className={cn(
            "rounded-xl bg-accent/50 border border-border/40 p-3 flex items-center gap-3",
            isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
          )}>
            <div className="w-8 h-8 rounded-lg bg-[#007144]/10 text-[#007144] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-foreground truncate">Super Admin</span>
                <span className="text-[10px] text-muted-foreground truncate">v2.4 PPID System</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container (Shifted with padding to make room for fixed sidebar) */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Top Header */}
        <header className="h-16 bg-background/95 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-2xs">
          {/* Left Controls: Hamburger Menu Button OUTSIDE Sidebar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileOpen(!isMobileOpen);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              className="p-2 rounded-xl text-muted-foreground hover:text-[#007144] hover:bg-emerald-500/10 focus:outline-none transition-all group"
              title={isCollapsed ? "Buka Sidebar (Expand)" : "Tutup Sidebar (Collapse)"}
              aria-label="Toggle Sidebar"
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center relative">
                <span 
                  className={cn(
                    "w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-left",
                    isCollapsed ? "w-full" : "group-hover:translate-x-0.5"
                  )} 
                />
                <span 
                  className={cn(
                    "w-full h-0.5 bg-current rounded-full transition-all duration-300",
                    isCollapsed ? "w-3/4 self-start" : "group-hover:w-full"
                  )} 
                />
                <span 
                  className={cn(
                    "w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-left",
                    isCollapsed ? "w-full" : "group-hover:translate-x-0.5"
                  )} 
                />
              </div>
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-l border-border/60 pl-3">
              Panel Administrator
            </span>
          </div>

          {/* Right Controls: Quick Search, Notif & User Menu */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-accent/40 border border-border/40 px-3 py-1.5 rounded-full transition-colors">
              <Search className="w-3.5 h-3.5" />
              <span>Cari...</span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-accent p-1.5 rounded-xl transition-all border border-transparent hover:border-border/40"
              >
                <div className="w-9 h-9 rounded-full bg-[#007144]/10 text-[#007144] border border-[#007144]/20 flex items-center justify-center font-bold text-sm">
                  SA
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold leading-tight text-foreground">SUPER ADMIN</p>
                  <p className="text-[11px] text-muted-foreground">baritoutara@kemenag.go.id</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isDropdownOpen ? "rotate-180" : "")} />
              </button>

              {/* Dropdown Logout Box */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border/60 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-border/40 md:hidden">
                    <p className="text-xs font-bold text-foreground">SUPER ADMIN</p>
                    <p className="text-[10px] text-muted-foreground truncate">baritoutara@kemenag.go.id</p>
                  </div>
                  <Link 
                    href="/admin/pengaturan" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Pengaturan Akun</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors mt-1 border-t border-border/40 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Sistem</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Full-width Main Area */}
        <main className="flex-1 p-4 md:p-8 w-full max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}

