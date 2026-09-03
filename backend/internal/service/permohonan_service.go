package service

import (
	"context"
	"strings"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// PermohonanService handles public request tickets.
type PermohonanService struct {
	repo *repository.PermohonanRepository
}

// NewPermohonanService creates a PermohonanService.
func NewPermohonanService(repo *repository.PermohonanRepository) *PermohonanService {
	return &PermohonanService{repo: repo}
}

func toPermohonanDTO(it model.Permohonan) model.PermohonanDTO {
	return model.PermohonanDTO{
		ID:           it.ID,
		TiketNo:      it.TiketNo,
		Jenis:        string(it.Jenis),
		Nama:         it.Nama,
		NIK:          it.NIK,
		Email:        it.Email,
		Phone:        it.Phone,
		Rincian:      it.Rincian,
		Tujuan:       it.Tujuan,
		Alasan:       it.Alasan,
		TiketTerkait: it.TiketTerkait,
		Status:       string(it.Status),
		CreatedAt:    it.CreatedAt,
		UpdatedAt:    it.UpdatedAt,
	}
}

// Create validates and stores a new request, returning its DTO.
func (s *PermohonanService) Create(ctx context.Context, in *model.Permohonan) (*model.PermohonanDTO, error) {
	switch in.Jenis {
	case model.JenisPermintaanPermohonan:
	case model.JenisPermintaanKeberatan:
	case model.JenisPermintaanPengaduan:
	default:
		return nil, platform.Validationf("Jenis permohonan tidak valid.")
	}
	if in.Nama == "" {
		return nil, platform.Validationf("Nama pemohon wajib diisi.")
	}
	if in.Jenis == model.JenisPermintaanPermohonan && in.Rincian == "" {
		return nil, platform.Validationf("Rincian informasi yang dibutuhkan wajib diisi.")
	}
	if in.Status == "" {
		in.Status = model.StatusMenunggu
	}

	id, err := s.repo.Create(ctx, in)
	if err != nil {
		return nil, err
	}
	in.ID = id

	dto := toPermohonanDTO(*in)
	return &dto, nil
}

// Track returns a single request by its ticket number (public) with PII masked to prevent brute-force data harvesting.
func (s *PermohonanService) Track(ctx context.Context, tiketNo string) (*model.PermohonanDTO, error) {
	it, err := s.repo.ByTiketNo(ctx, tiketNo)
	if err != nil {
		return nil, err
	}
	dto := toPermohonanDTO(*it)
	dto.Nama = maskName(dto.Nama)
	dto.NIK = maskNIK(dto.NIK)
	dto.Email = maskEmail(dto.Email)
	dto.Phone = maskPhone(dto.Phone)
	return &dto, nil
}

func maskName(name string) string {
	words := strings.Fields(name)
	if len(words) == 0 {
		return name
	}
	var masked []string
	for _, w := range words {
		runes := []rune(w)
		if len(runes) <= 1 {
			masked = append(masked, string(runes))
		} else {
			masked = append(masked, string(runes[0])+strings.Repeat("*", len(runes)-1))
		}
	}
	return strings.Join(masked, " ")
}

func maskNIK(nik string) string {
	runes := []rune(nik)
	if len(runes) <= 8 {
		return strings.Repeat("*", len(runes))
	}
	if len(runes) < 10 {
		return string(runes[:3]) + strings.Repeat("*", len(runes)-3)
	}
	return string(runes[:6]) + strings.Repeat("*", len(runes)-10) + string(runes[len(runes)-4:])
}

func maskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return email
	}
	user := []rune(parts[0])
	if len(user) <= 2 {
		return string(user[:1]) + "***@" + parts[1]
	}
	return string(user[:2]) + "***" + string(user[len(user)-1:]) + "@" + parts[1]
}

func maskPhone(phone string) string {
	runes := []rune(phone)
	if len(runes) <= 7 {
		return strings.Repeat("*", len(runes))
	}
	return string(runes[:4]) + "****" + string(runes[len(runes)-3:])
}

// List returns requests, optionally filtered by status and jenis.
func (s *PermohonanService) List(ctx context.Context, status, jenis string) ([]model.PermohonanDTO, error) {
	items, err := s.repo.List(ctx, status, jenis)
	if err != nil {
		return nil, err
	}
	dtos := make([]model.PermohonanDTO, 0, len(items))
	for _, it := range items {
		dtos = append(dtos, toPermohonanDTO(it))
	}
	return dtos, nil
}

// UpdateStatus changes the processing status of a request (admin only).
func (s *PermohonanService) UpdateStatus(ctx context.Context, id, status string) error {
	switch model.StatusPermohonan(status) {
	case model.StatusMenunggu, model.StatusDiproses, model.StatusSelesai, model.StatusDitolak:
	default:
		return platform.Validationf("Status tidak valid.")
	}
	return s.repo.UpdateStatus(ctx, id, status)
}

// Delete permanently removes a request ticket and its cascaded notifications from database (admin only).
func (s *PermohonanService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
