"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Download, X, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { useInformasiPublikStore } from "@/lib/use-informasi-publik";
import { useRegulasiStore } from "@/lib/use-regulasi";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const { docs } = useInformasiPublikStore();
  const { items: regulasiItems } = useRegulasiStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new Event("open_global_search"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRegulasi = regulasiItems.filter(
    (r) =>
      r.judul.toLowerCase().includes(query.toLowerCase()) ||
      r.nomor.toLowerCase().includes(query.toLowerCase()) ||
      r.kategori.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4 animate-in fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative bg-background border border-border/80 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in zoom-in-95">
        {/* Search Bar Header */}
        <div className="flex items-center px-4 md:px-6 py-4 border-b border-border/50 gap-3">
          <Search className="w-5 h-5 text-[#007144] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Ketik judul berkas, nomor SK, atau kata kunci..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold focus:outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-muted-foreground bg-accent rounded-md border border-border/60">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-none">
          {/* Dokumen Informasi Publik */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Dokumen Informasi Publik ({filteredDocs.length})
            </h4>
            {filteredDocs.length > 0 ? (
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 hover:border-[#007144]/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="inline-flex items-center text-[10px] font-extrabold text-[#007144] bg-emerald-500/15 px-2 py-0.5 rounded-full mb-1">
                          {doc.category}
                        </span>
                        <h5 className="text-xs font-bold text-foreground leading-snug">{doc.title}</h5>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{doc.keterangan}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl text-[#007144] hover:bg-emerald-500/10 transition-colors shrink-0" title="Unduh Dokumen">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Tidak ada berkas informasi publik yang cocok.</p>
            )}
          </div>

          {/* Dokumen Regulasi & SK */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Payung Hukum & SK ({filteredRegulasi.length})
            </h4>
            {filteredRegulasi.length > 0 ? (
              <div className="space-y-2">
                {filteredRegulasi.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 hover:border-[#007144]/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#007144] block">{reg.nomor}</span>
                        <h5 className="text-xs font-bold text-foreground leading-snug">{reg.judul}</h5>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl text-[#007144] hover:bg-emerald-500/10 transition-colors shrink-0" title="Unduh Dokumen">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Tidak ada dokumen regulasi yang cocok.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/40 bg-accent/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Gunakan <kbd className="font-bold">Ctrl + K</kbd> untuk pencarian cepat</span>
          <Link href="/informasi-publik/berkala" onClick={onClose} className="font-bold text-[#007144] hover:underline flex items-center gap-1">
            <span>Buka Katalog Lengkap</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
