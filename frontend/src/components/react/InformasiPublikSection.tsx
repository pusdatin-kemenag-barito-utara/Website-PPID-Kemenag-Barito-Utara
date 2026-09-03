"use client";

import { useState, useEffect } from "react";
import { Calendar, AlertCircle, Clock, Lock, FileText, Search, ShieldAlert, Eye } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import PdfViewerModal from "./admin/PdfViewerModal";

type Theme = "emerald" | "amber" | "blue" | "red";

interface Props {
  kategori: string;
  badge: string;
  title: string;
  subtitle: string;
  listTitle: string;
  emptyState: string;
  placeholder: string;
  buttonText: string;
  theme: Theme;
  warning?: string;
}

interface Doc {
  id: string;
  judul: string;
  kategori: string;
  deskripsi?: string;
  tanggal?: string;
  ukuran?: string;
  file_url?: string;
}

const themeConfig: Record<Theme, { badge: string; subtitle: string; banner: string; icon: string; hover: string; button: string; glyph: typeof Calendar }> = {
  emerald: {
    banner: "from-emerald-950 via-[#007144] to-emerald-900",
    badge: "text-emerald-200",
    subtitle: "text-emerald-100/90",
    icon: "bg-emerald-500/10 text-[#007144]",
    hover: "hover:border-[#007144]/40",
    button: "bg-[#007144] hover:bg-[#005935]",
    glyph: Calendar,
  },
  amber: {
    banner: "from-amber-950 via-amber-800 to-emerald-950",
    badge: "text-amber-200",
    subtitle: "text-amber-100/90",
    icon: "bg-amber-500/10 text-amber-700",
    hover: "hover:border-amber-500/40",
    button: "bg-amber-700 hover:bg-amber-800",
    glyph: AlertCircle,
  },
  blue: {
    banner: "from-blue-950 via-blue-900 to-emerald-950",
    badge: "text-blue-200",
    subtitle: "text-blue-100/90",
    icon: "bg-blue-500/10 text-blue-700",
    hover: "hover:border-blue-500/40",
    button: "bg-blue-700 hover:bg-blue-800",
    glyph: Clock,
  },
  red: {
    banner: "from-red-950 via-red-900 to-emerald-950",
    badge: "text-red-200",
    subtitle: "text-red-100/90",
    icon: "bg-red-500/10 text-red-700",
    hover: "hover:border-red-500/40",
    button: "bg-red-700 hover:bg-red-800",
    glyph: Lock,
  },
};

export default function InformasiPublikSection({
  kategori,
  badge,
  title,
  subtitle,
  listTitle,
  emptyState,
  placeholder,
  buttonText,
  theme,
  warning,
}: Props) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done">("idle");
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  const cfg = themeConfig[theme];
  const BadgeIcon = cfg.glyph;

  useEffect(() => {
    if (loadState !== "idle") return;
    setLoadState("loading");
    apiGet<{ items?: Doc[] }>(`/informasi-publik?kategori=${encodeURIComponent(kategori)}`)
      .then((res) => setDocs(res.items ?? []))
      .catch(() => setDocs([]))
      .finally(() => setLoadState("done"));
  }, [kategori, loadState]);

  const filteredDocs = docs.filter((d) =>
    d.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${cfg.banner} text-white p-8 md:p-12 shadow-xl`}>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ${cfg.badge} text-xs font-bold uppercase tracking-wider backdrop-blur-md`}>
            <BadgeIcon className="w-4 h-4" /> {badge}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
          <p className={`${cfg.subtitle} text-sm md:text-base leading-relaxed`}>
            {subtitle}
          </p>
        </div>
      </section>

      {warning && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-800 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs md:text-sm">
            <span className="font-bold block">Penting Mengenai Informasi Dikecualikan:</span>
            <p className="leading-relaxed">{warning}</p>
          </div>
        </div>
      )}

      {/* Search & Document List */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-foreground">{listTitle} ({filteredDocs.length})</h2>
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div key={doc.id} className={`p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${cfg.hover}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${cfg.icon} shrink-0 mt-0.5`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-foreground leading-snug">{doc.judul}</h3>
                    {doc.deskripsi && <p className="text-xs text-muted-foreground">{doc.deskripsi}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span>Dipublish: {doc.tanggal}</span>
                      <span>•</span>
                      <span>Ukuran: {doc.ukuran}</span>
                    </div>
                  </div>
                </div>
                {doc.file_url ? (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ url: doc.file_url!, title: doc.judul })}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 ${cfg.button} text-white px-5 py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all shadow-xs shrink-0 cursor-pointer`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Dokumen</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-muted text-muted-foreground px-5 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed opacity-60 shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Dokumen Belum Tersedia</span>
                  </button>
                )}
              </div>
            ))
          ) : loadState === "loading" ? (
            <div className="p-12 text-center bg-card border border-border/60 rounded-2xl text-muted-foreground text-sm">
              Memuat dokumen...
            </div>
          ) : (
            <div className="p-12 text-center bg-card border border-border/60 rounded-2xl text-muted-foreground text-sm">
              {emptyState}
            </div>
          )}
        </div>
      </section>

      {/* Floating PDF Document Viewer Modal */}
      <PdfViewerModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url ?? ""}
        title={previewDoc?.title}
      />
    </div>
  );
}