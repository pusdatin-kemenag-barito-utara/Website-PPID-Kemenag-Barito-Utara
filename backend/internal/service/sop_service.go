package service

import (
	"context"
	"strings"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// SopService handles business logic for SOP documents.
type SopService struct {
	repo *repository.SopRepository
}

// NewSopService creates a new SopService.
func NewSopService(repo *repository.SopRepository) *SopService {
	return &SopService{repo: repo}
}

// List returns active SOPs for the public portal.
func (s *SopService) List(ctx context.Context, kategori string) ([]model.SopDTO, error) {
	items, err := s.repo.List(ctx, kategori, true)
	if err != nil {
		return nil, err
	}
	dtos := make([]model.SopDTO, len(items))
	for i, item := range items {
		dtos[i] = toSopDTO(&item)
	}
	return dtos, nil
}

// ListAll returns all SOPs (active & inactive) for admin management.
func (s *SopService) ListAll(ctx context.Context, kategori string) ([]model.SopDTO, error) {
	items, err := s.repo.List(ctx, kategori, false)
	if err != nil {
		return nil, err
	}
	dtos := make([]model.SopDTO, len(items))
	for i, item := range items {
		dtos[i] = toSopDTO(&item)
	}
	return dtos, nil
}

// Create validates and saves a new SOP document.
func (s *SopService) Create(ctx context.Context, input model.SopDTO) (*model.SopDTO, error) {
	if strings.TrimSpace(input.Judul) == "" {
		return nil, platform.Validationf("Judul SOP wajib diisi.")
	}
	if strings.TrimSpace(input.NoSop) == "" {
		return nil, platform.Validationf("Nomor SOP wajib diisi.")
	}

	sop := &model.Sop{
		Judul:      strings.TrimSpace(input.Judul),
		NoSop:      strings.TrimSpace(input.NoSop),
		Kategori:   strings.TrimSpace(input.Kategori),
		TglTerbit:  strings.TrimSpace(input.TglTerbit),
		Ukuran:     strings.TrimSpace(input.Ukuran),
		Keterangan: strings.TrimSpace(input.Keterangan),
		FileURL:    strings.TrimSpace(input.FileURL),
		Urutan:     input.Urutan,
		IsAktif:    input.IsAktif,
	}
	if sop.Kategori == "" {
		sop.Kategori = "Layanan Informasi"
	}
	if sop.Urutan == 0 {
		sop.Urutan = 1
	}

	created, err := s.repo.Create(ctx, sop)
	if err != nil {
		return nil, err
	}
	dto := toSopDTO(created)
	return &dto, nil
}

// Update validates and updates an existing SOP document.
func (s *SopService) Update(ctx context.Context, id string, input model.SopDTO) (*model.SopDTO, error) {
	if strings.TrimSpace(input.Judul) == "" {
		return nil, platform.Validationf("Judul SOP wajib diisi.")
	}
	if strings.TrimSpace(input.NoSop) == "" {
		return nil, platform.Validationf("Nomor SOP wajib diisi.")
	}

	sop := &model.Sop{
		ID:         id,
		Judul:      strings.TrimSpace(input.Judul),
		NoSop:      strings.TrimSpace(input.NoSop),
		Kategori:   strings.TrimSpace(input.Kategori),
		TglTerbit:  strings.TrimSpace(input.TglTerbit),
		Ukuran:     strings.TrimSpace(input.Ukuran),
		Keterangan: strings.TrimSpace(input.Keterangan),
		FileURL:    strings.TrimSpace(input.FileURL),
		Urutan:     input.Urutan,
		IsAktif:    input.IsAktif,
	}

	updated, err := s.repo.Update(ctx, sop)
	if err != nil {
		return nil, err
	}
	dto := toSopDTO(updated)
	return &dto, nil
}

// Delete removes an SOP document.
func (s *SopService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func toSopDTO(s *model.Sop) model.SopDTO {
	return model.SopDTO{
		ID:         s.ID,
		Judul:      s.Judul,
		NoSop:      s.NoSop,
		Kategori:   s.Kategori,
		TglTerbit:  s.TglTerbit,
		Ukuran:     s.Ukuran,
		Keterangan: s.Keterangan,
		FileURL:    s.FileURL,
		Urutan:     s.Urutan,
		IsAktif:    s.IsAktif,
		CreatedAt:  s.CreatedAt,
		UpdatedAt:  s.UpdatedAt,
	}
}
