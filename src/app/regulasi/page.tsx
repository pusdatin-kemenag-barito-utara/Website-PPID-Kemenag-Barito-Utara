import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulasi - PPID Kemenag Barito Utara",
};

export default function RegulasiPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Regulasi & SK PPID</h1>
      <p className="text-muted-foreground">Repositori peraturan dan standar layanan.</p>
    </div>
  );
}
