package model

import "time"

// DataStatistik represents an indicator statistic card
type DataStatistik struct {
	ID        string    `json:"id"`
	Label     string    `json:"label"`
	Nilai     string    `json:"nilai"`
	Satuan    string    `json:"satuan"`
	Kategori  string    `json:"kategori"`
	Deskripsi string    `json:"deskripsi"`
	Urutan    int       `json:"urutan"`
	IsAktif   bool      `json:"is_aktif"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// DataStatistikDTO represents the input/output for API payload
type DataStatistikDTO struct {
	ID        string    `json:"id"`
	Label     string    `json:"label"`
	Nilai     string    `json:"nilai"`
	Satuan    string    `json:"satuan"`
	Kategori  string    `json:"kategori"`
	Deskripsi string    `json:"deskripsi"`
	Urutan    int       `json:"urutan"`
	IsAktif   bool      `json:"is_aktif"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// DataInfografis represents an infographic poster/image item
type DataInfografis struct {
	ID        string    `json:"id"`
	Judul     string    `json:"judul"`
	Kategori  string    `json:"kategori"`
	Tanggal   string    `json:"tanggal"`
	Deskripsi string    `json:"deskripsi"`
	ImageURL  string    `json:"image_url"`
	IsAktif   bool      `json:"is_aktif"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// DataInfografisDTO represents the API payload for infographic
type DataInfografisDTO struct {
	ID        string    `json:"id"`
	Judul     string    `json:"judul"`
	Kategori  string    `json:"kategori"`
	Tanggal   string    `json:"tanggal"`
	Deskripsi string    `json:"deskripsi"`
	ImageURL  string    `json:"image_url"`
	IsAktif   bool      `json:"is_aktif"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
