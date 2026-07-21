"use client";

import { useLayananInfoStore } from "@/lib/use-layanan-info";
import { MessageSquareWarning, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function PengaduanMasyarakatPage() {
  const { data } = useLayananInfoStore();
  const [submitted, setSubmitted] = useState(false);
  const [pengaduan, setPengaduan] = useState({ nama: "", email: "", whatsapp: "", pesan: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-10 space-y-10">
      {/* Banner Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#007144] to-emerald-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <MessageSquareWarning className="w-4 h-4" /> Pengaduan & Aspirasi
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Pengaduan Masyarakat</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Kanal aspirasi resmi dan pengaduan kualitas pelayanan Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
        {/* Contact info card */}
        <div className="space-y-4 md:col-span-1">
          <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
            <h3 className="font-extrabold text-base text-foreground">Kontak Pengaduan Resmi</h3>
            
            <div className="space-y-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#007144] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-foreground block">Email</span>
                  <span>{data.kontakPengaduan.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#007144] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-foreground block">Telepon Kantor</span>
                  <span>{data.kontakPengaduan.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#007144] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-foreground block">Alamat Kantor</span>
                  <span>{data.kontakPengaduan.alamat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-[#007144] space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#007144] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold">Aspirasi Berhasil Dikirim!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Terima kasih atas masukan dan pengaduan Anda. Tim pengelola pengaduan PPID akan memproses pesan Anda.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-[#007144] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935]"
              >
                Kirim Pengaduan Baru
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-xs space-y-6">
              <h3 className="font-extrabold text-lg text-foreground">Formulir Pengaduan Online</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap</label>
                  <input 
                    type="text"
                    required
                    placeholder="Nama pengadu..."
                    value={pengaduan.nama}
                    onChange={(e) => setPengaduan({ ...pengaduan, nama: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alamat Email</label>
                    <input 
                      type="email"
                      required
                      placeholder="email@domain.com"
                      value={pengaduan.email}
                      onChange={(e) => setPengaduan({ ...pengaduan, email: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">No. WhatsApp</label>
                    <input 
                      type="text"
                      placeholder="0812xxxx"
                      value={pengaduan.whatsapp}
                      onChange={(e) => setPengaduan({ ...pengaduan, whatsapp: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rincian Pengaduan / Aspirasi</label>
                  <textarea 
                    rows={5}
                    required
                    placeholder="Tuliskan keluhan atau masukan Anda..."
                    value={pengaduan.pesan}
                    onChange={(e) => setPengaduan({ ...pengaduan, pesan: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#007144] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Pengaduan</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
