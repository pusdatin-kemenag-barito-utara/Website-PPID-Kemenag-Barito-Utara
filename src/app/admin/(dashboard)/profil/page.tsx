"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";

export default function AdminProfilPage() {
  const [sejarah, setSejarah] = useState("");
  const [visiMisi, setVisiMisi] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to DB
    alert("Profil berhasil disimpan (MOCK)");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Instansi</h1>
        <p className="text-muted-foreground mt-2">
          Kelola informasi Sejarah, Visi Misi, dan Struktur Organisasi PPID.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
          <CardDescription>Gunakan form di bawah ini untuk mengubah informasi profil instansi yang tampil di halaman publik.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sejarah Singkat</label>
              <textarea 
                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background"
                placeholder="Tuliskan sejarah PPID Kemenag Barito Utara..."
                value={sejarah}
                onChange={(e) => setSejarah(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Mendukung format paragraf biasa. Fitur Rich Text akan ditambahkan di versi mendatang jika diperlukan.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Visi & Misi</label>
              <textarea 
                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background"
                placeholder="Tuliskan Visi dan Misi..."
                value={visiMisi}
                onChange={(e) => setVisiMisi(e.target.value)}
              />
            </div>

            <button type="submit" className="bg-[#007144] text-white px-6 py-2.5 rounded-md font-medium hover:bg-[#005a36] transition-colors">
              Simpan Perubahan
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
