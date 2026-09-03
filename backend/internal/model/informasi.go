package model

import "time"

// KategoriInformasi matches the legacy enum values in PostgreSQL.
type KategoriInformasi string

const (
	KategoriBerkala      KategoriInformasi = "BERKALA"
	KategoriSertaMerta   KategoriInformasi = "SERTA_MERTA"
	KategoriSetiapSaat   KategoriInformasi = "SETIAP_SAAT"
	KategoriDikecualikan KategoriInformasi = "DIKECUALIKAN"
	KategoriRegulasi     KategoriInformasi = "REGULASI"
)

// InformasiPublik is a public document record.
type InformasiPublik struct {
	ID        string
	Judul     string
	Kategori  KategoriInformasi
	Deskripsi string
	Tanggal   string
	Ukuran    string
	FileURL   string
	IsAktif   bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

// InformasiPublikDTO is the API representation.
type InformasiPublikDTO struct {
	ID        string            `json:"id"`
	Judul     string            `json:"judul"`
	Kategori  KategoriInformasi `json:"kategori"`
	Deskripsi string            `json:"deskripsi"`
	Tanggal   string            `json:"tanggal"`
	Ukuran    string            `json:"ukuran"`
	FileURL   string            `json:"file_url"`
	IsAktif   bool              `json:"is_aktif"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
}

// InformasiFilter controls list queries.
type InformasiFilter struct {
	Kategori  KategoriInformasi
	OnlyAktif bool
}
