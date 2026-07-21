"use client";

import { useLayananInfoStore } from "@/lib/use-layanan-info";
import { FileCheck, Download, FileText, Search } from "lucide-react";
import { useState } from "react";

export default function SopLayananPage() {
  const { data } = useLayananInfoStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSop = data.sopList.filter(
    (s) => s.judul.toLowerCase().includes(searchQuery.toLowerCase()) || s.noSop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <FileCheck className="w-4 h-4" /> Standard Operating Procedure
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">SOP Layanan Informasi PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Standard Operating Procedure (SOP) resmi pengelolaan dan pelayanan informasi publik Kemenag Barito Utara.
          </p>
        </div>
      </section>

      {/* Main List */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-foreground">Daftar Dokumen SOP Layanan ({filteredSop.length})</h2>
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari SOP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredSop.map((sop) => (
            <div key={sop.id} className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#007144]/40 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-foreground leading-snug">{sop.judul}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    <span className="font-bold text-[#007144]">{sop.noSop}</span>
                    <span>•</span>
                    <span>Terbit: {sop.tglTerbit}</span>
                    <span>•</span>
                    <span>Ukuran: {sop.fileSize}</span>
                  </div>
                </div>
              </div>
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs shrink-0">
                <Download className="w-4 h-4" />
                <span>Unduh Dokumen SOP</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
