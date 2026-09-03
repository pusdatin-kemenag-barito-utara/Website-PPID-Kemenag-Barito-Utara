package repository

import (
	"context"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
)

// SopRepository persists SOP documents.
type SopRepository struct {
	pool *pgxpool.Pool
}

// NewSopRepository creates a new SopRepository.
func NewSopRepository(pool *pgxpool.Pool) *SopRepository {
	return &SopRepository{pool: pool}
}

const sopColumns = `"id", "judul", "no_sop", "kategori", "tgl_terbit", "ukuran", COALESCE("keterangan", ''), "file_url", "urutan", "is_aktif"`

func scanSop(row interface{ Scan(...any) error }) (*model.Sop, error) {
	var s model.Sop
	if err := row.Scan(&s.ID, &s.Judul, &s.NoSop, &s.Kategori, &s.TglTerbit, &s.Ukuran, &s.Keterangan, &s.FileURL, &s.Urutan, &s.IsAktif); err != nil {
		return nil, err
	}
	return &s, nil
}

func scanSopRows(rows pgx.Rows) ([]model.Sop, error) {
	items := []model.Sop{}
	for rows.Next() {
		item, err := scanSop(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	return items, rows.Err()
}

// List returns SOP documents, optionally filtered by kategori and is_aktif.
func (r *SopRepository) List(ctx context.Context, kategori string, onlyAktif bool) ([]model.Sop, error) {
	sql := `SELECT ` + sopColumns + ` FROM "kemenag_ppid"."sop" WHERE 1=1`
	args := []any{}
	if kategori != "" {
		args = append(args, kategori)
		sql += ` AND "kategori" = $` + strconv.Itoa(len(args))
	}
	if onlyAktif {
		args = append(args, true)
		sql += ` AND "is_aktif" = $` + strconv.Itoa(len(args))
	}
	sql += ` ORDER BY "urutan" ASC, "created_at" DESC`

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanSopRows(rows)
}

// GetByID returns an SOP document by its ID.
func (r *SopRepository) GetByID(ctx context.Context, id string) (*model.Sop, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+sopColumns+` FROM "kemenag_ppid"."sop" WHERE "id" = $1`, id)
	item, err := scanSop(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, platform.NotFoundf("SOP tidak ditemukan.")
		}
		return nil, err
	}
	return item, nil
}

// Create inserts a new SOP document.
func (r *SopRepository) Create(ctx context.Context, s *model.Sop) (*model.Sop, error) {
	sql := `
		INSERT INTO "kemenag_ppid"."sop"
			("judul", "no_sop", "kategori", "tgl_terbit", "ukuran", "keterangan", "file_url", "urutan", "is_aktif")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING ` + sopColumns
	row := r.pool.QueryRow(ctx, sql,
		s.Judul, s.NoSop, s.Kategori, s.TglTerbit, s.Ukuran, s.Keterangan, s.FileURL, s.Urutan, s.IsAktif,
	)
	item, err := scanSop(row)
	if err != nil {
		return nil, err
	}
	return item, nil
}

// Update modifies an existing SOP document.
func (r *SopRepository) Update(ctx context.Context, s *model.Sop) (*model.Sop, error) {
	sql := `
		UPDATE "kemenag_ppid"."sop"
		SET "judul" = $2, "no_sop" = $3, "kategori" = $4, "tgl_terbit" = $5,
		    "ukuran" = $6, "keterangan" = $7, "file_url" = $8, "urutan" = $9,
		    "is_aktif" = $10, "updated_at" = now()
		WHERE "id" = $1
		RETURNING ` + sopColumns
	row := r.pool.QueryRow(ctx, sql,
		s.ID, s.Judul, s.NoSop, s.Kategori, s.TglTerbit, s.Ukuran, s.Keterangan, s.FileURL, s.Urutan, s.IsAktif,
	)
	item, err := scanSop(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, platform.NotFoundf("SOP tidak ditemukan.")
		}
		return nil, err
	}
	return item, nil
}

// Delete removes an SOP document by ID.
func (r *SopRepository) Delete(ctx context.Context, id string) error {
	ct, err := r.pool.Exec(ctx,
		`DELETE FROM "kemenag_ppid"."sop" WHERE "id" = $1`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return platform.NotFoundf("SOP tidak ditemukan.")
	}
	return nil
}
