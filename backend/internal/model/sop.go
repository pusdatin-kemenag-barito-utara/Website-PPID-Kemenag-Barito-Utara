package model

import "time"

// Sop represents a Standard Operating Procedure document.
type Sop struct {
	ID         string
	Judul      string
	NoSop      string
	Kategori   string
	TglTerbit  string
	Ukuran     string
	Keterangan string
	FileURL    string
	Urutan     int
	IsAktif    bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// SopDTO is the JSON API representation of Sop.
type SopDTO struct {
	ID         string    `json:"id"`
	Judul      string    `json:"judul"`
	NoSop      string    `json:"no_sop"`
	Kategori   string    `json:"kategori"`
	TglTerbit  string    `json:"tgl_terbit"`
	Ukuran     string    `json:"ukuran"`
	Keterangan string    `json:"keterangan"`
	FileURL    string    `json:"file_url"`
	Urutan     int       `json:"urutan"`
	IsAktif    bool      `json:"is_aktif"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
