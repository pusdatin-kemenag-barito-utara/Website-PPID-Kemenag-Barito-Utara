"use client";

import { useProfilStore } from "@/lib/profil-store";
import { Target, CheckCircle2 } from "lucide-react";

export default function VisiMisiPage() {
  const { data } = useProfilStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner / Header Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Target className="w-4 h-4" /> Landasan Pelayanan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Visi, Misi & Motto PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Pedoman dan komitmen pelayanan informasi publik Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Visi Misi Content */}
      <section className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Visi Card */}
          <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
            <h3 className="text-sm font-extrabold text-[#007144] uppercase tracking-wider">Visi Utama Layanan</h3>
            <p className="text-xl font-extrabold text-foreground leading-relaxed italic">
              &quot;{data.visi}&quot;
            </p>
          </div>

          {/* Motto Card */}
          <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4">
            <h3 className="text-sm font-extrabold text-amber-700 uppercase tracking-wider">Motto Pelayanan</h3>
            <p className="text-xl font-extrabold text-foreground leading-relaxed italic">
              &quot;{data.motto}&quot;
            </p>
          </div>
        </div>

        {/* Misi List Card */}
        <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
          <h3 className="text-xl font-extrabold text-foreground">Misi Pelayanan Informasi Publik</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {data.misi.map((m, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-accent/30 border border-border/40">
                <CheckCircle2 className="w-6 h-6 text-[#007144] shrink-0 mt-0.5" />
                <span className="text-base font-semibold text-foreground leading-relaxed">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
