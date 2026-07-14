import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda - PPID Kemenag Barito Utara",
};

export default function HomePage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12 md:py-24">
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Selamat Datang di <span className="text-primary">PPID</span> Kemenag Barito Utara
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Portal Layanan Informasi Publik terintegrasi. Wujudkan keterbukaan informasi untuk pelayanan umat yang lebih baik.
        </p>
      </section>
      
      <section className="mt-20">
        <h2 className="text-2xl font-semibold mb-6 text-center">Lacak Permohonan</h2>
        <div className="max-w-md mx-auto p-6 bg-card border rounded-lg shadow-sm">
          {/* Tracker form placeholder */}
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Masukkan Tracking ID..." 
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Lacak Tiket
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
