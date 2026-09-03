package service

import (
	"context"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

type DataInformasiService struct {
	repo *repository.DataInformasiRepository
}

func NewDataInformasiService(repo *repository.DataInformasiRepository) *DataInformasiService {
	return &DataInformasiService{repo: repo}
}

// ─── STATISTIK ──────────────────────────────────────────────────────────────

func (s *DataInformasiService) ListStatistik(ctx context.Context, onlyAktif bool) ([]model.DataStatistikDTO, error) {
	items, err := s.repo.ListStatistik(ctx, onlyAktif)
	if err != nil {
		return nil, err
	}
	dtos := make([]model.DataStatistikDTO, 0, len(items))
	for _, it := range items {
		dtos = append(dtos, model.DataStatistikDTO(it))
	}
	return dtos, nil
}

func (s *DataInformasiService) GetStatistikByID(ctx context.Context, id string) (*model.DataStatistikDTO, error) {
	it, err := s.repo.GetStatistikByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := model.DataStatistikDTO(*it)
	return &dto, nil
}

func (s *DataInformasiService) CreateStatistik(ctx context.Context, dto model.DataStatistikDTO) (*model.DataStatistikDTO, error) {
	item := model.DataStatistik{
		Label:     dto.Label,
		Nilai:     dto.Nilai,
		Satuan:    dto.Satuan,
		Kategori:  dto.Kategori,
		Deskripsi: dto.Deskripsi,
		Urutan:    dto.Urutan,
		IsAktif:   dto.IsAktif,
	}
	if err := s.repo.CreateStatistik(ctx, &item); err != nil {
		return nil, err
	}
	res := model.DataStatistikDTO(item)
	return &res, nil
}

func (s *DataInformasiService) UpdateStatistik(ctx context.Context, id string, dto model.DataStatistikDTO) (*model.DataStatistikDTO, error) {
	item := model.DataStatistik{
		ID:        id,
		Label:     dto.Label,
		Nilai:     dto.Nilai,
		Satuan:    dto.Satuan,
		Kategori:  dto.Kategori,
		Deskripsi: dto.Deskripsi,
		Urutan:    dto.Urutan,
		IsAktif:   dto.IsAktif,
	}
	if err := s.repo.UpdateStatistik(ctx, &item); err != nil {
		return nil, err
	}
	res := model.DataStatistikDTO(item)
	return &res, nil
}

func (s *DataInformasiService) DeleteStatistik(ctx context.Context, id string) error {
	return s.repo.DeleteStatistik(ctx, id)
}

// ─── INFOGRAFIS ─────────────────────────────────────────────────────────────

func (s *DataInformasiService) ListInfografis(ctx context.Context, kategori string, onlyAktif bool) ([]model.DataInfografisDTO, error) {
	items, err := s.repo.ListInfografis(ctx, kategori, onlyAktif)
	if err != nil {
		return nil, err
	}
	dtos := make([]model.DataInfografisDTO, 0, len(items))
	for _, it := range items {
		dtos = append(dtos, model.DataInfografisDTO(it))
	}
	return dtos, nil
}

func (s *DataInformasiService) GetInfografisByID(ctx context.Context, id string) (*model.DataInfografisDTO, error) {
	it, err := s.repo.GetInfografisByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := model.DataInfografisDTO(*it)
	return &dto, nil
}

func (s *DataInformasiService) CreateInfografis(ctx context.Context, dto model.DataInfografisDTO) (*model.DataInfografisDTO, error) {
	item := model.DataInfografis{
		Judul:     dto.Judul,
		Kategori:  dto.Kategori,
		Tanggal:   dto.Tanggal,
		Deskripsi: dto.Deskripsi,
		ImageURL:  dto.ImageURL,
		IsAktif:   dto.IsAktif,
	}
	if err := s.repo.CreateInfografis(ctx, &item); err != nil {
		return nil, err
	}
	res := model.DataInfografisDTO(item)
	return &res, nil
}

func (s *DataInformasiService) UpdateInfografis(ctx context.Context, id string, dto model.DataInfografisDTO) (*model.DataInfografisDTO, error) {
	item := model.DataInfografis{
		ID:        id,
		Judul:     dto.Judul,
		Kategori:  dto.Kategori,
		Tanggal:   dto.Tanggal,
		Deskripsi: dto.Deskripsi,
		ImageURL:  dto.ImageURL,
		IsAktif:   dto.IsAktif,
	}
	if err := s.repo.UpdateInfografis(ctx, &item); err != nil {
		return nil, err
	}
	res := model.DataInfografisDTO(item)
	return &res, nil
}

func (s *DataInformasiService) DeleteInfografis(ctx context.Context, id string) error {
	return s.repo.DeleteInfografis(ctx, id)
}
