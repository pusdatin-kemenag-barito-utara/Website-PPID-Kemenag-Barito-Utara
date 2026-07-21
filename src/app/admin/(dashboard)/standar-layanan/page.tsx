"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Award, Scroll, CalendarDays, Receipt, Compass, Workflow, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useStandarLayananStore } from "@/lib/use-standar-layanan";

type StandarTab = "maklumat" | "jadwal" | "biaya" | "standar" | "kebijakan" | "strategi";

export default function AdminStandarLayananPage() {
  const { data: storeData, updateData } = useStandarLayananStore();
  const [data, setData] = useState(storeData);
  const [activeTab, setActiveTab] = useState<StandarTab>("maklumat");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header Tier */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#007144] text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" /> Pengelolaan Standar Mutu
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Standar Layanan PPID</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola konten 6 submenu standar layanan (Maklumat, Jadwal, Biaya, Standar, Arah Kebijakan, & Strategi).
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-[#007144] p-4 rounded-xl text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Pengaturan Standar Layanan berhasil disimpan & disinkronkan langsung ke publik!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/50 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "maklumat", label: "Maklumat", icon: Scroll },
          { id: "jadwal", label: "Jadwal", icon: CalendarDays },
          { id: "biaya", label: "Biaya / Tarif", icon: Receipt },
          { id: "standar", label: "Komponen Standar", icon: Award },
          { id: "kebijakan", label: "Arah Kebijakan", icon: Compass },
          { id: "strategi", label: "Strategi & PPEM", icon: Workflow },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StandarTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#007144] text-white shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Card className="shadow-xs border border-border/60">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Tab 1: Maklumat */}
            {activeTab === "maklumat" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teks Pernyataan Maklumat Pelayanan</label>
                  <textarea 
                    className="w-full min-h-[140px] p-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all leading-relaxed"
                    value={data.maklumat}
                    onChange={(e) => setData({ ...data, maklumat: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Jadwal */}
            {activeTab === "jadwal" && (
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daftar Waktu Operasional Layanan</label>
                {data.jadwal.map((j: { hari: string; jam: string; istirahat: string }, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 gap-3 p-3 rounded-xl border border-border/60 bg-accent/20">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Hari</label>
                      <input 
                        type="text"
                        value={j.hari}
                        onChange={(e) => {
                          const newJadwal = [...data.jadwal];
                          newJadwal[idx].hari = e.target.value;
                          setData({ ...data, jadwal: newJadwal });
                        }}
                        className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Jam Layanan</label>
                      <input 
                        type="text"
                        value={j.jam}
                        onChange={(e) => {
                          const newJadwal = [...data.jadwal];
                          newJadwal[idx].jam = e.target.value;
                          setData({ ...data, jadwal: newJadwal });
                        }}
                        className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Jam Istirahat</label>
                      <input 
                        type="text"
                        value={j.istirahat}
                        onChange={(e) => {
                          const newJadwal = [...data.jadwal];
                          newJadwal[idx].istirahat = e.target.value;
                          setData({ ...data, jadwal: newJadwal });
                        }}
                        className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Biaya Tarif */}
            {activeTab === "biaya" && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ketentuan Biaya & Pungutan Tarif</label>
                {data.biayaTarif.map((bt: string, idx: number) => (
                  <input 
                    key={idx}
                    type="text"
                    value={bt}
                    onChange={(e) => {
                      const newBt = [...data.biayaTarif];
                      newBt[idx] = e.target.value;
                      setData({ ...data, biayaTarif: newBt });
                    }}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                ))}
              </div>
            )}

            {/* Tab 4: Komponen Standar */}
            {activeTab === "standar" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Komponen Standar Pelayanan</label>
                  <button 
                    type="button" 
                    onClick={() => setData({ ...data, komponenStandar: [...data.komponenStandar, ""] })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#007144] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Komponen</span>
                  </button>
                </div>
                {data.komponenStandar.map((ks: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={ks}
                      onChange={(e) => {
                        const newKs = [...data.komponenStandar];
                        newKs[idx] = e.target.value;
                        setData({ ...data, komponenStandar: newKs });
                      }}
                      className="flex-1 h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => setData({ ...data, komponenStandar: data.komponenStandar.filter((_: string, i: number) => i !== idx) })}
                      className="p-2.5 rounded-xl text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Arah Kebijakan */}
            {activeTab === "kebijakan" && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poin-poin Arah Kebijakan Strategis</label>
                {data.arahKebijakan.map((ak: string, idx: number) => (
                  <input 
                    key={idx}
                    type="text"
                    value={ak}
                    onChange={(e) => {
                      const newAk = [...data.arahKebijakan];
                      newAk[idx] = e.target.value;
                      setData({ ...data, arahKebijakan: newAk });
                    }}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                ))}
              </div>
            )}

            {/* Tab 6: Strategi PPEM */}
            {activeTab === "strategi" && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poin-poin Strategi & Metode Pengelolaan PPEM</label>
                {data.strategiMetode.map((sm: string, idx: number) => (
                  <input 
                    key={idx}
                    type="text"
                    value={sm}
                    onChange={(e) => {
                      const newSm = [...data.strategiMetode];
                      newSm[idx] = e.target.value;
                      setData({ ...data, strategiMetode: newSm });
                    }}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                  />
                ))}
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
