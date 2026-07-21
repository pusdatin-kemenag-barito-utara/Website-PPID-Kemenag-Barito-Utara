"use client";

import { useLayananInfoStore } from "@/lib/use-layanan-info";
import { Gavel, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PengajuanSengketaPage() {
  const { data } = useLayananInfoStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Gavel className="w-4 h-4" /> Penyelesaian Sengketa
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Prosedur Pengajuan Sengketa</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Tahapan dan tatacara penyelesaian sengketa informasi publik melalui Komisi Informasi.
          </p>
        </div>
      </section>

      {/* Main Steps */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-foreground">Tahapan Penyelesaian Sengketa Informasi</h2>
          <div className="space-y-4">
            {data.prosedurSengketa.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-accent/30 border border-border/40 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#007144] text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-muted-foreground text-center sm:text-left">
            Belum mengajukan keberatan ke Atasan PPID? Silakan ajukan keberatan terlebih dahulu.
          </span>
          <Link href="/layanan-informasi/keberatan" className="inline-flex items-center gap-2 bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shrink-0">
            <span>Ajukan Keberatan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
