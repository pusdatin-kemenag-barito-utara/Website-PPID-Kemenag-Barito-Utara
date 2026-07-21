export interface ProfilData {
  sejarah: string;
  visi: string;
  misi: string[];
  motto: string;
  tugasFungsi: string[];
  pejabat: {
    nama: string;
    jabatan: string;
    nip: string;
    foto?: string;
  }[];
  strukturUrl?: string;
}

export const initialProfilData: ProfilData = {
  sejarah: "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Kementerian Agama Kabupaten Barito Utara dibentuk berdasarkan amanat Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik (KIP). PPID berkomitmen menyediakan layanan informasi yang transparan, efisien, akuntabel, dan mudah diakses oleh seluruh lapisan masyarakat.",
  visi: "Terwujudnya pelayanan informasi publik yang transparan, profesional, akuntabel, dan terintegrasi di lingkungan Kementerian Agama Kabupaten Barito Utara.",
  misi: [
    "Meningkatkan pengelolaan dan pelayanan informasi publik secara profesional.",
    "Mengembangkan sistem dokumentasi dan arsip digital yang terintegrasi.",
    "Mewujudkan keterbukaan informasi untuk pelayanan umat yang prima.",
    "Membangun sarana dan prasarana layanan informasi yang responsif dan modern."
  ],
  motto: "Layanan Transparan, Umat Nyaman, Barito Utara Berkah",
  tugasFungsi: [
    "Mengoordinasikan penyimpanan dan pendokumentasian seluruh informasi publik di lingkungan Kemenag Barito Utara.",
    "Mengkoordinasikan pengumpulan seluruh informasi publik secara berkala, serta merta, dan tersedia setiap saat.",
    "Mengoordinasikan pengujian tentang konsekuensi informasi yang dikecualikan.",
    "Menyediakan dan memberikan pelayanan informasi publik yang cepat, tepat, dan sederhana."
  ],
  pejabat: [
    {
      nama: "H. Ardiansyah, S.Ag., M.Pd.I",
      jabatan: "Atasan PPID / Kepala Kantor Kemenag Barito Utara",
      nip: "19750812 200112 1 002"
    },
    {
      nama: "Muhammad Yusuf, S.H.I",
      jabatan: "Ketua PPID / Kasubbag TU",
      nip: "19820315 200801 1 005"
    },
    {
      nama: "Siti Zubaidah, S.Kom",
      jabatan: "Penanggung Jawab Layanan Informasi & Pengaduan",
      nip: "19900520 201403 2 003"
    }
  ]
};
