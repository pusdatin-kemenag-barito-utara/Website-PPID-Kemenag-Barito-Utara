export interface RegulasiItem {
  id: string;
  nomor: string;
  tahun: string;
  judul: string;
  kategori: "Undang-Undang" | "Peraturan Pemerintah" | "Peraturan Menteri" | "Keputusan Menteri" | "SK Kepala Kantor";
  tglTerbit: string;
  fileSize: string;
  keterangan: string;
}

export const initialRegulasiList: RegulasiItem[] = [
  {
    id: "r1",
    nomor: "UU No. 14 Tahun 2008",
    tahun: "2008",
    judul: "Undang-Undang Republik Indonesia Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik",
    kategori: "Undang-Undang",
    tglTerbit: "30 Apr 2008",
    fileSize: "2.8 MB",
    keterangan: "Landasan hukum utama keterbukaan dan kewajiban penyediaan informasi publik."
  },
  {
    id: "r2",
    nomor: "PP No. 61 Tahun 2010",
    tahun: "2010",
    judul: "Peraturan Pemerintah Republik Indonesia Nomor 61 Tahun 2010 tentang Pelaksanaan UU KIP",
    kategori: "Peraturan Pemerintah",
    tglTerbit: "23 Agu 2010",
    fileSize: "1.9 MB",
    keterangan: "Aturan pelaksanaan tata cara pelayanan dan penetapan PPID di instansi pemerintah."
  },
  {
    id: "r3",
    nomor: "PMA No. 46 Tahun 2014",
    tahun: "2014",
    judul: "Peraturan Menteri Agama No. 46 Tahun 2014 tentang Pengelolaan Pelayanan Informasi Publik Kementerian Agama",
    kategori: "Peraturan Menteri",
    tglTerbit: "15 Okt 2014",
    fileSize: "2.4 MB",
    keterangan: "Pedoman tata kelola PPID khusus di lingkungan Kementerian Agama."
  },
  {
    id: "r4",
    nomor: "KMA No. 657 Tahun 2021",
    tahun: "2021",
    judul: "Keputusan Menteri Agama No. 657 Tahun 2021 tentang Rencana Strategis Kementerian Agama",
    kategori: "Keputusan Menteri",
    tglTerbit: "10 Jun 2021",
    fileSize: "3.1 MB",
    keterangan: "Arah kebijakan dan target indikator kinerja pelayanan Kementerian Agama."
  },
  {
    id: "r5",
    nomor: "SK Kakan Kemenag No. 01/2026",
    tahun: "2026",
    judul: "Keputusan Kepala Kantor Kemenag Barito Utara tentang Penunjukan Pengelola PPID TA 2026",
    kategori: "SK Kepala Kantor",
    tglTerbit: "02 Jan 2026",
    fileSize: "1.2 MB",
    keterangan: "SK struktur susunan tim pelaksana & penanggung jawab PPID Kemenag Barito Utara."
  }
];
