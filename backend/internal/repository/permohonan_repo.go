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

// PermohonanRepository persists public requests in PocketBase.
type PermohonanRepository struct {
	pb *pocketbase.Client
}

// NewPermohonanRepository creates a PermohonanRepository backed by PocketBase.
func NewPermohonanRepository(pb *pocketbase.Client) *PermohonanRepository {
	return &PermohonanRepository{pb: pb}
}

func mapToPermohonan(m map[string]interface{}) *model.Permohonan {
	if m == nil {
		return nil
	}
	id, _ := m["id"].(string)
	tiketNo, _ := m["tiket_no"].(string)
	jenis, _ := m["jenis"].(string)
	nama, _ := m["nama"].(string)
	nik, _ := m["nik"].(string)
	email, _ := m["email"].(string)
	phone, _ := m["phone"].(string)
	rincian, _ := m["rincian"].(string)
	tujuan, _ := m["tujuan"].(string)
	alasan, _ := m["alasan"].(string)
	tiketTerkait, _ := m["tiket_terkait"].(string)
	status, _ := m["status"].(string)
	if status == "" {
		status = "MENUNGGU"
	}

	createdAt := pocketbase.ParsePBTime(m["created_at"])
	if m["created_at"] == nil {
		createdAt = pocketbase.ParsePBTime(m["created"])
	}
	updatedAt := pocketbase.ParsePBTime(m["updated_at"])
	if m["updated_at"] == nil {
		updatedAt = pocketbase.ParsePBTime(m["updated"])
	}

	return &model.Permohonan{
		ID:           id,
		TiketNo:      tiketNo,
		Jenis:        model.JenisPermohonan(jenis),
		Nama:         nama,
		NIK:          nik,
		Email:        email,
		Phone:        phone,
		Rincian:      rincian,
		Tujuan:       tujuan,
		Alasan:       alasan,
		TiketTerkait: tiketTerkait,
		Status:       model.StatusPermohonan(status),
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}
}

// NextTiketNo allocates the next ticket number based on existing records count.
func (r *PermohonanRepository) NextTiketNo(ctx context.Context) (string, error) {
	_, total, err := r.pb.ListRecords("permohonan", "", "-created_at", 1, 1)
	if err != nil {
		total = 0
	}
	year := time.Now().Year()
	nextNum := total + 1

	for attempts := 0; attempts < 100; attempts++ {
		candidate := fmt.Sprintf("PPID-%d-%04d", year, nextNum)
		// Check uniqueness
		existing, _ := r.ByTiketNo(ctx, candidate)
		if existing == nil {
			return candidate, nil
		}
		nextNum++
	}

	return fmt.Sprintf("PPID-%d-%d", year, time.Now().UnixNano()%10000), nil
}

// List returns requests, optionally filtered by status and jenis.
func (r *PermohonanRepository) List(ctx context.Context, status, jenis string) ([]model.Permohonan, error) {
	var parts []string
	if status != "" {
		parts = append(parts, fmt.Sprintf("status='%s'", status))
	}
	if jenis != "" {
		parts = append(parts, fmt.Sprintf("jenis='%s'", jenis))
	}

	filterQuery := strings.Join(parts, " && ")
	sortQuery := "-created_at"

	items, _, err := r.pb.ListRecords("permohonan", filterQuery, sortQuery, 1, 500)
	if err != nil {
		return nil, err
	}

	res := make([]model.Permohonan, 0, len(items))
	for _, it := range items {
		p := mapToPermohonan(it)
		if p != nil {
			res = append(res, *p)
		}
	}
	return res, nil
}

// ByID returns a request by its ID.
func (r *PermohonanRepository) ByID(ctx context.Context, id string) (*model.Permohonan, error) {
	rec, err := r.pb.GetRecord("permohonan", id)
	if err != nil {
		return nil, platform.NotFoundf("Permohonan tidak ditemukan.")
	}
	return mapToPermohonan(rec), nil
}

// GetByID is an alias for ByID.
func (r *PermohonanRepository) GetByID(ctx context.Context, id string) (*model.Permohonan, error) {
	return r.ByID(ctx, id)
}

// ByTiketNo returns a request by its tiket_no (cached with SingleFlight to prevent stampede).
func (r *PermohonanRepository) ByTiketNo(ctx context.Context, tiketNo string) (*model.Permohonan, error) {
	clean := strings.ToUpper(strings.TrimSpace(tiketNo))
	cacheKey := "permohonan:tiket:" + clean

	return cache.FetchWithSingleFlight(cache.Default, cacheKey, 30*time.Second, func() (*model.Permohonan, error) {
		filter := fmt.Sprintf("tiket_no='%s'", clean)
		items, _, err := r.pb.ListRecords("permohonan", filter, "", 1, 1)
		if err != nil || len(items) == 0 {
			return nil, platform.NotFoundf("Tiket %s tidak ditemukan.", tiketNo)
		}
		return mapToPermohonan(items[0]), nil
	})
}

// FindByTiket is an alias for ByTiketNo.
func (r *PermohonanRepository) FindByTiket(ctx context.Context, tiketNo string) (*model.Permohonan, error) {
	return r.ByTiketNo(ctx, tiketNo)
}

// Create inserts a new permohonan into PocketBase and returns its ID string.
func (r *PermohonanRepository) Create(ctx context.Context, p *model.Permohonan) (string, error) {
	data := map[string]interface{}{
		"tiket_no":      p.TiketNo,
		"jenis":         string(p.Jenis),
		"nama":          p.Nama,
		"nik":           p.NIK,
		"email":         p.Email,
		"phone":         p.Phone,
		"rincian":       p.Rincian,
		"tujuan":        p.Tujuan,
		"alasan":        p.Alasan,
		"tiket_terkait": p.TiketTerkait,
		"status":        string(p.Status),
	}
	if p.ID != "" {
		data["id"] = p.ID
	}

	rec, err := r.pb.CreateRecord("permohonan", data)
	if err != nil {
		return "", err
	}
	cache.Default.InvalidatePrefix("permohonan:")
	newID, _ := rec["id"].(string)
	p.ID = newID
	return newID, nil
}

// UpdateStatus changes the status of a request.
func (r *PermohonanRepository) UpdateStatus(ctx context.Context, id, status string) error {
	data := map[string]interface{}{
		"status": status,
	}

	_, err := r.pb.UpdateRecord("permohonan", id, data)
	if err != nil {
		return platform.NotFoundf("Permohonan tidak ditemukan.")
	}
	cache.Default.InvalidatePrefix("permohonan:")
	return nil
}

// Delete removes a request.
func (r *PermohonanRepository) Delete(ctx context.Context, id string) error {
	err := r.pb.DeleteRecord("permohonan", id)
	if err != nil {
		return platform.NotFoundf("Permohonan tidak ditemukan.")
	}
	cache.Default.InvalidatePrefix("permohonan:")
	return nil
}
