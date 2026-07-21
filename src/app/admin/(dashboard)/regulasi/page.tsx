"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Scroll, Plus, Trash2, Download, Search, CheckCircle2, X, FileText } from "lucide-react";
import { useRegulasiStore } from "@/lib/use-regulasi";
import { RegulasiItem } from "@/lib/regulasi-store";

export default function AdminRegulasiPage() {
  const { items, updateItems } = useRegulasiStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const [nomor, setNomor] = useState("");
  const [tahun, setTahun] = useState("2026");
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState<RegulasiItem["kategori"]>("Keputusan Menteri");
  const [keterangan, setKeterangan] = useState("");

  const handleAddRegulasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !nomor) return;

    const newItem: RegulasiItem = {
      id: Date.now().toString(),
      nomor,
      tahun,
      judul,
      kategori,
      tglTerbit: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      fileSize: "1.8 MB",
      keterangan: keterangan || "Dokumen regulasi resmi Kemenag."
    };

    updateItems([newItem, ...items]);
    setNomor("");
    setJudul("");
    setKeterangan("");
    setIsModalOpen(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleDelete = (id: string) => {
    updateItems(items.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => 
    item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header Tier */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#007144] text-xs font-bold uppercase tracking-wider mb-2">
            <Scroll className="w-3.5 h-3.5" /> Management Payung Hukum
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Regulasi & SK PPID</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola arsip peraturan, undang-undang, PMA, KMA, dan SK PPID yang terbit di publik.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Regulasi Baru</span>
        </button>
      </div>

      {isSaved && (
        <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-[#007144] p-4 rounded-xl text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Regulasi berhasil disimpan & disinkronkan ke halaman publik!</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cari nomor atau judul regulasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-xs border border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-accent/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-6">Nomor & Judul Regulasi</th>
                  <th className="py-3.5 px-6">Kategori</th>
                  <th className="py-3.5 px-6">Tgl Terbit</th>
                  <th className="py-3.5 px-6">Ukuran</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs font-medium">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-accent/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-[#007144] shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-[#007144] block">{item.nomor}</span>
                            <span className="font-semibold text-foreground block text-xs mt-0.5">{item.judul}</span>
                            {item.keterangan && <span className="text-[11px] text-muted-foreground block mt-1">{item.keterangan}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#007144]">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">{item.tglTerbit}</td>
                      <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">{item.fileSize}</td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors" title="Unduh">
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      Tidak ada regulasi yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Tambah Regulasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-lg font-extrabold text-foreground">Tambah Dokumen Regulasi / SK</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRegulasi} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor Peraturan / SK</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: UU No. 14 Tahun 2008"
                    value={nomor}
                    onChange={(e) => setNomor(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tahun</label>
                  <input 
                    type="text" 
                    required
                    placeholder="2026"
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori Regulasi</label>
                <select 
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as RegulasiItem["kategori"])}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                >
                  <option value="Undang-Undang">Undang-Undang</option>
                  <option value="Peraturan Pemerintah">Peraturan Pemerintah</option>
                  <option value="Peraturan Menteri">Peraturan Menteri</option>
                  <option value="Keputusan Menteri">Keputusan Menteri</option>
                  <option value="SK Kepala Kantor">SK Kepala Kantor</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Judul Lengkap Peraturan</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Judul lengkap undang-undang atau SK..."
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Keterangan Ringkas</label>
                <input 
                  type="text" 
                  placeholder="Ringkasan penjelasan isi peraturan..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-accent"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-[#007144] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] shadow-xs"
                >
                  Simpan & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
