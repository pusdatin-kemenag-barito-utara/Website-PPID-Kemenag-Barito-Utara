"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Plus, FileText, Search, Trash2, Download, FolderOpen, X, CheckCircle2, Calendar, AlertCircle, Clock, Lock } from "lucide-react";
import { useInformasiPublikStore } from "@/lib/use-informasi-publik";
import { InformasiPublikDoc } from "@/lib/informasi-publik-store";

export default function AdminInformasiPublikPage() {
  const { docs, updateDocs } = useInformasiPublikStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [isSaved, setIsSaved] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<InformasiPublikDoc["category"]>("Berkala");
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newDoc: InformasiPublikDoc = {
      id: Date.now().toString(),
      title,
      category,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "1.5 MB",
      keterangan: keterangan || "Dokumen resmi PPID Kemenag Barito Utara."
    };

    updateDocs([newDoc, ...docs]);
    setTitle("");
    setKeterangan("");
    setFile(null);
    setIsModalOpen(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDelete = (id: string) => {
    updateDocs(docs.filter(doc => doc.id !== id));
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "Semua" || doc.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header Tier */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#007144] text-xs font-bold uppercase tracking-wider mb-2">
            <FolderOpen className="w-3.5 h-3.5" /> Manajemen Berkas Publik
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Informasi Publik & Regulasi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola dokumen untuk 4 submenu (Informasi Berkala, Serta Merta, Setiap Saat, & Dikecualikan).
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#007144] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005935] active:scale-[0.98] transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Dokumen Baru</span>
        </button>
      </div>

      {isSaved && (
        <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-[#007144] p-4 rounded-xl text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Dokumen berhasil ditambahkan & disinkronkan langsung ke sub-menu publik!</span>
        </div>
      )}

      {/* Filter Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {["Semua", "Berkala", "Serta Merta", "Setiap Saat", "Dikecualikan"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterCategory === cat
                  ? "bg-[#007144] text-white shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cari nama dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
          />
        </div>
      </div>

      {/* Documents Table / Grid */}
      <Card className="shadow-xs border border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-accent/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-6">Judul Dokumen</th>
                  <th className="py-3.5 px-6">Kategori</th>
                  <th className="py-3.5 px-6">Tgl Unggah</th>
                  <th className="py-3.5 px-6">Ukuran</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs font-medium">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-accent/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-[#007144] shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{doc.title}</span>
                            {doc.keterangan && <span className="text-[11px] text-muted-foreground block mt-0.5">{doc.keterangan}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          doc.category === "Berkala" ? "bg-emerald-500/15 text-[#007144]" :
                          doc.category === "Serta Merta" ? "bg-amber-500/15 text-amber-700" :
                          doc.category === "Setiap Saat" ? "bg-blue-500/15 text-blue-700" :
                          "bg-red-500/15 text-red-700"
                        }`}>
                          {doc.category === "Berkala" && <Calendar className="w-3 h-3" />}
                          {doc.category === "Serta Merta" && <AlertCircle className="w-3 h-3" />}
                          {doc.category === "Setiap Saat" && <Clock className="w-3 h-3" />}
                          {doc.category === "Dikecualikan" && <Lock className="w-3 h-3" />}
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">{doc.date}</td>
                      <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">{doc.fileSize}</td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors" title="Unduh">
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(doc.id)} 
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
                      Tidak ada dokumen yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Upload Dokumen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-lg font-extrabold text-foreground">Upload Dokumen Informasi Publik</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Judul Dokumen</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masukkan judul dokumen resmi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori Informasi</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as InformasiPublikDoc["category"])}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
                >
                  <option value="Berkala">Informasi Berkala</option>
                  <option value="Serta Merta">Informasi Serta Merta</option>
                  <option value="Setiap Saat">Informasi Setiap Saat</option>
                  <option value="Dikecualikan">Informasi Dikecualikan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Keterangan Ringkas</label>
                <input 
                  type="text" 
                  placeholder="Ringkasan singkat isi berkas..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:border-[#007144] focus:ring-2 focus:ring-[#007144]/20 transition-all"
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
