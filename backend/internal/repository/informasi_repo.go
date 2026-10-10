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

// InformasiRepository persists informasi_publik in PocketBase.
type InformasiRepository struct {
	pb *pocketbase.Client
}

// NewInformasiRepository creates an InformasiRepository backed by PocketBase.
func NewInformasiRepository(pb *pocketbase.Client) *InformasiRepository {
	return &InformasiRepository{pb: pb}
}

func mapToInformasi(m map[string]interface{}) *model.InformasiPublik {
	if m == nil {
		return nil
	}
	id, _ := m["id"].(string)
	judul, _ := m["judul"].(string)
	kategori, _ := m["kategori"].(string)
	deskripsi, _ := m["deskripsi"].(string)
	tanggal, _ := m["tanggal"].(string)
	ukuran, _ := m["ukuran"].(string)
	fileURL, _ := m["file_url"].(string)
	isAktif := true
	if a, ok := m["is_aktif"].(bool); ok {
		isAktif = a
	}

	return &model.InformasiPublik{
		ID:        id,
		Judul:     judul,
		Kategori:  model.KategoriInformasi(kategori),
		Deskripsi: deskripsi,
		Tanggal:   tanggal,
		Ukuran:    ukuran,
		FileURL:   fileURL,
		IsAktif:   isAktif,
	}
}

// List returns documents filtered by kategori (optional) and is_aktif with in-memory caching.
func (r *InformasiRepository) List(ctx context.Context, filter model.InformasiFilter) ([]model.InformasiPublik, error) {
	cacheKey := fmt.Sprintf("informasi_publik:list:%s:%v", filter.Kategori, filter.OnlyAktif)

	return cache.FetchWithSingleFlight(cache.GetDefault(), cacheKey, 3*time.Minute, func() ([]model.InformasiPublik, error) {
		var parts []string
		if filter.Kategori != "" {
			parts = append(parts, fmt.Sprintf("kategori='%s'", filter.Kategori))
		}
		if filter.OnlyAktif {
			parts = append(parts, "is_aktif=true")
		}

		filterQuery := strings.Join(parts, " && ")
		sortQuery := "-created_at"

		items, _, err := r.pb.ListRecords("informasi_publik", filterQuery, sortQuery, 1, 500)
		if err != nil {
			return nil, err
		}

		res := make([]model.InformasiPublik, 0, len(items))
		for _, it := range items {
			inf := mapToInformasi(it)
			if inf != nil {
				res = append(res, *inf)
			}
		}
		return res, nil
	})
}

// ByID returns a single record from PocketBase.
func (r *InformasiRepository) ByID(ctx context.Context, id string) (*model.InformasiPublik, error) {
	rec, err := r.pb.GetRecord("informasi_publik", id)
	if err != nil {
		return nil, platform.NotFoundf("Informasi tidak ditemukan.")
	}
	return mapToInformasi(rec), nil
}

// Create inserts a new informasi_publik record.
func (r *InformasiRepository) Create(ctx context.Context, i *model.InformasiPublik) (string, error) {
	data := map[string]interface{}{
		"judul":      i.Judul,
		"kategori":   string(i.Kategori),
		"deskripsi":  i.Deskripsi,
		"tanggal":    i.Tanggal,
		"ukuran":     i.Ukuran,
		"file_url":   i.FileURL,
		"is_aktif":   i.IsAktif,
	}
	if i.ID != "" {
		data["id"] = i.ID
	}

	rec, err := r.pb.CreateRecord("informasi_publik", data)
	if err != nil {
		return "", err
	}
	cache.GetDefault().InvalidatePrefix("informasi_publik")
	newID, _ := rec["id"].(string)
	return newID, nil
}

// Update replaces editable fields of a record.
func (r *InformasiRepository) Update(ctx context.Context, id string, i *model.InformasiPublik) error {
	data := map[string]interface{}{
		"judul":     i.Judul,
		"kategori":  string(i.Kategori),
		"deskripsi": i.Deskripsi,
		"tanggal":   i.Tanggal,
		"ukuran":    i.Ukuran,
		"file_url":  i.FileURL,
		"is_aktif":  i.IsAktif,
	}

	_, err := r.pb.UpdateRecord("informasi_publik", id, data)
	if err != nil {
		return platform.NotFoundf("Informasi tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("informasi_publik")
	return nil
}

// Delete removes a record from PocketBase.
func (r *InformasiRepository) Delete(ctx context.Context, id string) error {
	err := r.pb.DeleteRecord("informasi_publik", id)
	if err != nil {
		return platform.NotFoundf("Informasi tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("informasi_publik")
	return nil
}
