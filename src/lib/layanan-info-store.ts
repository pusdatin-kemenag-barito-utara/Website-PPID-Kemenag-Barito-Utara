export interface LayananInfoData {
  sopList: { id: string; judul: string; noSop: string; tglTerbit: string; fileSize: string }[];
  alasanKeberatan: string[];
  prosedurSengketa: string[];
  kontakPengaduan: { email: string; phone: string; whatsapp: string; alamat: string };
}

export const initialLayananInfoData: LayananInfoData = {
  sopList: [
    {
      id: "sop1",
      judul: "SOP Pelayanan Permohonan Informasi Publik PPID",
      noSop: "SOP/PPID/001/2026",
      tglTerbit: "02 Jan 2026",
      fileSize: "1.4 MB"
    },
    {
      id: "sop2",
      judul: "SOP Pengajuan dan Penanganan Keberatan Informasi Publik",
      noSop: "SOP/PPID/002/2026",
      tglTerbit: "05 Jan 2026",
      fileSize: "1.2 MB"
    },
    {
      id: "sop3",
      judul: "SOP Pengujian Konsekuensi Informasi Dikecualikan",
      noSop: "SOP/PPID/003/2026",
      tglTerbit: "10 Jan 2026",
      fileSize: "1.8 MB"
    },
    {
      id: "sop4",
      judul: "SOP Pengaduan Masyarakat dan Layanan Aspirasi Online",
      noSop: "SOP/PPID/004/2026",
      tglTerbit: "15 Jan 2026",
      fileSize: "1.1 MB"
    }
  ],
  alasanKeberatan: [
    "Permohonan informasi publik ditolak berdasarkan alasan yang tidak sah / tidak sesuai UU.",
    "Informasi publik tidak disediakan secara berkala sebagaimana diatur undang-undang.",
    "Permohonan informasi publik tidak ditanggapi sebagaimana yang diminta.",
    "Permohonan informasi publik ditanggapi tidak sebagaimana yang diminta.",
    "Pengenaan biaya yang tidak wajar dan/atau melampaui ketentuan gratis.",
    "Penyampaian informasi publik yang melebihi waktu yang diatur dalam Undang-Undang."
  ],
  prosedurSengketa: [
    "Pengajuan Keberatan kepada Atasan PPID dalam jangka waktu paling lambat 30 (tiga puluh) hari kerja.",
    "Atasan PPID memberikan tanggapan atas keberatan tertulis paling lambat 30 (tiga puluh) hari kerja.",
    "Apabila jawaban Atasan PPID tidak memuaskan, Pemohon berhak mengajukan Permohonan Penyelesaian Sengketa ke Komisi Informasi dalam waktu 14 (empat belas) hari kerja.",
    "Proses Mediasi dan/atau Ajudikasi Nonlitigasi diselenggarakan oleh Komisi Informasi Provinsi Kalimantan Tengah."
  ],
  kontakPengaduan: {
    email: "ppidkemenagbaritoutara@gmail.com",
    phone: "(0519) 21269",
    whatsapp: "0812-5555-4321",
    alamat: "Jl. Ahmad Yani No. 45, Muara Teweh, Barito Utara, Kalimantan Tengah"
  }
};
