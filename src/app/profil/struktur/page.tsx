"use client";

import { GitFork } from "lucide-react";

export default function StrukturPage() {
  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner / Header Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <GitFork className="w-4 h-4" /> Bagan Organisasi
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Struktur Organisasi PPID</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Bagan struktur hirarki dan koordinasi PPID Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Main Structure Chart Box */}
      <section className="space-y-6">
        <div className="p-8 md:p-12 rounded-3xl bg-card border border-border/60 shadow-xs text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="font-extrabold text-2xl text-foreground">Bagan Struktur Pengelola Informasi & Dokumentasi</h2>
            <p className="text-sm text-muted-foreground">Bagan resmi susunan penanggung jawab, koordinator, dan tim pelaksana PPID</p>
          </div>

          <div className="p-16 rounded-2xl bg-accent/30 border border-dashed border-border/70 flex flex-col items-center justify-center gap-4">
            <GitFork className="w-20 h-20 text-[#007144]/40" />
            <div className="space-y-1">
              <span className="text-sm font-bold text-foreground block">Bagan Grafik Struktur Organisasi PPID</span>
              <span className="text-xs text-muted-foreground block">Kantor Kementerian Agama Kabupaten Barito Utara</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
