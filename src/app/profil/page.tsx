"use client";

import { useProfilStore } from "@/lib/profil-store";
import { UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProfilPPIDPage() {
  const { data } = useProfilStore();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner / Header Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <UserCheck className="w-4 h-4" /> Profil PPID
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Profil & Sejarah PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Gambaran umum dan landasan pembentukan PPID Kantor Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Main Content Card */}
      <section className="space-y-6">
        <div className="p-6 md:p-10 rounded-2xl bg-card border border-border/60 shadow-xs leading-relaxed text-base md:text-lg text-foreground space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#007144]">Sejarah & Latar Belakang PPID</h2>
          <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
            {data.sejarah}
          </p>
        </div>

        {/* Quick Nav Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          <Link href="/profil/pejabat" className="p-5 rounded-2xl bg-card border border-border/60 hover:border-[#007144]/40 hover:bg-emerald-500/5 transition-all group flex items-center justify-between">
            <span className="font-bold text-sm text-foreground group-hover:text-[#007144]">Profil Pejabat</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#007144] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/profil/visi-misi" className="p-5 rounded-2xl bg-card border border-border/60 hover:border-[#007144]/40 hover:bg-emerald-500/5 transition-all group flex items-center justify-between">
            <span className="font-bold text-sm text-foreground group-hover:text-[#007144]">Visi, Misi & Motto</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#007144] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/profil/tugas-fungsi" className="p-5 rounded-2xl bg-card border border-border/60 hover:border-[#007144]/40 hover:bg-emerald-500/5 transition-all group flex items-center justify-between">
            <span className="font-bold text-sm text-foreground group-hover:text-[#007144]">Tugas & Fungsi</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#007144] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/profil/struktur" className="p-5 rounded-2xl bg-card border border-border/60 hover:border-[#007144]/40 hover:bg-emerald-500/5 transition-all group flex items-center justify-between">
            <span className="font-bold text-sm text-foreground group-hover:text-[#007144]">Struktur Organisasi</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#007144] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
