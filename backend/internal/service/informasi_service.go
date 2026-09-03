package service

import (
	"context"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// InformasiService handles informasi-publik data.
type InformasiService struct {
	repo *repository.InformasiRepository
}

// NewInformasiService creates an InformasiService.
func NewInformasiService(repo *repository.InformasiRepository) *InformasiService {
	return &InformasiService{repo: repo}
}

func toInformasiDTO(it model.InformasiPublik) model.InformasiPublikDTO {
	return model.InformasiPublikDTO{
		ID:        it.ID,
		Judul:     it.Judul,
		Kategori:  it.Kategori,
		Deskripsi: it.Deskripsi,
		Tanggal:   it.Tanggal,
		Ukuran:    it.Ukuran,
		FileURL:   it.FileURL,
		IsAktif:   it.IsAktif,
		CreatedAt: it.CreatedAt,
		UpdatedAt: it.UpdatedAt,
	}
}

// List returns documents matching the filter (public callers set OnlyAktif).
func (s *InformasiService) List(ctx context.Context, filter model.InformasiFilter) ([]model.InformasiPublikDTO, error) {
	items, err := s.repo.List(ctx, filter)
	if err != nil {
		return nil, err
	}
	dtos := make([]model.InformasiPublikDTO, 0, len(items))
	for _, it := range items {
		dtos = append(dtos, toInformasiDTO(it))
	}
	return dtos, nil
}

// ByID returns a single document.
func (s *InformasiService) ByID(ctx context.Context, id string) (*model.InformasiPublikDTO, error) {
	it, err := s.repo.ByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := toInformasiDTO(*it)
	return &dto, nil
}

// Create inserts a new document and returns its ID.
func (s *InformasiService) Create(ctx context.Context, doc *model.InformasiPublik) (string, error) {
	return s.repo.Create(ctx, doc)
}

// Update replaces a document.
func (s *InformasiService) Update(ctx context.Context, id string, doc *model.InformasiPublik) error {
	return s.repo.Update(ctx, id, doc)
}

// Delete removes a document.
func (s *InformasiService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
