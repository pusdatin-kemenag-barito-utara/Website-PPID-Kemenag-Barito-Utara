import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informasi Publik - PPID Kemenag Barito Utara",
};

export default function InformasiPublikPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Informasi Publik</h1>
      <p className="text-muted-foreground">Daftar informasi berkala, serta merta, dan setiap saat.</p>
    </div>
  );
}
