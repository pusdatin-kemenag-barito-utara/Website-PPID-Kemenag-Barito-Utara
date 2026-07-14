import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Layanan Informasi - PPID Kemenag Barito Utara",
};

export default function LayananInformasiPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Layanan Informasi</h1>
      <p className="text-muted-foreground">Formulir permohonan informasi publik dan pengajuan keberatan.</p>
    </div>
  );
}
