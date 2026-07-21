"use client";

import { FileCheck2, Send, CheckCircle2, Printer } from "lucide-react";
import { useState } from "react";
import { PdfTicketModal } from "@/components/ui/pdf-ticket-modal";

export default function PermohonanInformasiPage() {
  const [submitted, setSubmitted] = useState(false);
  const [regNumber, setRegNumber] = useState("");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    email: "",
    phone: "",
    pekerjaan: "",
    alamat: "",
    rincian: "",
    tujuan: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedTicket = `REG-PPID-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    setRegNumber(generatedTicket);
    setSubmitted(true);
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <FileCheck2 className="w-4 h-4" /> Permohonan Online
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Permohonan Informasi Publik</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Formulir resmi pengajuan permohonan informasi publik secara online pada PPID Kemenag Barito Utara.
          </p>
        </div>
      </section>

      {/* Form Card */}
      <section className="max-w-4xl mx-auto space-y-6">
        {submitted ? (
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-[#007144] space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#007144] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold">Permohonan Berhasil Terkirim!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Nomor Registrasi Anda: <strong className="text-[#007144]">{regNumber}</strong>. Permohonan akan diproses maksimal dalam 10 hari kerja.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={() => setIsPdfModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#007144] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Download Tiket PDF</span>
              </button>
              <button 
                onClick={() => setSubmitted(false)}
                className="border border-input bg-card px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent"
              >
                Buat Permohonan Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap</label>
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
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">NIK / KTP</label>
                  <input 
                    type="text" 
                    required
                    placeholder="16 Digit NIK..."
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="email@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">No. HP / WhatsApp</label>
                  <input 
                    type="text" 
                    required
                    placeholder="0812xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rincian Informasi Yang Dibutuhkan</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Jelaskan secara spesifik rincian informasi publik yang diminta..."
                  value={formData.rincian}
                  onChange={(e) => setFormData({ ...formData, rincian: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tujuan Penggunaan Informasi</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Sebutkan tujuan penggunaan informasi..."
                  value={formData.tujuan}
                  onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-end">
                <button 
                  type="submit" 
                  className="inline-flex items-center gap-2 bg-[#007144] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Permohonan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Modal Ticket PDF */}
      <PdfTicketModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        ticketData={{
          tiketId: regNumber,
          namaPemohon: formData.nama || "Masyarakat Umum",
          nik: formData.nik || "6205010000000000",
          rincianInformasi: formData.rincian || "Permohonan Berkas Publik PPID",
          tglPengajuan: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          status: "Menunggu Verifikasi"
        }}
      />
    </div>
  );
}
