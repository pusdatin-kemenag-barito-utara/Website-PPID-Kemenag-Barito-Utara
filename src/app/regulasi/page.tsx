"use client";

import { useRegulasiStore } from "@/lib/use-regulasi";
import { Scroll, FileText, Download, Search, Tag } from "lucide-react";
import { useState } from "react";

export default function RegulasiPage() {
  const { items } = useRegulasiStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("Semua");

  const filteredRegulasi = items.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.nomor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedKategori === "Semua" || item.kategori === selectedKategori;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Scroll className="w-4 h-4" /> Payung Hukum & Regulasi
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Regulasi & SK PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Repositori resmi Undang-Undang, Peraturan Pemerintah, PMA, KMA, dan Keputusan Kepala Kantor Kemenag Barito Utara.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {["Semua", "Undang-Undang", "Peraturan Pemerintah", "Peraturan Menteri", "Keputusan Menteri", "SK Kepala Kantor"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedKategori(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedKategori === cat
                    ? "bg-[#007144] text-white shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari nomor atau judul regulasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
            />
          </div>
        </div>

        {/* List Cards */}
        <div className="grid gap-4">
          {filteredRegulasi.length > 0 ? (
            filteredRegulasi.map((item) => (
              <div key={item.id} className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#007144]/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-[#007144] text-sm">{item.nomor}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-[#007144] text-[10px] font-extrabold">
                        <Tag className="w-3 h-3" />
                        {item.kategori}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-foreground leading-snug">{item.judul}</h3>
                    {item.keterangan && <p className="text-xs text-muted-foreground">{item.keterangan}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span>Dipublish: {item.tglTerbit}</span>
                      <span>•</span>
                      <span>Ukuran File: {item.fileSize}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs shrink-0">
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen Regulasi</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-card border border-border/60 rounded-2xl text-muted-foreground text-sm">
              Tidak ada dokumen regulasi yang ditemukan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
