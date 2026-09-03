package service

import (
	"context"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// RegulasiService handles regulasi documents.
type RegulasiService struct {
	repo *repository.RegulasiRepository
}

// NewRegulasiService creates a RegulasiService.
func NewRegulasiService(repo *repository.RegulasiRepository) *RegulasiService {
	return &RegulasiService{repo: repo}
}

func toRegulasiDTO(it model.Regulasi) model.RegulasiDTO {
	return model.RegulasiDTO{
		ID:         it.ID,
		Nomor:      it.Nomor,
		Tahun:      it.Tahun,
		Judul:      it.Judul,
		Kategori:   it.Kategori,
		TglTerbit:  it.TglTerbit,
		Ukuran:     it.Ukuran,
		Keterangan: it.Keterangan,
		FileURL:    it.FileURL,
		IsAktif:    it.IsAktif,
		CreatedAt:  it.CreatedAt,
		UpdatedAt:  it.UpdatedAt,
	}
}

// List returns regulasi documents (public callers set onlyAktif).
func (s *RegulasiService) List(ctx context.Context, kategori string, onlyAktif bool) ([]model.RegulasiDTO, error) {
	items, err := s.repo.List(ctx, kategori, onlyAktif)
	if err != nil {
		return nil, err
	}
	dtos := make([]model.RegulasiDTO, 0, len(items))
	for _, it := range items {
		dtos = append(dtos, toRegulasiDTO(it))
	}
	return dtos, nil
}

// ByID returns a single document.
func (s *RegulasiService) ByID(ctx context.Context, id string) (*model.RegulasiDTO, error) {
	it, err := s.repo.ByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := toRegulasiDTO(*it)
	return &dto, nil
}

// Create inserts a new document and returns its ID.
func (s *RegulasiService) Create(ctx context.Context, doc *model.Regulasi) (string, error) {
	return s.repo.Create(ctx, doc)
}

// Update replaces a document.
func (s *RegulasiService) Update(ctx context.Context, id string, doc *model.Regulasi) error {
	return s.repo.Update(ctx, id, doc)
}

// Delete removes a document.
func (s *RegulasiService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
