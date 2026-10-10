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

// SopRepository persists SOP documents in PocketBase.
type SopRepository struct {
	pb *pocketbase.Client
}

// NewSopRepository creates a new SopRepository backed by PocketBase.
func NewSopRepository(pb *pocketbase.Client) *SopRepository {
	return &SopRepository{pb: pb}
}

func mapToSop(m map[string]interface{}) *model.Sop {
	if m == nil {
		return nil
	}
	id, _ := m["id"].(string)
	judul, _ := m["judul"].(string)
	noSop, _ := m["no_sop"].(string)
	kategori, _ := m["kategori"].(string)
	tglTerbit, _ := m["tgl_terbit"].(string)
	ukuran, _ := m["ukuran"].(string)
	keterangan, _ := m["keterangan"].(string)
	fileURL, _ := m["file_url"].(string)
	urutan := 0
	if u, ok := m["urutan"].(float64); ok {
		urutan = int(u)
	}
	isAktif := true
	if a, ok := m["is_aktif"].(bool); ok {
		isAktif = a
	}

	return &model.Sop{
		ID:         id,
		Judul:      judul,
		NoSop:      noSop,
		Kategori:   kategori,
		TglTerbit:  tglTerbit,
		Ukuran:     ukuran,
		Keterangan: keterangan,
		FileURL:    fileURL,
		Urutan:     urutan,
		IsAktif:    isAktif,
	}
}

// List returns SOP documents, optionally filtered by kategori and is_aktif with in-memory caching.
func (r *SopRepository) List(ctx context.Context, kategori string, onlyAktif bool) ([]model.Sop, error) {
	cacheKey := fmt.Sprintf("sop:list:%s:%v", kategori, onlyAktif)

	return cache.FetchWithSingleFlight(cache.GetDefault(), cacheKey, 3*time.Minute, func() ([]model.Sop, error) {
		var parts []string
		if kategori != "" {
			parts = append(parts, fmt.Sprintf("kategori='%s'", kategori))
		}
		if onlyAktif {
			parts = append(parts, "is_aktif=true")
		}

		filterQuery := strings.Join(parts, " && ")
		sortQuery := "+urutan,-created_at"

		items, _, err := r.pb.ListRecords("sop", filterQuery, sortQuery, 1, 500)
		if err != nil {
			return nil, err
		}

		res := make([]model.Sop, 0, len(items))
		for _, it := range items {
			s := mapToSop(it)
			if s != nil {
				res = append(res, *s)
			}
		}
		return res, nil
	})
}

// GetByID returns an SOP document by its ID.
func (r *SopRepository) GetByID(ctx context.Context, id string) (*model.Sop, error) {
	rec, err := r.pb.GetRecord("sop", id)
	if err != nil {
		return nil, platform.NotFoundf("SOP tidak ditemukan.")
	}
	return mapToSop(rec), nil
}

// Create inserts a new SOP document.
func (r *SopRepository) Create(ctx context.Context, s *model.Sop) (*model.Sop, error) {
	data := map[string]interface{}{
		"judul":      s.Judul,
		"no_sop":     s.NoSop,
		"kategori":   s.Kategori,
		"tgl_terbit": s.TglTerbit,
		"ukuran":     s.Ukuran,
		"keterangan": s.Keterangan,
		"file_url":   s.FileURL,
		"urutan":     s.Urutan,
		"is_aktif":   s.IsAktif,
	}
	if s.ID != "" {
		data["id"] = s.ID
	}

	rec, err := r.pb.CreateRecord("sop", data)
	if err != nil {
		return nil, err
	}
	cache.GetDefault().InvalidatePrefix("sop")
	return mapToSop(rec), nil
}

// Update modifies an existing SOP document.
func (r *SopRepository) Update(ctx context.Context, s *model.Sop) (*model.Sop, error) {
	data := map[string]interface{}{
		"judul":      s.Judul,
		"no_sop":     s.NoSop,
		"kategori":   s.Kategori,
		"tgl_terbit": s.TglTerbit,
		"ukuran":     s.Ukuran,
		"keterangan": s.Keterangan,
		"file_url":   s.FileURL,
		"urutan":     s.Urutan,
		"is_aktif":   s.IsAktif,
	}

	rec, err := r.pb.UpdateRecord("sop", s.ID, data)
	if err != nil {
		return nil, platform.NotFoundf("SOP tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("sop")
	return mapToSop(rec), nil
}

// Delete removes an SOP document.
func (r *SopRepository) Delete(ctx context.Context, id string) error {
	err := r.pb.DeleteRecord("sop", id)
	if err != nil {
		return platform.NotFoundf("SOP tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("sop")
	return nil
}
