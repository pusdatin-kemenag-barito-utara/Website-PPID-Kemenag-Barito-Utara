"use client";

import { useInformasiPublikStore } from "@/lib/use-informasi-publik";
import { Clock, FileText, Download, Search } from "lucide-react";
import { useState } from "react";

export default function InformasiSetiapSaatPage() {
  const { docs } = useInformasiPublikStore();
  const [searchQuery, setSearchQuery] = useState("");

  const setiapSaatDocs = docs.filter(
    (doc) => doc.category === "Setiap Saat" && doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-emerald-950 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Clock className="w-4 h-4" /> Tersedia Setiap Saat
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Informasi Tersedia Setiap Saat</h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Daftar informasi publik yang dapat diakses dan diperoleh pemohon kapan saja sesuai kebutuhan.
          </p>
        </div>
      </section>

      {/* Search & Document List */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-foreground">Daftar Berkas Tersedia Setiap Saat ({setiapSaatDocs.length})</h2>
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari dokumen setiap saat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {setiapSaatDocs.length > 0 ? (
            setiapSaatDocs.map((doc) => (
              <div key={doc.id} className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-700 shrink-0 mt-0.5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-foreground leading-snug">{doc.title}</h3>
                    {doc.keterangan && <p className="text-xs text-muted-foreground">{doc.keterangan}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span>Dipublish: {doc.date}</span>
                      <span>•</span>
                      <span>Ukuran: {doc.fileSize}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-800 active:scale-[0.98] transition-all shadow-xs shrink-0">
                  <Download className="w-4 h-4" />
                  <span>Unduh Berkas</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-card border border-border/60 rounded-2xl text-muted-foreground text-sm">
              Belum ada dokumen setiap saat yang ditemukan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
