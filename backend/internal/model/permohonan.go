package model

import "time"

// JenisPermohonan is the type of public request a submission represents.
type JenisPermohonan string

const (
	JenisPermintaanPermohonan JenisPermohonan = "PERMOHONAN"
	JenisPermintaanKeberatan  JenisPermohonan = "KEBERATAN"
	JenisPermintaanPengaduan  JenisPermohonan = "PENGADUAN"
)

// StatusPermohonan is the processing state of a ticket.
type StatusPermohonan string

const (
	StatusMenunggu StatusPermohonan = "MENUNGGU"
	StatusDiproses StatusPermohonan = "DIPROSES"
	StatusSelesai  StatusPermohonan = "SELESAI"
	StatusDitolak  StatusPermohonan = "DITOLAK"
)

// Permohonan is a stored public request (permohonan/keberatan/pengaduan).
type Permohonan struct {
	ID           string
	TiketNo      string
	Jenis        JenisPermohonan
	Nama         string
	NIK          string
	Email        string
	Phone        string
	Rincian      string
	Tujuan       string
	Alasan       string
	TiketTerkait string
	Status       StatusPermohonan
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// PermohonanDTO is the API representation of a Permohonan.
type PermohonanDTO struct {
	ID           string    `json:"id"`
	TiketNo      string    `json:"tiket_no"`
	Jenis        string    `json:"jenis"`
	Nama         string    `json:"nama"`
	NIK          string    `json:"nik"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	Rincian      string    `json:"rincian"`
	Tujuan       string    `json:"tujuan"`
	Alasan       string    `json:"alasan"`
	TiketTerkait string    `json:"tiket_terkait"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
