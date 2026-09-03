import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Info,
  FileText,
  AlertTriangle,
  MessageSquareWarning,
  Scroll,
  BarChart3,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  FileCheck,
} from "lucide-react";
import { apiGet, apiSend, isUnauthorized } from "@/lib/api-client";
import type { AdminPageKey } from "./admin/types";
import { cn } from "./admin/shared";
import DashboardSection from "./admin/DashboardSection";
import InformasiSection from "./admin/InformasiSection";
import RegulasiSection from "./admin/RegulasiSection";
import SopSection from "./admin/SopSection";
import PermohonanSection from "./admin/PermohonanSection";
import DataInformasiSection from "./admin/DataInformasiSection";

type Props = {
  page: AdminPageKey;
  userEmail: string;
  userFullName?: string;
};

interface SubMenuItem {
  title: string;
  href: string;
}

interface NavGroup {
  key: string;
  title: string;
  icon: React.ElementType;
  adminPageKey: AdminPageKey;
  children: SubMenuItem[];
}

export default function AdminApp({ page, userEmail, userFullName }: Props) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Accordion logic: open the accordion matching the current page
  const getInitialAccordion = (p: AdminPageKey): string | null => {
    switch (p) {
      case "informasi":
        return "informasi";
      case "permohonan": {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const j = params.get("jenis");
          if (j === "KEBERATAN") return "keberatan-info";
          if (j === "PENGADUAN") return "pengaduan-info";
        }
        return "permohonan-info";
      }
      case "regulasi":
        return "regulasi";
      case "sop":
        return "sop";
      case "data-informasi":
        return "data-informasi";
      default:
        return null;
    }
  };

  const [openMenuKey, setOpenMenuKey] = useState<string | null>(() =>
    getInitialAccordion(page),
  );

  useEffect(() => {
    const updatePath = () => {
      if (typeof window !== "undefined") {
        setCurrentPath(window.location.pathname + window.location.search);
      }
    };
    updatePath();
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  useEffect(() => {
    apiGet<{ email: string }>("/auth/me")
      .then(() => undefined)
      .catch((err: unknown) => {
        if (isUnauthorized(err)) window.location.href = "/pusdatin/auth";
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (event.target instanceof Node) {
        const el = document.getElementById("admin-user-dropdown");
        if (el && !el.contains(event.target)) setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    // Prevent browser bfcache restoration: if user navigates back after logout, force fresh reload
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // Clicking parent menu only toggles its accordion and closes other menus (does NOT navigate)
  const toggleMenu = (key: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenuKey((prev) => (prev === key ? null : key));
  };

  const handleLogout = async () => {
    try {
      await apiSend("/auth/logout", "POST");
    } catch {
      // ignore
    }

    // 1. Immediately invalidate client-side session cookie
    document.cookie = "ppid_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    // 2. Clear all client storage
    try {
      sessionStorage.clear();
      localStorage.removeItem("ppid_admin_user");
      localStorage.removeItem("ppid_admin_token");
    } catch {}

    // 3. Clear and replace browser history so user cannot navigate back to admin
    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", "/pusdatin/auth");
    }
    window.location.replace("/pusdatin/auth");
  };

  const renderContent = () => {
    switch (page) {
      case "dashboard":
        return <DashboardSection />;
      case "informasi":
        return <InformasiSection />;
      case "regulasi":
        return <RegulasiSection />;
      case "sop":
        return <SopSection />;
      case "permohonan":
        return <PermohonanSection />;
      case "data-informasi":
        return <DataInformasiSection />;
      default:
        return null;
    }
  };

  // 1. Core PPID modules
  const ppidNavigationGroups: NavGroup[] = [
    {
      key: "informasi",
      title: "INFORMASI PUBLIK",
      icon: Info,
      adminPageKey: "informasi",
      children: [
        {
          title: "Informasi Berkala",
          href: "/admin/informasi-publik?kategori=BERKALA",
        },
        {
          title: "Informasi Serta Merta",
          href: "/admin/informasi-publik?kategori=SERTA_MERTA",
        },
        {
          title: "Tersedia Setiap Saat",
          href: "/admin/informasi-publik?kategori=SETIAP_SAAT",
        },
        {
          title: "Dikecualikan",
          href: "/admin/informasi-publik?kategori=DIKECUALIKAN",
        },
      ],
    },
    {
      key: "regulasi",
      title: "REGULASI & SK",
      icon: Scroll,
      adminPageKey: "regulasi",
      children: [
        {
          title: "Undang-Undang & PP",
          href: "/admin/regulasi?kategori=Undang-Undang",
        },
        {
          title: "Peraturan Menteri (PMA/KMA)",
          href: "/admin/regulasi?kategori=Peraturan+Menteri",
        },
        {
          title: "SK Tim PPID",
          href: "/admin/regulasi?kategori=SK+Kepala+Kantor",
        },
      ],
    },
    {
      key: "sop",
      title: "SOP LAYANAN",
      icon: FileCheck,
      adminPageKey: "sop",
      children: [
        {
          title: "SOP Permohonan Informasi",
          href: "/admin/sop?kategori=Permohonan+Informasi",
        },
        {
          title: "SOP Penanganan Keberatan",
          href: "/admin/sop?kategori=Pengajuan+Keberatan",
        },
        {
          title: "SOP Informasi Dikecualikan",
          href: "/admin/sop?kategori=Informasi+Dikecualikan",
        },
        {
          title: "SOP Pengaduan Masyarakat",
          href: "/admin/sop?kategori=Pengaduan+Masyarakat",
        },
      ],
    },
  ];

  // 2. Dedicated Layanan & Pengajuan modules (TERPISAH DARI PENGELOLAAN PPID!)
  const pengajuanNavigationGroups: NavGroup[] = [
    {
      key: "permohonan-info",
      title: "PERMOHONAN INFORMASI",
      icon: FileText,
      adminPageKey: "permohonan",
      children: [
        {
          title: "Semua Permohonan",
          href: "/admin/permohonan?jenis=PERMOHONAN",
        },
        {
          title: "Menunggu Verifikasi",
          href: "/admin/permohonan?jenis=PERMOHONAN&status=MENUNGGU",
        },
        {
          title: "Sedang Diproses",
          href: "/admin/permohonan?jenis=PERMOHONAN&status=DIPROSES",
        },
        {
          title: "Telah Selesai",
          href: "/admin/permohonan?jenis=PERMOHONAN&status=SELESAI",
        },
        {
          title: "Permohonan Ditolak",
          href: "/admin/permohonan?jenis=PERMOHONAN&status=DITOLAK",
        },
      ],
    },
    {
      key: "keberatan-info",
      title: "PENGAJUAN KEBERATAN",
      icon: AlertTriangle,
      adminPageKey: "permohonan",
      children: [
        { title: "Semua Keberatan", href: "/admin/permohonan?jenis=KEBERATAN" },
        {
          title: "Menunggu Tanggapan",
          href: "/admin/permohonan?jenis=KEBERATAN&status=MENUNGGU",
        },
        {
          title: "Dalam Pembahasan",
          href: "/admin/permohonan?jenis=KEBERATAN&status=DIPROSES",
        },
        {
          title: "Keberatan Selesai",
          href: "/admin/permohonan?jenis=KEBERATAN&status=SELESAI",
        },
        {
          title: "Keberatan Ditolak",
          href: "/admin/permohonan?jenis=KEBERATAN&status=DITOLAK",
        },
      ],
    },
    {
      key: "pengaduan-info",
      title: "PENGADUAN MASYARAKAT",
      icon: MessageSquareWarning,
      adminPageKey: "permohonan",
      children: [
        { title: "Semua Pengaduan", href: "/admin/permohonan?jenis=PENGADUAN" },
        {
          title: "Aspirasi Masuk",
          href: "/admin/permohonan?jenis=PENGADUAN&status=MENUNGGU",
        },
        {
          title: "Tindak Lanjut",
          href: "/admin/permohonan?jenis=PENGADUAN&status=DIPROSES",
        },
        {
          title: "Telah Ditanggapi",
          href: "/admin/permohonan?jenis=PENGADUAN&status=SELESAI",
        },
      ],
    },
  ];

  // 3. Dedicated Data Informasi & Statistik modules (TERPISAH DARI PPID!)
  const dataInfoNavigationGroups: NavGroup[] = [
    {
      key: "data-informasi",
      title: "DATA INFORMASI",
      icon: BarChart3,
      adminPageKey: "data-informasi",
      children: [
        {
          title: "Indikator Data Statistik",
          href: "/admin/data-informasi?tab=statistik",
        },
        {
          title: "Infografis Keagamaan",
          href: "/admin/data-informasi?tab=infografis",
        },
      ],
    },
  ];

  const isNavActive = (group: NavGroup) => {
    if (page !== group.adminPageKey) return false;
    if (group.adminPageKey === "permohonan") {
      const j =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("jenis") ||
            "PERMOHONAN"
          : "PERMOHONAN";
      if (group.key === "permohonan-info") return j === "PERMOHONAN";
      if (group.key === "keberatan-info") return j === "KEBERATAN";
      if (group.key === "pengaduan-info") return j === "PENGADUAN";
    }
    return true;
  };

  const renderNavGroupList = (groups: NavGroup[]) => (
    <div className="space-y-1.5">
      {groups.map((group) => {
        const Icon = group.icon;
        const isGroupActive = isNavActive(group);
        const isOpen = openMenuKey === group.key;

        return (
          <div key={group.key} className="space-y-1">
            {/* Parent Menu is an accordion toggle */}
            <button
              type="button"
              onClick={() => toggleMenu(group.key)}
              title={isCollapsed ? group.title : undefined}
              className={cn(
                "group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                isOpen || isGroupActive
                  ? "bg-accent/70 text-[#007144] font-extrabold"
                  : "text-foreground/90 hover:bg-accent hover:text-[#007144]",
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isOpen || isGroupActive
                      ? "text-[#007144]"
                      : "text-muted-foreground group-hover:text-[#007144]",
                  )}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate font-bold">{group.title}</span>
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 shrink-0 ml-1",
                    isOpen
                      ? "rotate-180 text-[#007144]"
                      : "text-muted-foreground",
                  )}
                />
              )}
            </button>

            {/* Sub-menu items */}
            {(!isCollapsed || isMobileOpen) && isOpen && (
              <div className="pl-4 pr-1 space-y-1 border-l-2 border-border/40 ml-4 my-1.5 animate-in fade-in duration-150">
                {group.children.map((sub) => {
                  const isSubActive = currentPath === sub.href;
                  return (
                    <a
                      key={sub.href}
                      href={sub.href}
                      onClick={() => {
                        setIsMobileOpen(false);
                        setCurrentPath(sub.href);
                      }}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-[11px] transition-all truncate",
                        isSubActive
                          ? "bg-emerald-500/15 text-[#007144] font-bold shadow-2xs"
                          : "text-muted-foreground font-normal hover:text-foreground hover:bg-accent/60",
                      )}
                    >
                      {sub.title}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex w-full overflow-x-hidden selection:bg-emerald-500/20 selection:text-[#007144]">
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-background border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out shadow-md",
          isCollapsed ? "lg:w-20" : "lg:w-68",
          isMobileOpen
            ? "translate-x-0 w-68"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Top Branding */}
        <div className="h-16 flex items-center px-4 border-b border-border/50 shrink-0">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="p-1.5 rounded-xl bg-emerald-500/10 shrink-0">
              <img
                src="/logo-kemenag.svg"
                alt="Logo Kemenag"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-[#007144] tracking-tight text-base leading-none">
                  ADMIN PPID
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mt-0.5">
                  Barito Utara
                </span>
              </div>
            )}
          </a>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-2 scrollbar-thin">
          {/* Dashboard Button */}
          <div>
            <a
              href="/admin/dashboard"
              onClick={() => {
                setIsMobileOpen(false);
                setOpenMenuKey(null);
              }}
              title={isCollapsed ? "Dashboard" : undefined}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                page === "dashboard"
                  ? "bg-[#007144] text-white shadow-xs"
                  : "text-foreground/90 hover:bg-emerald-500/10 hover:text-[#007144]",
              )}
            >
              <LayoutDashboard
                className={cn(
                  "w-4 h-4 shrink-0",
                  page === "dashboard"
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-[#007144]",
                )}
              />
              {(!isCollapsed || isMobileOpen) && (
                <span className="truncate flex-1 font-bold">Dashboard</span>
              )}
            </a>
          </div>

          {/* PENGELOLAAN PPID */}
          <div className="pt-2">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 pb-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Pengelolaan PPID
              </div>
            )}
            {renderNavGroupList(ppidNavigationGroups)}
          </div>

          {/* PENGELOLAAN PENGAJUAN & LAYANAN (DEDICATED SECTION) */}
          <div className="pt-3 border-t border-border/40 mt-3">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 pb-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Layanan &amp; Pengajuan
              </div>
            )}
            {renderNavGroupList(pengajuanNavigationGroups)}
          </div>

          {/* DATA INFORMASI & STATISTIK (DEDICATED SECTION) */}
          <div className="pt-3 border-t border-border/40 mt-3">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 pb-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Data &amp; Statistik
              </div>
            )}
            {renderNavGroupList(dataInfoNavigationGroups)}
          </div>
        </nav>

        {/* Bottom Status Box */}
        <div className="p-3 border-t border-border/50 shrink-0">
          <div
            className={cn(
              "rounded-xl bg-card border border-border/60 p-2.5 flex items-center gap-2.5",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : "",
            )}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-foreground truncate">
                  PPID Barito Utara
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Terhubung • v2.0
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-20" : "lg:pl-68",
        )}
      >
        <header className="h-14 sm:h-16 bg-background/95 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-3.5 sm:px-6 md:px-8 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setIsMobileOpen(!isMobileOpen);
                else setIsCollapsed(!isCollapsed);
              }}
              className="p-2 rounded-xl text-muted-foreground hover:text-[#007144] hover:bg-emerald-500/10 focus:outline-none transition-all group cursor-pointer"
              title={
                isCollapsed
                  ? "Buka Sidebar (Expand)"
                  : "Tutup Sidebar (Collapse)"
              }
              aria-label="Toggle Sidebar"
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center relative">
                <span
                  className={cn(
                    "w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-left",
                    isCollapsed ? "w-full" : "group-hover:translate-x-0.5",
                  )}
                />
                <span
                  className={cn(
                    "w-full h-0.5 bg-current rounded-full transition-all duration-300",
                    isCollapsed ? "w-3/4 self-start" : "group-hover:w-full",
                  )}
                />
                <span
                  className={cn(
                    "w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-left",
                    isCollapsed ? "w-full" : "group-hover:translate-x-0.5",
                  )}
                />
              </div>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-l border-border/60 pl-3">
              Panel Administrator PPID
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-medium hover:bg-accent transition-all"
            >
              <span>Beranda Publik</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
            </a>

            <div className="relative" id="admin-user-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-accent px-3 py-1.5 rounded-xl transition-all border border-border/60 hover:border-[#007144]/40 cursor-pointer bg-card shadow-xs"
              >
                <div className="text-left">
                  <p className="text-xs font-extrabold leading-tight text-foreground">
                    Super Admin
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[150px] hidden sm:block">
                    {userEmail || "baritoutara@kemenag.go.id"}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-muted-foreground transition-transform ml-0.5",
                    isDropdownOpen ? "rotate-180" : "",
                  )}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-background border border-border/60 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-border/40 sm:hidden">
                    <p className="text-xs font-extrabold text-foreground truncate">
                      Super Admin
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {userEmail || "baritoutara@kemenag.go.id"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Sistem</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 w-full max-w-none">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
