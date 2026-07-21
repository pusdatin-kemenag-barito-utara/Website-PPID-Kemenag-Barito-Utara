import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  Info, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  Eye, 
  ArrowUpRight, 
  Activity,
  FileCheck2,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 w-full max-w-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#007144] text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" /> Ikhtisar Sistem
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ringkasan statistik dan aktivitas portal PPID Kementerian Agama Kabupaten Barito Utara.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/informasi-publik" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#007144] text-white text-xs font-semibold hover:bg-[#005935] shadow-xs active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Dokumen</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Permohonan */}
        <Card className="shadow-xs border border-border/60 hover:border-emerald-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Permohonan
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">128</div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14% dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        {/* Menunggu Proses */}
        <Card className="shadow-xs border border-border/60 hover:border-amber-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Menunggu Proses
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-amber-600">12</div>
            <p className="text-xs font-medium text-amber-600/80 mt-2">
              Perlu tindak lanjut segera
            </p>
          </CardContent>
        </Card>

        {/* Permohonan Selesai */}
        <Card className="shadow-xs border border-border/60 hover:border-emerald-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Permohonan Selesai
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-[#007144]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-[#007144]">104</div>
            <p className="text-xs font-medium text-muted-foreground mt-2">
              Sudah ditanggapi & selesai
            </p>
          </CardContent>
        </Card>

        {/* Dokumen Publik */}
        <Card className="shadow-xs border border-border/60 hover:border-indigo-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dokumen Publik
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Info className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">57</div>
            <p className="text-xs font-medium text-muted-foreground mt-2">
              Tersedia di portal publik
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Activity & Quick Access */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-xs border border-border/60">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Aktivitas & Riwayat Permohonan</CardTitle>
                <CardDescription className="text-xs">Permohonan informasi publik terbaru yang masuk</CardDescription>
              </div>
              <Link href="/admin/permohonan" className="text-xs font-bold text-[#007144] hover:underline flex items-center gap-1">
                <span>Lihat Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="p-3 rounded-full bg-accent/60 text-muted-foreground">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-foreground">Belum ada riwayat baru</div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Setiap permohonan informasi publik dari masyarakat yang masuk akan secara otomatis muncul di panel ini.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-xs border border-border/60">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-bold">Akses Cepat Pengelolaan</CardTitle>
            <CardDescription className="text-xs">Pintasan menu administrasi utama</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <Link 
              href="/admin/informasi-publik" 
              className="group flex items-center justify-between p-3.5 rounded-xl border border-border/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#007144]/10 text-[#007144] group-hover:bg-[#007144] group-hover:text-white transition-colors">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground group-hover:text-[#007144] transition-colors">Unggah Dokumen Publik</div>
                  <div className="text-[11px] text-muted-foreground">Tambah regulasi & berita berkala</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#007144] transition-colors" />
            </Link>

            <Link 
              href="/admin/permohonan" 
              className="group flex items-center justify-between p-3.5 rounded-xl border border-border/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground group-hover:text-[#007144] transition-colors">Tinjau Permohonan</div>
                  <div className="text-[11px] text-muted-foreground">Cek tiket permohonan masyarakat</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#007144] transition-colors" />
            </Link>

            <Link 
              href="/admin/profil" 
              className="group flex items-center justify-between p-3.5 rounded-xl border border-border/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground group-hover:text-[#007144] transition-colors">Kelola Profil PPID</div>
                  <div className="text-[11px] text-muted-foreground">Ubah Visi Misi & Struktur</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#007144] transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
