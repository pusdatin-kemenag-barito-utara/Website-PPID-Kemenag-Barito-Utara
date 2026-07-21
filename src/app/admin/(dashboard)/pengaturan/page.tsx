"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Sliders, Bell, Globe, Save, CheckCircle } from "lucide-react";

export default function AdminPengaturanPage() {
  const [siteName, setSiteName] = useState("PPID Kemenag Barito Utara");
  const [emailNotification, setEmailNotification] = useState(true);
  const [publicAccess, setPublicAccess] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#007144] text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" /> Konfigurasi Sistem
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Pengaturan Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pengaturan umum portal, preferensi notifikasi, dan keamanan sistem PPID.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-[#007144] p-4 rounded-xl text-sm font-semibold animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Pengaturan berhasil disimpan.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Site Config */}
          <Card className="shadow-xs border border-border/60">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-[#007144]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Identitas Situs</CardTitle>
                  <CardDescription className="text-xs">Informasi dasar nama dan instansi portal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Portal</label>
                <input 
                  type="text" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Kontak Utama</label>
                <input 
                  type="email" 
                  defaultValue="ppidkemenagbaritoutara@gmail.com" 
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-xs border border-border/60">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Notifikasi & Akses</CardTitle>
                  <CardDescription className="text-xs">Pengaturan pengiriman notifikasi permohonan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-accent/30">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold">Notifikasi Email</div>
                  <div className="text-xs text-muted-foreground">Kirim email pemberitahuan saat permohonan baru masuk</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotification} 
                  onChange={(e) => setEmailNotification(e.target.checked)}
                  className="h-5 w-5 rounded border-input text-[#007144] focus:ring-[#007144] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-accent/30">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold">Portal Terbuka Publik</div>
                  <div className="text-xs text-muted-foreground">Izinkan masyarakat mengajukan permohonan secara online</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={publicAccess} 
                  onChange={(e) => setPublicAccess(e.target.checked)}
                  className="h-5 w-5 rounded border-input text-[#007144] focus:ring-[#007144] cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#007144] text-white font-semibold text-sm hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
