export type AdminPageKey = 'dashboard' | 'informasi' | 'regulasi' | 'sop' | 'permohonan' | 'data-informasi';

export interface SopItem {
	id: string;
	judul: string;
	no_sop: string;
	kategori: string;
	tgl_terbit: string;
	ukuran: string;
	keterangan?: string;
	file_url?: string;
	urutan: number;
	is_aktif?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface DataStatistikItem {
	id: string;
	label: string;
	nilai: string;
	satuan: string;
	kategori: string;
	deskripsi: string;
	urutan: number;
	is_aktif: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface DataInfografisItem {
	id: string;
	judul: string;
	kategori: string;
	tanggal: string;
	deskripsi: string;
	image_url: string;
	is_aktif: boolean;
	created_at?: string;
	updated_at?: string;
}

// ---- data types (mirror backend DTOs) ----
export interface InformasiItem {
	id: string;
	judul: string;
	kategori: string;
	deskripsi: string;
	tanggal: string;
	ukuran: string;
	file_url?: string;
	is_aktif?: boolean;
	created_at?: string;
}

export interface RegulasiItem {
	id: string;
	nomor: string;
	tahun: string;
	judul: string;
	kategori: string;
	tgl_terbit: string;
	ukuran: string;
	keterangan: string;
	file_url?: string;
	is_aktif?: boolean;
	created_at?: string;
}

export interface PermohonanItem {
	id: string;
	tiket_no: string;
	jenis: string;
	nama: string;
	nik: string;
	email: string;
	phone: string;
	rincian: string;
	tujuan?: string;
	alasan?: string;
	tiket_terkait?: string;
	lampiran_url?: string;
	status: string;
	created_at?: string;
}

export interface NotifItem {
	id: string;
	permohonan_id: string;
	channel: string;
	penerima: string;
	pesan: string;
	status: string;
	created_at?: string;
}