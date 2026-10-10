"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, Eye, X, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { trackSearch, trackDocumentAction } from "@/lib/analytics";
import PdfViewerModal from "../react/admin/PdfViewerModal";

interface SearchDoc {
  id: string;
  judul: string;
  kategori: string;
  deskripsi?: string;
  file_url?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [regulasiDocs, setRegulasiDocs] = useState<SearchDoc[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done">("idle");
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Keyboard shortcuts: Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new Event("open_global_search"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Fetch documents when modal is first opened
  useEffect(() => {
    if (!isOpen || loadState !== "idle") return;
    setLoadState("loading");

    Promise.all([
      apiGet<{ items?: SearchDoc[] }>("/informasi-publik").catch(() => ({ items: [] })),
      apiGet<{ items?: SearchDoc[] }>("/regulasi").catch(() => ({ items: [] })),
    ])
      .then(([infoRes, regRes]) => {
        setDocs(infoRes?.items ?? []);
        setRegulasiDocs(regRes?.items ?? []);
      })
      .catch(() => {
        setDocs([]);
        setRegulasiDocs([]);
      })
      .finally(() => setLoadState("done"));
  }, [isOpen, loadState]);

  // 3. Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Filter lists based on user search query
  const cleanQuery = query.toLowerCase().trim();
  const filteredDocs = docs.filter(
    (d) =>
      !cleanQuery ||
      (d.judul && d.judul.toLowerCase().includes(cleanQuery)) ||
      (d.kategori && d.kategori.toLowerCase().includes(cleanQuery)) ||
      (d.deskripsi && d.deskripsi.toLowerCase().includes(cleanQuery))
  );

  const filteredRegulasi = regulasiDocs.filter(
    (r) =>
      !cleanQuery ||
      (r.judul && r.judul.toLowerCase().includes(cleanQuery)) ||
      (r.kategori && r.kategori.toLowerCase().includes(cleanQuery)) ||
      (r.deskripsi && r.deskripsi.toLowerCase().includes(cleanQuery))
  );

  const totalResults = filteredDocs.length + filteredRegulasi.length;

  // 4. Analytics tracking (Hook MUST be placed before any early return)
  useEffect(() => {
    if (!isOpen || cleanQuery.length < 2) return;
    const timer = setTimeout(() => {
      trackSearch(cleanQuery, totalResults, "global_search_modal");
    }, 600);
    return () => clearTimeout(timer);
  }, [isOpen, cleanQuery, totalResults]);

  // Early return ONLY AFTER ALL HOOKS HAVE BEEN EXECUTED!
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div 
        className="fixed inset-0 cursor-pointer" 
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className="relative bg-background border border-border/80 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[82vh] z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="flex items-center px-4 md:px-6 py-4 border-b border-border/50 gap-3 bg-card/50">
          <Search className="w-5 h-5 text-[#007144] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik judul berkas, nomor SK, atau kata kunci pencarian..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold focus:outline-none placeholder:text-muted-foreground text-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent text-xs"
              title="Hapus pencarian"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-muted-foreground bg-accent rounded-md border border-border/60">
            ESC
          </kbd>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          {/* Dokumen Informasi Publik */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#007144]" />
                Dokumen Informasi Publik ({filteredDocs.length})
              </h4>
            </div>

            {filteredDocs.length > 0 ? (
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 hover:border-[#007144]/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center text-[10px] font-extrabold text-[#007144] bg-emerald-500/15 px-2 py-0.5 rounded-full mb-1">
                          {doc.kategori}
                        </span>
                        <h5 className="text-xs font-bold text-foreground leading-snug break-words">{doc.judul}</h5>
                        {doc.deskripsi && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{doc.deskripsi}</p>
                        )}
                      </div>
                    </div>
                    {doc.file_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc({ url: doc.file_url!, title: doc.judul });
                          trackDocumentAction('view', doc.judul, doc.kategori, doc.file_url);
                        }}
                        className="p-2 rounded-xl text-[#007144] hover:bg-emerald-500/10 transition-colors shrink-0 cursor-pointer"
                        title="Lihat / Pratinjau Dokumen PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : loadState === "loading" ? (
              <p className="text-xs text-muted-foreground italic">Memuat berkas informasi publik...</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Tidak ada berkas informasi publik yang cocok.</p>
            )}
          </div>

          {/* Dokumen Regulasi & SK */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#007144]" />
              Payung Hukum & SK Regulasi ({filteredRegulasi.length})
            </h4>

            {filteredRegulasi.length > 0 ? (
              <div className="space-y-2">
                {filteredRegulasi.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 hover:border-[#007144]/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full mb-1">
                          {reg.kategori || "Regulasi"}
                        </span>
                        <h5 className="text-xs font-bold text-foreground leading-snug break-words">{reg.judul}</h5>
                        {reg.deskripsi && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{reg.deskripsi}</p>
                        )}
                      </div>
                    </div>
                    {reg.file_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc({ url: reg.file_url!, title: reg.judul });
                          trackDocumentAction('view', reg.judul, reg.kategori, reg.file_url);
                        }}
                        className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer"
                        title="Lihat / Pratinjau Dokumen PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : loadState === "loading" ? (
              <p className="text-xs text-muted-foreground italic">Memuat katalog payung hukum...</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Tidak ada payung hukum atau SK yang cocok.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/40 bg-accent/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Tekan <kbd className="font-bold">Ctrl + K</kbd> atau <kbd className="font-bold">ESC</kbd> untuk menutup</span>
          <a 
            href="/informasi-publik/berkala" 
            onClick={onClose} 
            className="font-bold text-[#007144] hover:underline flex items-center gap-1"
          >
            <span>Buka Katalog Lengkap</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Floating PDF Document Viewer Modal */}
      {previewDoc && (
        <PdfViewerModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          url={previewDoc.url}
          title={previewDoc.title}
        />
      )}
    </div>
  );
}