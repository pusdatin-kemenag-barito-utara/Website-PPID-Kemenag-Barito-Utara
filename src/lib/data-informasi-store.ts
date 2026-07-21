export interface DataStatistikItem {
  id: string;
  label: string;
  nilai: string;
  satuan: string;
  deskripsi: string;
  kategori: string;
}

export interface InfografisItem {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  tanggal: string;
  imageUrl?: string;
}

export interface DataInformasiStoreData {
  statistik: DataStatistikItem[];
  infografis: InfografisItem[];
}

export const initialDataInformasi: DataInformasiStoreData = {
  statistik: [
    {
      id: "1",
      label: "Jumlah Rumah Ibadah",
      nilai: "142",
      satuan: "Lokasi",
      deskripsi: "Mesjid, Musholla, Gereja, dan tempat ibadah terdaftar di Barito Utara",
      kategori: "Keagamaan"
    },
    {
      id: "2",
      label: "Lembaga Pendidikan Agama",
      nilai: "58",
      satuan: "Lembaga",
      deskripsi: "Madrasah (MI, MTs, MA) & Pesantren aktif",
      kategori: "Pendidikan"
    },
    {
      id: "3",
      label: "Layanan Peristiwa Nikah",
      nilai: "890",
      satuan: "Peristiwa / Thn",
      deskripsi: "Pencatatan pernikahan resmi KUA Barito Utara",
      kategori: "Layanan KUA"
    },
    {
      id: "4",
      label: "Permohonan Informasi Publik",
      nilai: "128",
      satuan: "Permohonan",
      deskripsi: "Total permohonan informasi publik diproses PPID",
      kategori: "PPID"
    }
  ],
  infografis: [
    {
      id: "1",
      judul: "Peta Sebaran Rumah Ibadah Barito Utara 2026",
      deskripsi: "Infografis statistik sebaran masjid, musholla, dan gereja di 9 kecamatan.",
      kategori: "Keagamaan",
      tanggal: "15 Jan 2026"
    },
    {
      id: "2",
      judul: "Panduan & Alur Permohonan Informasi Publik PPID",
      deskripsi: "Sop ringkas dan tahapan pengajuan informasi online bagi masyarakat.",
      kategori: "Layanan PPID",
      tanggal: "10 Feb 2026"
    },
    {
      id: "3",
      judul: "Statistik Kelulusan & Madrasah Unggulan Barito Utara",
      deskripsi: "Data visualisasi capaian pendidikan keagamaan tingkat MI, MTs, MA.",
      kategori: "Pendidikan",
      tanggal: "01 Mar 2026"
    }
  ]
};
