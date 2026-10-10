package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/kemenag/ppid-kemenag/backend/internal/cache"
	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/pocketbase"
)

// RegulasiRepository persists regulasi documents in PocketBase.
type RegulasiRepository struct {
	pb *pocketbase.Client
}

// NewRegulasiRepository creates a RegulasiRepository backed by PocketBase.
func NewRegulasiRepository(pb *pocketbase.Client) *RegulasiRepository {
	return &RegulasiRepository{pb: pb}
}

func mapToRegulasi(m map[string]interface{}) *model.Regulasi {
	if m == nil {
		return nil
	}
	id, _ := m["id"].(string)
	nomor, _ := m["nomor"].(string)
	tahun, _ := m["tahun"].(string)
	judul, _ := m["judul"].(string)
	kategori, _ := m["kategori"].(string)
	tglTerbit, _ := m["tgl_terbit"].(string)
	ukuran, _ := m["ukuran"].(string)
	keterangan, _ := m["keterangan"].(string)
	fileURL, _ := m["file_url"].(string)
	isAktif := true
	if a, ok := m["is_aktif"].(bool); ok {
		isAktif = a
	}

	return &model.Regulasi{
		ID:         id,
		Nomor:      nomor,
		Tahun:      tahun,
		Judul:      judul,
		Kategori:   kategori,
		TglTerbit:  tglTerbit,
		Ukuran:     ukuran,
		Keterangan: keterangan,
		FileURL:    fileURL,
		IsAktif:    isAktif,
	}
}

// List returns regulasi documents, optionally filtered by kategori and is_aktif with in-memory caching.
func (r *RegulasiRepository) List(ctx context.Context, kategori string, onlyAktif bool) ([]model.Regulasi, error) {
	cacheKey := fmt.Sprintf("regulasi:list:%s:%v", kategori, onlyAktif)

	return cache.FetchWithSingleFlight(cache.GetDefault(), cacheKey, 3*time.Minute, func() ([]model.Regulasi, error) {
		var parts []string
		if kategori != "" {
			parts = append(parts, fmt.Sprintf("kategori='%s'", kategori))
		}
		if onlyAktif {
			parts = append(parts, "is_aktif=true")
		}

		filterQuery := strings.Join(parts, " && ")
		sortQuery := "-created_at"

		items, _, err := r.pb.ListRecords("regulasi", filterQuery, sortQuery, 1, 500)
		if err != nil {
			return nil, err
		}

		res := make([]model.Regulasi, 0, len(items))
		for _, it := range items {
			reg := mapToRegulasi(it)
			if reg != nil {
				res = append(res, *reg)
			}
		}
		return res, nil
	})
}

// ByID returns a single regulasi document.
func (r *RegulasiRepository) ByID(ctx context.Context, id string) (*model.Regulasi, error) {
	rec, err := r.pb.GetRecord("regulasi", id)
	if err != nil {
		return nil, platform.NotFoundf("Regulasi tidak ditemukan.")
	}
	return mapToRegulasi(rec), nil
}

// Create inserts a new regulasi document and returns its ID.
func (r *RegulasiRepository) Create(ctx context.Context, reg *model.Regulasi) (string, error) {
	data := map[string]interface{}{
		"nomor":      reg.Nomor,
		"tahun":      reg.Tahun,
		"judul":      reg.Judul,
		"kategori":   reg.Kategori,
		"tgl_terbit": reg.TglTerbit,
		"ukuran":     reg.Ukuran,
		"keterangan": reg.Keterangan,
		"file_url":   reg.FileURL,
		"is_aktif":   reg.IsAktif,
	}
	if reg.ID != "" {
		data["id"] = reg.ID
	}

	rec, err := r.pb.CreateRecord("regulasi", data)
	if err != nil {
		return "", err
	}
	cache.GetDefault().InvalidatePrefix("regulasi")
	newID, _ := rec["id"].(string)
	return newID, nil
}

// Update modifies an existing regulasi document.
func (r *RegulasiRepository) Update(ctx context.Context, id string, reg *model.Regulasi) error {
	data := map[string]interface{}{
		"nomor":      reg.Nomor,
		"tahun":      reg.Tahun,
		"judul":      reg.Judul,
		"kategori":   reg.Kategori,
		"tgl_terbit": reg.TglTerbit,
		"ukuran":     reg.Ukuran,
		"keterangan": reg.Keterangan,
		"file_url":   reg.FileURL,
		"is_aktif":   reg.IsAktif,
	}

	_, err := r.pb.UpdateRecord("regulasi", id, data)
	if err != nil {
		return platform.NotFoundf("Regulasi tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("regulasi")
	return nil
}

// Delete removes a regulasi document.
func (r *RegulasiRepository) Delete(ctx context.Context, id string) error {
	err := r.pb.DeleteRecord("regulasi", id)
	if err != nil {
		return platform.NotFoundf("Regulasi tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("regulasi")
	return nil
}
