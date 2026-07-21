"use client";

import { useDataInformasiStore } from "@/lib/use-data-informasi";
import { PieChart, Image as ImageIcon, Calendar, Tag, Download } from "lucide-react";

export default function InfografisKeagamaanPage() {
  const { data } = useDataInformasiStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-12">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <PieChart className="w-4 h-4" /> Sajian Data Visual
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Infografis Keagamaan</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Sajian grafik dan data visualisasi seputar layanan publik dan keagamaan di Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Dynamic Infografis Grid */}
      <section className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.infografis.map((info) => (
            <div key={info.id} className="rounded-3xl bg-card border border-border/60 shadow-xs overflow-hidden hover:border-[#007144]/40 transition-all flex flex-col justify-between group">
              {/* Graphic Placeholder */}
              <div className="h-48 bg-accent/40 border-b border-border/40 flex flex-col items-center justify-center p-6 text-center gap-2 group-hover:bg-emerald-500/5 transition-colors">
                <ImageIcon className="w-12 h-12 text-[#007144]/40 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-muted-foreground">{info.judul}</span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-muted-foreground">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-[#007144]">
                      <Tag className="w-3 h-3" />
                      {info.kategori}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {info.tanggal}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-foreground group-hover:text-[#007144] transition-colors leading-snug">
                    {info.judul}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {info.deskripsi}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/40">
                  <button className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#007144] text-[#007144] hover:bg-[#007144] hover:text-white text-xs font-bold transition-all">
                    <Download className="w-4 h-4" />
                    <span>Unduh Gambar Infografis</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
