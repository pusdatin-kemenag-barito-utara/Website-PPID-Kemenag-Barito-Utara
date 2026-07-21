"use client";

import { useProfilStore } from "@/lib/profil-store";
import { Award } from "lucide-react";

export default function TugasFungsiPage() {
  const { data } = useProfilStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner / Header Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Award className="w-4 h-4" /> Fungsi Organisasi
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Tugas & Fungsi PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Rincian tugas pokok dan fungsi operasional PPID Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Tugas Fungsi Grid */}
      <section className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {data.tugasFungsi.map((tf, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-card border border-border/60 shadow-xs flex items-start gap-4 hover:border-[#007144]/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-[#007144]/10 text-[#007144] font-extrabold flex items-center justify-center text-sm shrink-0">
                {idx + 1}
              </div>
              <p className="text-base font-semibold text-foreground leading-relaxed">{tf}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
