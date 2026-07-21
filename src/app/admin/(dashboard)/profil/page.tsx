"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Save, CheckCircle2, FileText, Target, Building, Users, Award, Plus, Trash2 } from "lucide-react";
import { useProfilStore } from "@/lib/profil-store";
import { ProfilData } from "@/lib/profil-data";

export default function AdminProfilPage() {
  const { data: storeData, updateData } = useProfilStore();
  const [data, setData] = useState<ProfilData>(storeData);
  const [activeTab, setActiveTab] = useState<"sejarah" | "visi-misi" | "tugas" | "pejabat">("sejarah");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleAddMisi = () => {
    setData({ ...data, misi: [...data.misi, ""] });
  };

  const handleRemoveMisi = (index: number) => {
    const newMisi = data.misi.filter((_: string, i: number) => i !== index);
    setData({ ...data, misi: newMisi });
  };

  const handleMisiChange = (index: number, val: string) => {
    const newMisi = [...data.misi];
    newMisi[index] = val;
    setData({ ...data, misi: newMisi });
  };

  const handleAddTugas = () => {
    setData({ ...data, tugasFungsi: [...data.tugasFungsi, ""] });
  };

  const handleRemoveTugas = (index: number) => {
    const newTf = data.tugasFungsi.filter((_: string, i: number) => i !== index);
    setData({ ...data, tugasFungsi: newTf });
  };

  const handleAddPejabat = () => {
    setData({
      ...data,
      pejabat: [...data.pejabat, { nama: "", jabatan: "", nip: "" }]
    });
  };

  const handleRemovePejabat = (index: number) => {
    const newPejabat = data.pejabat.filter((_: { nama: string; jabatan: string; nip: string }, i: number) => i !== index);
    setData({ ...data, pejabat: newPejabat });
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#007144] text-xs font-bold uppercase tracking-wider mb-2">
            <Building className="w-3.5 h-3.5" /> Pengelolaan Profil Dinamis
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Kelola Profil Instansi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Setiap perubahan data di sini akan **secara otomatis langsung memperbarui** seluruh sub-menu profil publik.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-[#007144] p-4 rounded-xl text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Profil berhasil disimpan! Seluruh halaman sub-menu profil publik telah ter-update secara otomatis.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/50 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("sejarah")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "sejarah"
              ? "bg-[#007144] text-white shadow-xs"
              : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Profil & Sejarah PPID</span>
        </button>

        <button
          onClick={() => setActiveTab("visi-misi")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "visi-misi"
              ? "bg-[#007144] text-white shadow-xs"
              : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Visi, Misi & Motto</span>
        </button>

        <button
          onClick={() => setActiveTab("tugas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "tugas"
              ? "bg-[#007144] text-white shadow-xs"
              : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Tugas & Fungsi</span>
        </button>

        <button
          onClick={() => setActiveTab("pejabat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "pejabat"
              ? "bg-[#007144] text-white shadow-xs"
              : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Profil Pejabat</span>
        </button>
      </div>

      <Card className="shadow-xs border border-border/60">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Tab 1: Sejarah / Profil PPID */}
            {activeTab === "sejarah" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sejarah Singkat & Gambaran PPID</label>
                  <textarea 
                    className="w-full min-h-[180px] p-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all leading-relaxed"
                    value={data.sejarah}
                    onChange={(e) => setData({ ...data, sejarah: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Visi Misi Motto */}
            {activeTab === "visi-misi" && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visi Utama</label>
                  <textarea 
                    className="w-full min-h-[90px] p-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all leading-relaxed"
                    value={data.visi}
                    onChange={(e) => setData({ ...data, visi: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Misi Layanan (Poin Per Poin)</label>
                    <button 
                      type="button"
                      onClick={handleAddMisi}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#007144] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Poin Misi</span>
                    </button>
                  </div>

                  {data.misi.map((m: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={m}
                        onChange={(e) => handleMisiChange(idx, e.target.value)}
                        className="flex-1 h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveMisi(idx)}
                        className="p-2.5 rounded-xl text-red-600 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Motto Pelayanan</label>
                  <input 
                    type="text"
                    value={data.motto}
                    onChange={(e) => setData({ ...data, motto: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Tugas & Fungsi */}
            {activeTab === "tugas" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poin-poin Tugas & Fungsi Operasional PPID</label>
                  <button 
                    type="button"
                    onClick={handleAddTugas}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#007144] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tugas & Fungsi</span>
                  </button>
                </div>
                {data.tugasFungsi.map((tf: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={tf}
                      onChange={(e) => {
                        const newTf = [...data.tugasFungsi];
                        newTf[idx] = e.target.value;
                        setData({ ...data, tugasFungsi: newTf });
                      }}
                      className="flex-1 h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTugas(idx)}
                      className="p-2.5 rounded-xl text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Profil Pejabat */}
            {activeTab === "pejabat" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daftar Pejabat Pengelola PPID</label>
                  <button 
                    type="button"
                    onClick={handleAddPejabat}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#007144] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Pejabat</span>
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {data.pejabat.map((p: { nama: string; jabatan: string; nip: string }, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/60 bg-accent/20 space-y-3 relative group">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">Nama Pejabat</label>
                        <input 
                          type="text"
                          value={p.nama}
                          onChange={(e) => {
                            const newPejabat = [...data.pejabat];
                            newPejabat[idx].nama = e.target.value;
                            setData({ ...data, pejabat: newPejabat });
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">Jabatan</label>
                        <input 
                          type="text"
                          value={p.jabatan}
                          onChange={(e) => {
                            const newPejabat = [...data.pejabat];
                            newPejabat[idx].jabatan = e.target.value;
                            setData({ ...data, pejabat: newPejabat });
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">NIP</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={p.nip}
                            onChange={(e) => {
                              const newPejabat = [...data.pejabat];
                              newPejabat[idx].nip = e.target.value;
                              setData({ ...data, pejabat: newPejabat });
                            }}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemovePejabat(idx)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-border/40 pt-4">
              <button 
                type="submit" 
                className="inline-flex items-center gap-2 bg-[#007144] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Publikasikan</span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
