"use client";

import { useStandarLayananStore } from "@/lib/use-standar-layanan";
import { Award } from "lucide-react";

export default function StandarPelayananPage() {
  const { data } = useStandarLayananStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Award className="w-4 h-4" /> Mutu Pelayanan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Standar Pelayanan PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Komponen tolok ukur standar pelayanan publik yang dipergunakan sebagai pedoman penyelenggaraan.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {data.komponenStandar.map((ks, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-card border border-border/60 shadow-xs flex items-start gap-4 hover:border-[#007144]/40 transition-all">
              <div className="w-8 h-8 rounded-full bg-[#007144]/10 text-[#007144] font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-sm font-semibold text-foreground leading-relaxed">{ks}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
