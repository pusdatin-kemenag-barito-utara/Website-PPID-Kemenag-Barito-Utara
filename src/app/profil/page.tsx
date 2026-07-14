import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil - PPID Kemenag Barito Utara",
};

export default function ProfilPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Profil PPID</h1>
      <p className="text-muted-foreground">Informasi profil PPID, visi misi, tugas, dan fungsi.</p>
    </div>
  );
}
