package repository

import (
	"context"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
)

// InformasiRepository persists informasi_publik.
type InformasiRepository struct {
	pool *pgxpool.Pool
}

// NewInformasiRepository creates an InformasiRepository.
func NewInformasiRepository(pool *pgxpool.Pool) *InformasiRepository {
	return &InformasiRepository{pool: pool}
}

const informasiColumns = `"id", "judul", "kategori", "deskripsi", "tanggal", "ukuran", "file_url", "is_aktif"`

func scanInformasi(row interface{ Scan(...any) error }) (*model.InformasiPublik, error) {
	var i model.InformasiPublik
	if err := row.Scan(&i.ID, &i.Judul, &i.Kategori, &i.Deskripsi, &i.Tanggal, &i.Ukuran, &i.FileURL, &i.IsAktif); err != nil {
		return nil, err
	}
	return &i, nil
}

// List returns documents filtered by kategori (optional) and is_aktif.
func (r *InformasiRepository) List(ctx context.Context, filter model.InformasiFilter) ([]model.InformasiPublik, error) {
	sql := `SELECT ` + informasiColumns + ` FROM "kemenag_ppid"."informasi_publik" WHERE 1=1`
	args := []any{}
	if filter.Kategori != "" {
		args = append(args, string(filter.Kategori))
		sql += ` AND "kategori" = $` + strconv.Itoa(len(args))
	}
	if filter.OnlyAktif {
		args = append(args, true)
		sql += ` AND "is_aktif" = $` + strconv.Itoa(len(args))
	}
	sql += ` ORDER BY "created_at" DESC`

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.InformasiPublik{}
	for rows.Next() {
		item, err := scanInformasi(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	return items, rows.Err()
}

// ByID returns a single record.
func (r *InformasiRepository) ByID(ctx context.Context, id string) (*model.InformasiPublik, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+informasiColumns+` FROM "kemenag_ppid"."informasi_publik" WHERE "id" = $1`, id)
	item, err := scanInformasi(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, platform.NotFoundf("Informasi tidak ditemukan.")
		}
		return nil, err
	}
	return item, nil
}

// Create inserts a new informasi_publik record.
func (r *InformasiRepository) Create(ctx context.Context, i *model.InformasiPublik) (string, error) {
	var id string
	err := r.pool.QueryRow(ctx,
		`INSERT INTO "kemenag_ppid"."informasi_publik"
			("judul", "kategori", "deskripsi", "tanggal", "ukuran", "file_url", "is_aktif")
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING "id"`,
		i.Judul, string(i.Kategori), i.Deskripsi, i.Tanggal, i.Ukuran, i.FileURL, i.IsAktif).Scan(&id)
	return id, err
}

// Update replaces all editable fields of a record.
func (r *InformasiRepository) Update(ctx context.Context, id string, i *model.InformasiPublik) error {
	tag, err := r.pool.Exec(ctx,
		`UPDATE "kemenag_ppid"."informasi_publik"
		 SET "judul" = $1, "kategori" = $2, "deskripsi" = $3, "tanggal" = $4, "ukuran" = $5,
		     "file_url" = $6, "is_aktif" = $7, "updated_at" = now()
		 WHERE "id" = $8`,
		i.Judul, string(i.Kategori), i.Deskripsi, i.Tanggal, i.Ukuran, i.FileURL, i.IsAktif, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return platform.NotFoundf("Informasi tidak ditemukan.")
	}
	return nil
}

// Delete removes a record.
func (r *InformasiRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM "kemenag_ppid"."informasi_publik" WHERE "id" = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return platform.NotFoundf("Informasi tidak ditemukan.")
	}
	return nil
}
