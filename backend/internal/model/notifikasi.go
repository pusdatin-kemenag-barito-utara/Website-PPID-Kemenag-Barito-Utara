package model

import "time"

// Notifikasi records a notification attempt for a permohonan.
type Notifikasi struct {
	ID           string
	PermohonanID string
	Channel      string // "wa" | "email"
	Penerima     string
	Pesan        string
	Status       string // "TERKIRIM" | "DUPLIKAT" | "GAGAL"
	CreatedAt    time.Time
}

// NotifikasiDTO is the wire representation of a Notifikasi.
type NotifikasiDTO struct {
	ID           string    `json:"id"`
	PermohonanID string    `json:"permohonan_id"`
	Channel      string    `json:"channel"`
	Penerima     string    `json:"penerima"`
	Pesan        string    `json:"pesan"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}

// NotifikasiChannelWa is the WhatsApp channel identifier.
const NotifikasiChannelWa = "wa"

// NotifikasiChannelEmail is the email channel identifier.
const NotifikasiChannelEmail = "email"
