"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { BarChart3, PieChart, Plus, Trash2, Save, CheckCircle2 } from "lucide-react";
import { useDataInformasiStore } from "@/lib/use-data-informasi";
import { DataStatistikItem, InfografisItem } from "@/lib/data-informasi-store";

export default function AdminDataInformasiPage() {
  const { data: storeData, updateData } = useDataInformasiStore();
  const [data, setData] = useState(storeData);
  const [activeTab, setActiveTab] = useState<"statistik" | "infografis">("statistik");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  // Add Handlers
  const handleAddStatistik = () => {
    const newStat: DataStatistikItem = {
      id: Date.now().toString(),
      label: "Indikator Baru",
      nilai: "0",
      satuan: "Unit",
      deskripsi: "Keterangan indikator",
      kategori: "Umum"
    };
    setData({ ...data, statistik: [...data.statistik, newStat] });
  };

  const handleRemoveStatistik = (id: string) => {
    setData({ ...data, statistik: data.statistik.filter(st => st.id !== id) });
  };

  const handleAddInfografis = () => {
    const newInfo: InfografisItem = {
      id: Date.now().toString(),
      judul: "Infografis Baru 2026",
      deskripsi: "Deskripsi infografis baru",
      kategori: "Keagamaan",
      tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    };
    setData({ ...data, infografis: [...data.infografis, newInfo] });
  };

  const handleRemoveInfografis = (id: string) => {
    setData({ ...data, infografis: data.infografis.filter(inf => inf.id !== id) });
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#007144] text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Pengelolaan Data & Visualisasi
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Data Informasi & Infografis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola statistik indikator utama dan sajian gambar infografis yang tampil di publik.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-[#007144] p-4 rounded-xl text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Data statistik & infografis berhasil diperbarui dan dipublikasikan!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab("statistik")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "statistik"
              ? "bg-[#007144] text-white shadow-xs"
              : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Indikator Statistik ({data.statistik.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("infografis")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "infografis"
              ? "bg-[#007144] text-white shadow-xs"
              : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Sajian Infografis ({data.infografis.length})</span>
        </button>
      </div>

      <Card className="shadow-xs border border-border/60">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Tab 1: Indikator Statistik */}
            {activeTab === "statistik" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daftar Indikator Statistik Publik</label>
                  <button 
                    type="button" 
                    onClick={handleAddStatistik}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007144] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Indikator Baru</span>
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {data.statistik.map((st, idx) => (
                    <div key={st.id} className="p-4 rounded-2xl border border-border/60 bg-accent/20 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#007144]">Indikator #{idx + 1}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveStatistik(st.id)}
                          className="p-1 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Nama Label</label>
                          <input 
                            type="text" 
                            value={st.label}
                            onChange={(e) => {
                              const newStat = [...data.statistik];
                              newStat[idx].label = e.target.value;
                              setData({ ...data, statistik: newStat });
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Kategori</label>
                          <input 
                            type="text" 
                            value={st.kategori}
                            onChange={(e) => {
                              const newStat = [...data.statistik];
                              newStat[idx].kategori = e.target.value;
                              setData({ ...data, statistik: newStat });
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Nilai / Angka</label>
                          <input 
                            type="text" 
                            value={st.nilai}
                            onChange={(e) => {
                              const newStat = [...data.statistik];
                              newStat[idx].nilai = e.target.value;
                              setData({ ...data, statistik: newStat });
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-extrabold text-[#007144]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Satuan</label>
                          <input 
                            type="text" 
                            value={st.satuan}
                            onChange={(e) => {
                              const newStat = [...data.statistik];
                              newStat[idx].satuan = e.target.value;
                              setData({ ...data, statistik: newStat });
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Deskripsi Singkat</label>
                        <input 
                          type="text" 
                          value={st.deskripsi}
                          onChange={(e) => {
                            const newStat = [...data.statistik];
                            newStat[idx].deskripsi = e.target.value;
                            setData({ ...data, statistik: newStat });
                          }}
                          className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Infografis */}
            {activeTab === "infografis" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daftar Sajian Infografis Gambar</label>
                  <button 
                    type="button" 
                    onClick={handleAddInfografis}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007144] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Infografis Baru</span>
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {data.infografis.map((inf, idx) => (
                    <div key={inf.id} className="p-4 rounded-2xl border border-border/60 bg-accent/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#007144]">Infografis #{idx + 1}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveInfografis(inf.id)}
                          className="p-1 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Judul Infografis</label>
                        <input 
                          type="text" 
                          value={inf.judul}
                          onChange={(e) => {
                            const newInfo = [...data.infografis];
                            newInfo[idx].judul = e.target.value;
                            setData({ ...data, infografis: newInfo });
                          }}
                          className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Kategori</label>
                          <input 
                            type="text" 
                            value={inf.kategori}
                            onChange={(e) => {
                              const newInfo = [...data.infografis];
                              newInfo[idx].kategori = e.target.value;
                              setData({ ...data, infografis: newInfo });
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Tanggal Publish</label>
                          <input 
                            type="text" 
                            value={inf.tanggal}
                            onChange={(e) => {
                              const newInfo = [...data.infografis];
                              newInfo[idx].tanggal = e.target.value;
                              setData({ ...data, infografis: newInfo });
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Deskripsi</label>
                        <textarea 
                          value={inf.deskripsi}
                          onChange={(e) => {
                            const newInfo = [...data.infografis];
                            newInfo[idx].deskripsi = e.target.value;
                            setData({ ...data, infografis: newInfo });
                          }}
                          className="w-full min-h-[60px] p-2.5 rounded-lg border border-input bg-background text-xs font-medium"
                        />
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
