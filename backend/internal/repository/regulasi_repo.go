package repository

import (
	"context"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
)

// RegulasiRepository persists regulasi documents.
type RegulasiRepository struct {
	pool *pgxpool.Pool
}

// NewRegulasiRepository creates a RegulasiRepository.
func NewRegulasiRepository(pool *pgxpool.Pool) *RegulasiRepository {
	return &RegulasiRepository{pool: pool}
}

const regulasiColumns = `"id", "nomor", "tahun", "judul", "kategori", "tgl_terbit", "ukuran", "keterangan", "file_url", "is_aktif"`

func scanRegulasi(row interface{ Scan(...any) error }) (*model.Regulasi, error) {
	var i model.Regulasi
	if err := row.Scan(&i.ID, &i.Nomor, &i.Tahun, &i.Judul, &i.Kategori, &i.TglTerbit, &i.Ukuran, &i.Keterangan, &i.FileURL, &i.IsAktif); err != nil {
		return nil, err
	}
	return &i, nil
}

func scanRegulasiRows(rows pgx.Rows) ([]model.Regulasi, error) {
	items := []model.Regulasi{}
	for rows.Next() {
		item, err := scanRegulasi(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	return items, rows.Err()
}

// List returns regulasi documents, optionally filtered by kategori and is_aktif.
func (r *RegulasiRepository) List(ctx context.Context, kategori string, onlyAktif bool) ([]model.Regulasi, error) {
	sql := `SELECT ` + regulasiColumns + ` FROM "kemenag_ppid"."regulasi" WHERE 1=1`
	args := []any{}
	if kategori != "" {
		args = append(args, kategori)
		sql += ` AND "kategori" = $` + strconv.Itoa(len(args))
	}
	if onlyAktif {
		args = append(args, true)
		sql += ` AND "is_aktif" = $` + strconv.Itoa(len(args))
	}
	sql += ` ORDER BY "created_at" DESC`

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRegulasiRows(rows)
}

// ByID returns a single regulasi record.
func (r *RegulasiRepository) ByID(ctx context.Context, id string) (*model.Regulasi, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+regulasiColumns+` FROM "kemenag_ppid"."regulasi" WHERE "id" = $1`, id)
	item, err := scanRegulasi(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, platform.NotFoundf("Regulasi tidak ditemukan.")
		}
		return nil, err
	}
	return item, nil
}

// Create inserts a new regulasi record.
func (r *RegulasiRepository) Create(ctx context.Context, i *model.Regulasi) (string, error) {
	var id string
	err := r.pool.QueryRow(ctx,
		`INSERT INTO "kemenag_ppid"."regulasi"
			("nomor", "tahun", "judul", "kategori", "tgl_terbit", "ukuran", "keterangan", "file_url", "is_aktif")
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING "id"`,
		i.Nomor, i.Tahun, i.Judul, i.Kategori, i.TglTerbit, i.Ukuran, i.Keterangan, i.FileURL, i.IsAktif).Scan(&id)
	return id, err
}

// Update replaces all editable fields of a record.
func (r *RegulasiRepository) Update(ctx context.Context, id string, i *model.Regulasi) error {
	tag, err := r.pool.Exec(ctx,
		`UPDATE "kemenag_ppid"."regulasi"
		 SET "nomor" = $1, "tahun" = $2, "judul" = $3, "kategori" = $4, "tgl_terbit" = $5,
		     "ukuran" = $6, "keterangan" = $7, "file_url" = $8, "is_aktif" = $9, "updated_at" = now()
		 WHERE "id" = $10`,
		i.Nomor, i.Tahun, i.Judul, i.Kategori, i.TglTerbit, i.Ukuran, i.Keterangan, i.FileURL, i.IsAktif, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return platform.NotFoundf("Regulasi tidak ditemukan.")
	}
	return nil
}

// Delete removes a record.
func (r *RegulasiRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM "kemenag_ppid"."regulasi" WHERE "id" = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return platform.NotFoundf("Regulasi tidak ditemukan.")
	}
	return nil
}
