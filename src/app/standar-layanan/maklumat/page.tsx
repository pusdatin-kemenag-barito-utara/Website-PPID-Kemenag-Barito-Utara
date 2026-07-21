"use client";

import { useStandarLayananStore } from "@/lib/use-standar-layanan";
import { Scroll, Award, CheckCircle2 } from "lucide-react";

export default function MaklumatPelayananPage() {
  const { data } = useStandarLayananStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Scroll className="w-4 h-4" /> Maklumat Pelayanan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Maklumat Pelayanan PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Pernyataan komitmen dan sanggup melaksanakan pelayanan informasi publik sesuai standar.
          </p>
        </div>
      </section>

      {/* Main Maklumat Card */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 md:p-12 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-[#007144] flex items-center justify-center mx-auto border border-[#007144]/20">
            <Award className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground uppercase">MAKLUMAT PELAYANAN</h2>
          
          <div className="p-6 md:p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-base md:text-lg font-semibold text-foreground leading-relaxed italic">
            &quot;{data.maklumat}&quot;
          </div>

          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#007144]" />
            <span>Ditetapkan oleh Kepala Kantor Kementerian Agama Kabupaten Barito Utara</span>
          </div>
        </div>
      </section>
    </div>
  );
}
