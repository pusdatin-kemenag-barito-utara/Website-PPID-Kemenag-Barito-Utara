"use client";

import { useDataInformasiStore } from "@/lib/use-data-informasi";
import { BarChart3, PieChart, Layers } from "lucide-react";
import Link from "next/link";

export default function DashboardDataPage() {
  const { data } = useDataInformasiStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-12">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <BarChart3 className="w-4 h-4" /> Visualisasi & Statistik
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Dashboard Data Informasi</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Statistik terpadu dan indikator capaian sektor keagamaan & layanan publik Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Dynamic Statistics Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-[#007144]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Indikator Data Utama</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Dikelola dan diperbarui secara dinamis via Panel Admin</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.statistik.map((st) => (
            <div key={st.id} className="p-6 rounded-3xl bg-card border border-border/60 shadow-xs space-y-4 hover:border-[#007144]/40 transition-all flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#007144] mb-3">
                  {st.kategori}
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{st.label}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold tracking-tight text-[#007144]">{st.nilai}</span>
                  <span className="text-xs font-bold text-muted-foreground">{st.satuan}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40 mt-3">
                {st.deskripsi}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Link to Infografis */}
      <section className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-extrabold text-foreground">Lihat Sajian Infografis Keagamaan</h3>
          <p className="text-sm text-muted-foreground">Temukan penyajian data visual dan sajian gambar infografis menarik seputar keagamaan.</p>
        </div>
        <Link 
          href="/data-informasi/infografis" 
          className="inline-flex items-center gap-2 bg-[#007144] text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all shrink-0"
        >
          <PieChart className="w-4 h-4" />
          <span>Buka Infografis</span>
        </Link>
      </section>
    </div>
  );
}
