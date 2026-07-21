"use client";

import { useStandarLayananStore } from "@/lib/use-standar-layanan";
import { CalendarDays, Clock } from "lucide-react";

export default function JadwalPelayananPage() {
  const { data } = useStandarLayananStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <CalendarDays className="w-4 h-4" /> Waktu Operasional
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Jadwal Pelayanan Informasi</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Rincian hari dan jam operasional Meja Pelayanan Informasi PPID Kemenag Barito Utara.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {data.jadwal.map((j, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-card border border-border/60 shadow-xs space-y-4 text-center hover:border-[#007144]/40 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#007144] flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-foreground">{j.hari}</h3>
              </div>

              <div className="space-y-1 pt-3 border-t border-border/40">
                <div className="text-sm font-extrabold text-[#007144]">{j.jam}</div>
                <div className="text-xs text-muted-foreground">Istirahat: {j.istirahat}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
