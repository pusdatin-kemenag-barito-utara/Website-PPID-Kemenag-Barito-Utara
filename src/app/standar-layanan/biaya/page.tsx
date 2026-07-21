"use client";

import { useStandarLayananStore } from "@/lib/use-standar-layanan";
import { Receipt, CheckCircle2 } from "lucide-react";

export default function BiayaTarifPage() {
  const { data } = useStandarLayananStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Receipt className="w-4 h-4" /> Bebas Biaya
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Biaya & Tarif Pelayanan</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Ketentuan biaya pengajuan permohonan informasi publik (Gratis / Non Pungutan).
          </p>
        </div>
      </section>

      {/* Main Card */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#007144] font-extrabold text-lg text-center">
            BEBAS BIAYA (RP 0,-)
          </div>

          <div className="space-y-4">
            {data.biayaTarif.map((bt, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-accent/30 border border-border/40 flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#007144] shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-foreground leading-relaxed">{bt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
