"use client";

import { useInformasiPublikStore } from "@/lib/use-informasi-publik";
import { Lock, FileText, Download, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function InformasiDikecualikanPage() {
  const { docs } = useInformasiPublikStore();
  const [searchQuery, setSearchQuery] = useState("");

  const dikecualikanDocs = docs.filter(
    (doc) => doc.category === "Dikecualikan" && doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-red-900 to-emerald-950 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Lock className="w-4 h-4" /> Informasi Dikecualikan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Informasi Dikecualikan</h1>
          <p className="text-red-100/90 text-sm md:text-base leading-relaxed">
            Daftar penetapan keputusan informasi yang bersifat rahasia dan dikecualikan berdasarkan pengujian konsekuensi UU KIP.
          </p>
        </div>
      </section>

      {/* Warning Box */}
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-800 flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs md:text-sm">
          <span className="font-bold block">Penting Mengenai Informasi Dikecualikan:</span>
          <p className="leading-relaxed">
            Dokumen yang tercantum dalam daftar ini adalah dokumen yang telah melalui uji konsekuensi (*consequence test*) sesuai Pasal 17 UU No. 14 Tahun 2008 dan tidak dapat dipublikasikan secara umum demi kerahasiaan negara / rahasia pribadi.
          </p>
        </div>
      </div>

      {/* Search & Document List */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-foreground">Daftar Berkas & SK Penetapan Dikecualikan ({dikecualikanDocs.length})</h2>
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari dokumen dikecualikan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {dikecualikanDocs.length > 0 ? (
            dikecualikanDocs.map((doc) => (
              <div key={doc.id} className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-red-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-red-500/10 text-red-700 shrink-0 mt-0.5">
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
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-800 active:scale-[0.98] transition-all shadow-xs shrink-0">
                  <Download className="w-4 h-4" />
                  <span>Unduh SK Penetapan</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-card border border-border/60 rounded-2xl text-muted-foreground text-sm">
              Belum ada dokumen penetapan informasi dikecualikan yang ditemukan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
