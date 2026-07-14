"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminInformasiPublikPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Informasi Publik & Regulasi</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dokumen, laporan, dan regulasi yang akan ditampilkan ke publik.
          </p>
        </div>
        <button className="bg-[#007144] text-white px-4 py-2 rounded-md font-medium hover:bg-[#005a36] transition-colors whitespace-nowrap">
          + Tambah Dokumen
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Dokumen</CardTitle>
          <CardDescription>Semua informasi publik (Berkala, Serta Merta, Setiap Saat, Regulasi).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 text-center text-sm text-muted-foreground">
              Belum ada data dokumen publik. Klik &quot;Tambah Dokumen&quot; untuk memulai.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
