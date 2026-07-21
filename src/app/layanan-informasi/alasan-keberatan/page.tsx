"use client";

import { useLayananInfoStore } from "@/lib/use-layanan-info";
import { HelpCircle, CheckCircle2 } from "lucide-react";

export default function AlasanKeberatanPage() {
  const { data } = useLayananInfoStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <HelpCircle className="w-4 h-4" /> Ketentuan Keberatan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Alasan Pengajuan Keberatan</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Ketentuan dan syarat sah pengajuan keberatan permohonan informasi publik sesuai UU KIP.
          </p>
        </div>
      </section>

      {/* Main List */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-foreground">Kriteria Alasan Keberatan Sah</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Berdasarkan Pasal 35 UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik, Pemohon Informasi Publik berhak mengajukan keberatan secara tertulis kepada Atasan PPID berdasarkan alasan-alasan berikut:
          </p>

          <div className="grid gap-4">
            {data.alasanKeberatan.map((ak, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-accent/30 border border-border/40 flex items-start gap-4 hover:border-[#007144]/40 transition-all">
                <CheckCircle2 className="w-6 h-6 text-[#007144] shrink-0 mt-0.5" />
                <p className="text-sm md:text-base font-semibold text-foreground leading-relaxed">{ak}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
