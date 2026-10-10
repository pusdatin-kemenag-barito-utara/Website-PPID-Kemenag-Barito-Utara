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

type DataInformasiRepository struct {
	pb *pocketbase.Client
}

func NewDataInformasiRepository(pb *pocketbase.Client) *DataInformasiRepository {
	return &DataInformasiRepository{pb: pb}
}

// ─── STATISTIK ──────────────────────────────────────────────────────────────

func mapToStatistik(m map[string]interface{}) *model.DataStatistik {
	if m == nil {
		return nil
	}
	id, _ := m["id"].(string)
	label, _ := m["label"].(string)
	nilai, _ := m["nilai"].(string)
	satuan, _ := m["satuan"].(string)
	kategori, _ := m["kategori"].(string)
	deskripsi, _ := m["deskripsi"].(string)
	urutan := 0
	if u, ok := m["urutan"].(float64); ok {
		urutan = int(u)
	}
	isAktif := true
	if a, ok := m["is_aktif"].(bool); ok {
		isAktif = a
	}
	createdAt := pocketbase.ParsePBTime(m["created_at"])
	if m["created_at"] == nil {
		createdAt = pocketbase.ParsePBTime(m["created"])
	}
	updatedAt := pocketbase.ParsePBTime(m["updated_at"])
	if m["updated_at"] == nil {
		updatedAt = pocketbase.ParsePBTime(m["updated"])
	}

	return &model.DataStatistik{
		ID:        id,
		Label:     label,
		Nilai:     nilai,
		Satuan:    satuan,
		Kategori:  kategori,
		Deskripsi: deskripsi,
		Urutan:    urutan,
		IsAktif:   isAktif,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func (r *DataInformasiRepository) ListStatistik(ctx context.Context, onlyAktif bool) ([]model.DataStatistik, error) {
	cacheKey := fmt.Sprintf("data_statistik:list:%v", onlyAktif)

	return cache.FetchWithSingleFlight(cache.GetDefault(), cacheKey, 3*time.Minute, func() ([]model.DataStatistik, error) {
		filter := ""
		if onlyAktif {
			filter = "is_aktif=true"
		}
		sort := "+urutan"

		items, _, err := r.pb.ListRecords("data_statistik", filter, sort, 1, 500)
		if err != nil {
			return nil, err
		}

		res := make([]model.DataStatistik, 0, len(items))
		for _, it := range items {
			s := mapToStatistik(it)
			if s != nil {
				res = append(res, *s)
			}
		}
		return res, nil
	})
}

func (r *DataInformasiRepository) GetStatistikByID(ctx context.Context, id string) (*model.DataStatistik, error) {
	rec, err := r.pb.GetRecord("data_statistik", id)
	if err != nil {
		return nil, platform.NotFoundf("Data statistik tidak ditemukan.")
	}
	return mapToStatistik(rec), nil
}

func (r *DataInformasiRepository) CreateStatistik(ctx context.Context, s *model.DataStatistik) error {
	data := map[string]interface{}{
		"label":     s.Label,
		"nilai":     s.Nilai,
		"satuan":    s.Satuan,
		"kategori":  s.Kategori,
		"deskripsi": s.Deskripsi,
		"urutan":    s.Urutan,
		"is_aktif":  s.IsAktif,
	}
	if s.ID != "" {
		data["id"] = s.ID
	}

	rec, err := r.pb.CreateRecord("data_statistik", data)
	if err != nil {
		return err
	}
	cache.GetDefault().InvalidatePrefix("data_statistik")
	newID, _ := rec["id"].(string)
	s.ID = newID
	return nil
}

func (r *DataInformasiRepository) UpdateStatistik(ctx context.Context, s *model.DataStatistik) error {
	data := map[string]interface{}{
		"label":     s.Label,
		"nilai":     s.Nilai,
		"satuan":    s.Satuan,
		"kategori":  s.Kategori,
		"deskripsi": s.Deskripsi,
		"urutan":    s.Urutan,
		"is_aktif":  s.IsAktif,
	}

	_, err := r.pb.UpdateRecord("data_statistik", s.ID, data)
	if err != nil {
		return platform.NotFoundf("Data statistik tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("data_statistik")
	return nil
}

func (r *DataInformasiRepository) DeleteStatistik(ctx context.Context, id string) error {
	err := r.pb.DeleteRecord("data_statistik", id)
	if err != nil {
		return platform.NotFoundf("Data statistik tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("data_statistik")
	return nil
}

// ─── INFOGRAFIS ─────────────────────────────────────────────────────────────

func mapToInfografis(m map[string]interface{}) *model.DataInfografis {
	if m == nil {
		return nil
	}
	id, _ := m["id"].(string)
	judul, _ := m["judul"].(string)
	kategori, _ := m["kategori"].(string)
	tanggal, _ := m["tanggal"].(string)
	deskripsi, _ := m["deskripsi"].(string)
	imageURL, _ := m["image_url"].(string)
	isAktif := true
	if a, ok := m["is_aktif"].(bool); ok {
		isAktif = a
	}
	createdAt := pocketbase.ParsePBTime(m["created_at"])
	if m["created_at"] == nil {
		createdAt = pocketbase.ParsePBTime(m["created"])
	}
	updatedAt := pocketbase.ParsePBTime(m["updated_at"])
	if m["updated_at"] == nil {
		updatedAt = pocketbase.ParsePBTime(m["updated"])
	}

	return &model.DataInfografis{
		ID:        id,
		Judul:     judul,
		Kategori:  kategori,
		Tanggal:   tanggal,
		Deskripsi: deskripsi,
		ImageURL:  imageURL,
		IsAktif:   isAktif,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func (r *DataInformasiRepository) ListInfografis(ctx context.Context, kategori string, onlyAktif bool) ([]model.DataInfografis, error) {
	cacheKey := fmt.Sprintf("data_infografis:list:%s:%v", kategori, onlyAktif)

	return cache.FetchWithSingleFlight(cache.GetDefault(), cacheKey, 3*time.Minute, func() ([]model.DataInfografis, error) {
		var parts []string
		if kategori != "" {
			parts = append(parts, fmt.Sprintf("kategori='%s'", kategori))
		}
		if onlyAktif {
			parts = append(parts, "is_aktif=true")
		}
		filter := strings.Join(parts, " && ")
		sort := "-created_at"

		items, _, err := r.pb.ListRecords("data_infografis", filter, sort, 1, 500)
		if err != nil {
			return nil, err
		}

		res := make([]model.DataInfografis, 0, len(items))
		for _, it := range items {
			info := mapToInfografis(it)
			if info != nil {
				res = append(res, *info)
			}
		}
		return res, nil
	})
}

func (r *DataInformasiRepository) GetInfografisByID(ctx context.Context, id string) (*model.DataInfografis, error) {
	rec, err := r.pb.GetRecord("data_infografis", id)
	if err != nil {
		return nil, platform.NotFoundf("Data infografis tidak ditemukan.")
	}
	return mapToInfografis(rec), nil
}

func (r *DataInformasiRepository) CreateInfografis(ctx context.Context, info *model.DataInfografis) error {
	data := map[string]interface{}{
		"judul":     info.Judul,
		"kategori":  info.Kategori,
		"tanggal":   info.Tanggal,
		"deskripsi": info.Deskripsi,
		"image_url": info.ImageURL,
		"is_aktif":  info.IsAktif,
	}
	if info.ID != "" {
		data["id"] = info.ID
	}

	rec, err := r.pb.CreateRecord("data_infografis", data)
	if err != nil {
		return err
	}
	cache.GetDefault().InvalidatePrefix("data_infografis")
	newID, _ := rec["id"].(string)
	info.ID = newID
	return nil
}

func (r *DataInformasiRepository) UpdateInfografis(ctx context.Context, info *model.DataInfografis) error {
	data := map[string]interface{}{
		"judul":     info.Judul,
		"kategori":  info.Kategori,
		"tanggal":   info.Tanggal,
		"deskripsi": info.Deskripsi,
		"image_url": info.ImageURL,
		"is_aktif":  info.IsAktif,
	}

	_, err := r.pb.UpdateRecord("data_infografis", info.ID, data)
	if err != nil {
		return platform.NotFoundf("Data infografis tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("data_infografis")
	return nil
}

func (r *DataInformasiRepository) DeleteInfografis(ctx context.Context, id string) error {
	err := r.pb.DeleteRecord("data_infografis", id)
	if err != nil {
		return platform.NotFoundf("Data infografis tidak ditemukan.")
	}
	cache.GetDefault().InvalidatePrefix("data_infografis")
	return nil
}
