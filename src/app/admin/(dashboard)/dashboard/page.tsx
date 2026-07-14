import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Info, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-2">
          Ringkasan statistik portal PPID Kementerian Agama Kabupaten Barito Utara.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Permohonan
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              +14% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Proses
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Perlu tindak lanjut segera
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Permohonan Selesai
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">104</div>
            <p className="text-xs text-muted-foreground">
              Sudah diberikan tanggapan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dokumen Publik
            </CardTitle>
            <Info className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57</div>
            <p className="text-xs text-muted-foreground">
              Informasi tersedia untuk publik
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Aktivitas Permohonan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Belum ada data riwayat yang dapat ditampilkan.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href="/admin/informasi-publik" className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="bg-[#007144]/10 p-2 rounded-md text-[#007144]">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Unggah Dokumen Publik</div>
                <div className="text-xs text-muted-foreground">Tambah regulasi atau informasi berkala</div>
              </div>
            </a>
            <a href="/admin/permohonan" className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="bg-yellow-100 p-2 rounded-md text-yellow-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Tinjau Permohonan</div>
                <div className="text-xs text-muted-foreground">Cek permohonan informasi masuk</div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
