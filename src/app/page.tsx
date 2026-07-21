"use client";

import { 
  Search, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useInformasiPublikStore } from "@/lib/use-informasi-publik";
import { useDataInformasiStore } from "@/lib/use-data-informasi";

export default function HomePage() {
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<string | null>(null);
  const { docs } = useInformasiPublikStore();
  const { data: statData } = useDataInformasiStore();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setTrackingResult(`Status permohonan dengan ID "${trackingId}": SEDANG DIPROSES OLEH TIM PPID.`);
  };

  return (
    <div className="w-full space-y-16 pb-20">
      {/* 1. Hero Section Design Modern Goverment Portal */}
      <section className="relative bg-background border-b border-border/50 pt-10 pb-16 px-4 md:px-8 lg:px-12 overflow-hidden w-full">
        <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Branding */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#007144] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#007144]" />
              <span>Portal Pelayanan Informasi Publik Resmi</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
              PPID Kantor Kementerian Agama <br className="hidden md:inline" />
              <span className="text-[#007144]">Kabupaten Barito Utara</span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-3xl font-normal">
              Selamat datang di portal pelayanan informasi publik terpadu. Kami berkomitmen memberikan akses informasi yang akuntabel, transparan, dan mudah dijangkau oleh seluruh lapisan masyarakat sesuai UU No. 14 Tahun 2008.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link 
                href="/layanan-informasi"
                className="inline-flex items-center gap-2 bg-[#007144] text-white px-6 py-3.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span>Permohonan Informasi Online</span>
              </Link>

              <Link 
                href="/informasi-publik/berkala"
                className="inline-flex items-center gap-2 bg-accent/60 border border-border/80 text-foreground px-6 py-3.5 rounded-xl text-xs font-bold hover:bg-accent transition-all"
              >
                <FolderOpenIcon className="w-4 h-4 text-[#007144]" />
                <span>Lihat Katalog Dokumen</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Card / Visual Widget */}
          <div className="lg:col-span-5">
            <div className="p-6 md:p-8 rounded-3xl bg-card border border-border/70 shadow-xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-[#007144]">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Lacak Permohonan</h3>
                    <p className="text-[11px] text-muted-foreground">Cek status tiket permohonan Anda</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-[#007144] text-[10px] font-extrabold uppercase">
                  Layanan Real-time
                </span>
              </div>

              <form onSubmit={handleTrack} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Nomor Registrasi Tiket</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: REG-PPID-2026-0089"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-xs font-bold focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full h-11 bg-[#007144] text-white rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs"
                >
                  Cek Status Pemrosesan Tiket
                </button>
              </form>

              {trackingResult && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#007144] text-xs font-bold animate-in fade-in flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{trackingResult}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. Key Quick Access Grid Section */}
      <section className="px-4 md:px-8 lg:px-12 w-full">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
          <Link href="/informasi-publik/berkala" className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs hover:border-[#007144]/40 hover:shadow-md transition-all space-y-4 group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-[#007144] w-fit group-hover:bg-[#007144] group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground group-hover:text-[#007144] transition-colors">Informasi Berkala</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Rencana kerja, anggaran, & laporan kinerja berkala instansi.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#007144] pt-2">
              <span>Buka Dokumen</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/layanan-informasi/keberatan" className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs hover:border-[#007144]/40 hover:shadow-md transition-all space-y-4 group">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 w-fit group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground group-hover:text-amber-700 transition-colors">Pengajuan Keberatan</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Formulir sanggahan resmi bagi pemohon informasi publik.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-700 pt-2">
              <span>Formulir Keberatan</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/data-informasi" className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs hover:border-[#007144]/40 hover:shadow-md transition-all space-y-4 group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-[#007144] w-fit group-hover:bg-[#007144] group-hover:text-white transition-colors">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground group-hover:text-[#007144] transition-colors">Dashboard Data</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Visualisasi & statistik capaian sektor keagamaan.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#007144] pt-2">
              <span>Lihat Statistik</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/standar-layanan/sop" className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs hover:border-[#007144]/40 hover:shadow-md transition-all space-y-4 group">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-700 w-fit group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground group-hover:text-blue-700 transition-colors">SOP & Standar</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Standard Operating Procedure & Maklumat pelayanan.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-700 pt-2">
              <span>Unduh SOP</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Live Statistics Section */}
      <section className="px-4 md:px-8 lg:px-12 w-full">
        <div className="p-8 md:p-10 rounded-3xl bg-accent/30 border border-border/60 space-y-6 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">Statistik Capaian Layanan</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Indikator data sektoral keagamaan & permohonan informasi</p>
            </div>
            <Link href="/data-informasi" className="text-xs font-bold text-[#007144] hover:underline">
              Lihat Detail Dashboard Data
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {statData.statistik.map((st) => (
              <div key={st.id} className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">{st.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#007144]">{st.nilai}</span>
                  <span className="text-xs font-bold text-muted-foreground">{st.satuan}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{st.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Terbaru Berkas Dokumen Publik */}
      <section className="px-4 md:px-8 lg:px-12 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">Dokumen Publik Terbaru</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Arsip publikasi informasi berkala dan regulasi resmi PPID</p>
          </div>
          <Link href="/informasi-publik/berkala" className="text-xs font-bold text-[#007144] hover:underline">
            Semua Dokumen
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3 w-full">
          {docs.slice(0, 3).map((doc) => (
            <div key={doc.id} className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#007144]/40 transition-all">
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#007144]">
                  {doc.category}
                </span>
                <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{doc.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.keterangan}</p>
              </div>
              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{doc.date}</span>
                <span className="font-bold text-[#007144]">{doc.fileSize}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FolderOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.3 10H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7.9l1.2 1.6a2 2 0 0 0 1.6.8H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
