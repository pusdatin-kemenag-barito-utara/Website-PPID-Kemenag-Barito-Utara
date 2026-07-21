"use client";

import { useProfilStore } from "@/lib/profil-store";
import { Users, UserCheck } from "lucide-react";

export default function ProfilPejabatPage() {
  const { data } = useProfilStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner / Header Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Users className="w-4 h-4" /> Profil Pejabat
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Profil Pejabat Pengelola PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Daftar pimpinan dan pejabat pengelola informasi dan dokumentasi di Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Main Pejabat Grid */}
      <section className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.pejabat.map((p, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-4 text-center flex flex-col items-center hover:border-[#007144]/40 transition-all">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-[#007144] border-2 border-[#007144]/20 flex items-center justify-center font-extrabold text-2xl shadow-xs">
                {p.nama ? p.nama.charAt(0) : <UserCheck className="w-8 h-8" />}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-lg text-foreground">{p.nama}</h3>
                <p className="text-xs font-bold text-[#007144]">{p.jabatan}</p>
                {p.nip && <p className="text-xs text-muted-foreground mt-2 font-medium">NIP. {p.nip}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
