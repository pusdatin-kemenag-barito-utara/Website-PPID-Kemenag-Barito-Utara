"use client";

import { useStandarLayananStore } from "@/lib/use-standar-layanan";
import { Compass, CheckCircle2 } from "lucide-react";

export default function ArahKebijakanPage() {
  const { data } = useStandarLayananStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Compass className="w-4 h-4" /> Arah Kebijakan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Arah Kebijakan PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Pedoman dan arah kebijakan strategis keterbukaan informasi publik Kemenag Barito Utara.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-foreground">Fokus Arah Kebijakan Strategis</h2>
          <div className="space-y-4">
            {data.arahKebijakan.map((ak, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-accent/30 border border-border/40 flex items-start gap-4">
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
