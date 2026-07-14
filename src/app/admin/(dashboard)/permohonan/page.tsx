"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminPermohonanPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permohonan Layanan</h1>
        <p className="text-muted-foreground mt-2">
          Tinjau dan proses permohonan informasi masuk dari masyarakat.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Antrean Permohonan</CardTitle>
          <CardDescription>Semua tiket permohonan dengan status Menunggu, Diproses, Selesai, atau Ditolak.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 text-center text-sm text-muted-foreground">
              Belum ada permohonan masuk saat ini.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
