package model

import "time"

// Regulasi is a legal document record (UU, PP, PMA, KMA, SK).
type Regulasi struct {
	ID         string
	Nomor      string
	Tahun      string
	Judul      string
	Kategori   string
	TglTerbit  string
	Ukuran     string
	Keterangan string
	FileURL    string
	IsAktif    bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// RegulasiDTO is the API representation.
type RegulasiDTO struct {
	ID         string    `json:"id"`
	Nomor      string    `json:"nomor"`
	Tahun      string    `json:"tahun"`
	Judul      string    `json:"judul"`
	Kategori   string    `json:"kategori"`
	TglTerbit  string    `json:"tgl_terbit"`
	Ukuran     string    `json:"ukuran"`
	Keterangan string    `json:"keterangan"`
	FileURL    string    `json:"file_url"`
	IsAktif    bool      `json:"is_aktif"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
