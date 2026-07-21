"use client";

import { useLayananInfoStore } from "@/lib/use-layanan-info";
import { AlertTriangle, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function PengajuanKeberatanPage() {
  const { data } = useLayananInfoStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    noTiketPermohonan: "",
    alasan: data.alasanKeberatan[0] || "",
    penjelasan: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-amber-800 to-emerald-950 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <AlertTriangle className="w-4 h-4" /> Formulir Keberatan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Pengajuan Keberatan Informasi</h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed">
            Formulir resmi pengajuan keberatan atas permohonan informasi publik yang tidak dipenuhi / tidak sesuai.
          </p>
        </div>
      </section>

      {/* Main Form Card */}
      <section className="max-w-4xl mx-auto space-y-6">
        {submitted ? (
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-[#007144] space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#007144] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold">Formulir Keberatan Berhasil Dikirim!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Pengajuan keberatan Anda telah terdaftar dan akan segera ditinjau oleh Atasan PPID Kemenag Barito Utara dalam waktu maksimal 30 hari kerja.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-[#007144] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935]"
            >
              Kirim Pengajuan Lain
            </button>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap Pemohon</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Sesuai KTP..."
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">NIK / Nomor Identitas</label>
                  <input 
                    type="text" 
                    required
                    placeholder="16 digit NIK..."
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor Pendaftaran Permohonan Informasi</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: REG-PPID-2026-0089"
                  value={formData.noTiketPermohonan}
                  onChange={(e) => setFormData({ ...formData, noTiketPermohonan: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alasan Keberatan</label>
                <select 
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                >
                  {data.alasanKeberatan.map((ak, idx) => (
                    <option key={idx} value={ak}>{ak}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Penjelasan / Keterangan Tambahan</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Jelaskan detail kasus atau tanggapan yang tidak sesuai..."
                  value={formData.penjelasan}
                  onChange={(e) => setFormData({ ...formData, penjelasan: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                />
              </div>

              <div className="pt-3">
                <button 
                  type="submit" 
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#007144] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Formulir Keberatan</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
