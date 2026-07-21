export interface InformasiPublikDoc {
  id: string;
  title: string;
  category: "Berkala" | "Serta Merta" | "Setiap Saat" | "Dikecualikan";
  date: string;
  fileSize: string;
  downloadUrl?: string;
  keterangan?: string;
}

export const initialInformasiPublikDocs: InformasiPublikDoc[] = [
  // 1. Informasi Berkala
  {
    id: "b1",
    title: "Laporan Kinerja Instansi Pemerintah (LKjIP) Kemenag Barito Utara Tahun 2025",
    category: "Berkala",
    date: "10 Jan 2026",
    fileSize: "3.4 MB",
    keterangan: "Laporan pertanggungjawaban capaian kinerja tahunan instansi."
  },
  {
    id: "b2",
    title: "Rencana Kerja & Anggaran Kementerian/Lembaga (RKA-KL) TA 2026",
    category: "Berkala",
    date: "05 Jan 2026",
    fileSize: "2.1 MB",
    keterangan: "Rincian alokasi anggaran belanja operasional dan program."
  },
  {
    id: "b3",
    title: "Laporan Keuangan & Neraca Tahun Anggaran 2025",
    category: "Berkala",
    date: "20 Jan 2026",
    fileSize: "4.8 MB",
    keterangan: "Laporan realisasi anggaran dan posisi neraca keuangan instansi."
  },

  // 2. Informasi Serta Merta
  {
    id: "sm1",
    title: "Pengumuman Prosedur Keselamatan & Evakuasi Darurat Bencana Alam KUA",
    category: "Serta Merta",
    date: "12 Feb 2026",
    fileSize: "1.1 MB",
    keterangan: "Petunjuk darurat dan penanganan bencana di lingkungan kantor."
  },
  {
    id: "sm2",
    title: "Pemberitahuan Penyesuaian Jam Layanan Operasional Darurat",
    category: "Serta Merta",
    date: "18 Feb 2026",
    fileSize: "850 KB",
    keterangan: "Pengumuman perubahan mendadak jadwal pelayanan akibat perbaikan fasilitas."
  },

  // 3. Tersedia Setiap Saat
  {
    id: "ss1",
    title: "Daftar Informasi Publik (DIP) Kemenag Barito Utara 2026",
    category: "Setiap Saat",
    date: "02 Jan 2026",
    fileSize: "1.8 MB",
    keterangan: "Katalog dan ringkasan daftar seluruh informasi publik yang tersedia."
  },
  {
    id: "ss2",
    title: "SOP Pelayanan Informasi dan Pengaduan Masyarakat PPID",
    category: "Setiap Saat",
    date: "03 Jan 2026",
    fileSize: "1.5 MB",
    keterangan: "Standard Operating Procedure pengajuan permohonan informasi."
  },
  {
    id: "ss3",
    title: "Pedoman Tata Naskah Dinas Kementerian Agama",
    category: "Setiap Saat",
    date: "04 Jan 2026",
    fileSize: "5.2 MB",
    keterangan: "Regulasi petunjuk teknis penyusunan naskah dinas resmi."
  },

  // 4. Dikecualikan
  {
    id: "dk1",
    title: "Penetapan Pengujian Consequence Test Informasi Dikecualikan TA 2026",
    category: "Dikecualikan",
    date: "15 Jan 2026",
    fileSize: "1.9 MB",
    keterangan: "SK penetapan daftar informasi yang dikecualikan berdasarkan UU KIP."
  }
];
