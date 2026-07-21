export interface StandarLayananData {
  maklumat: string;
  jadwal: { hari: string; jam: string; istirahat: string }[];
  biayaTarif: string[];
  komponenStandar: string[];
  arahKebijakan: string[];
  strategiMetode: string[];
}

export const initialStandarLayananData: StandarLayananData = {
  maklumat: "Dengan ini, kami Pejabat Pengelola Informasi dan Dokumentasi (PPID) Kantor Kementerian Agama Kabupaten Barito Utara bersungguh-sungguh menyatakan sanggup menyelenggarakan pelayanan informasi publik sesuai standar pelayanan yang telah ditetapkan serta siap menerima sanksi apabila terjadi penyimpangan.",
  jadwal: [
    { hari: "Senin - Kamis", jam: "07.30 - 16.00 WIB", istirahat: "12.00 - 13.00 WIB" },
    { hari: "Jumat", jam: "07.30 - 16.30 WIB", istirahat: "11.30 - 13.00 WIB" },
    { hari: "Sabtu & Minggu", jam: "Tutup (Libur Akhir Pekan)", istirahat: "-" }
  ],
  biayaTarif: [
    "Pelayanan informasi publik pada PPID Kemenag Barito Utara TIDAK DIPUNGUT BIAYA (GRATIS).",
    "Biaya penggandaan atau fotokopi dokumen ditanggung oleh Pemohon Informasi Publik.",
    "Penyampaian informasi dalam bentuk berkas digital / softcopy disajikan GRATIS (dapat menggunakan flashdisk / email)."
  ],
  komponenStandar: [
    "Persyaratan permohonan informasi publik yang jelas dan akuntabel.",
    "Sistem, mekanisme, dan prosedur permohonan yang mudah diakses secara online & offline.",
    "Jangka waktu penyelesaian permohonan informasi paling lambat 10 + 7 hari kerja.",
    "Biaya / tarif pelayanan GRATIS tanpa pungutan liar.",
    "Produk pelayanan berupa dokumen resmi / file softcopy publikasi.",
    "Sarana, prasarana, dan fasilitas meja pelayanan informasi yang memadai."
  ],
  arahKebijakan: [
    "Mendorong keterbukaan informasi publik secara proaktif berbasis teknologi informasi digital.",
    "Meningkatkan kualitas SDM pengelola informasi yang berintegritas dan profesional.",
    "Memperkuat pengawasan dan evaluasi berkala terhadap efektivitas pelayanan informasi publik."
  ],
  strategiMetode: [
    "Pengembangan Portal PPID Terintegrasi dengan fitur pencarian dan unduh mandiri.",
    "Peningkatan literasi publik melalui infografis visual dan berita berkala keagamaan.",
    "Penerapan Standard Operating Procedure (SOP) yang ketat dan transparan."
  ]
};
