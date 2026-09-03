package repository

import (
	"context"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
)

type DataInformasiRepository struct {
	pool *pgxpool.Pool
}

func NewDataInformasiRepository(pool *pgxpool.Pool) *DataInformasiRepository {
	return &DataInformasiRepository{pool: pool}
}

// ─── STATISTIK ──────────────────────────────────────────────────────────────

const statistikColumns = `"id", "label", "nilai", "satuan", "kategori", "deskripsi", "urutan", "is_aktif", "created_at", "updated_at"`

func scanStatistik(row interface{ Scan(...any) error }) (*model.DataStatistik, error) {
	var s model.DataStatistik
	if err := row.Scan(&s.ID, &s.Label, &s.Nilai, &s.Satuan, &s.Kategori, &s.Deskripsi, &s.Urutan, &s.IsAktif, &s.CreatedAt, &s.UpdatedAt); err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *DataInformasiRepository) ListStatistik(ctx context.Context, onlyAktif bool) ([]model.DataStatistik, error) {
	query := `SELECT ` + statistikColumns + ` FROM "kemenag_ppid"."data_statistik" WHERE 1=1`
	args := []any{}
	if onlyAktif {
		args = append(args, true)
		query += ` AND "is_aktif" = $` + strconv.Itoa(len(args))
	}
	query += ` ORDER BY "urutan" ASC, "created_at" ASC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.DataStatistik{}
	for rows.Next() {
		s, err := scanStatistik(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *s)
	}
	return items, rows.Err()
}

func (r *DataInformasiRepository) GetStatistikByID(ctx context.Context, id string) (*model.DataStatistik, error) {
	query := `SELECT ` + statistikColumns + ` FROM "kemenag_ppid"."data_statistik" WHERE "id" = $1`
	row := r.pool.QueryRow(ctx, query, id)
	return scanStatistik(row)
}

func (r *DataInformasiRepository) CreateStatistik(ctx context.Context, item *model.DataStatistik) error {
	query := `INSERT INTO "kemenag_ppid"."data_statistik" ("label", "nilai", "satuan", "kategori", "deskripsi", "urutan", "is_aktif")
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING "id", "created_at", "updated_at"`
	return r.pool.QueryRow(ctx, query, item.Label, item.Nilai, item.Satuan, item.Kategori, item.Deskripsi, item.Urutan, item.IsAktif).
		Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
}

func (r *DataInformasiRepository) UpdateStatistik(ctx context.Context, item *model.DataStatistik) error {
	query := `UPDATE "kemenag_ppid"."data_statistik"
SET "label" = $1, "nilai" = $2, "satuan" = $3, "kategori" = $4, "deskripsi" = $5, "urutan" = $6, "is_aktif" = $7, "updated_at" = NOW()
WHERE "id" = $8
RETURNING "updated_at"`
	return r.pool.QueryRow(ctx, query, item.Label, item.Nilai, item.Satuan, item.Kategori, item.Deskripsi, item.Urutan, item.IsAktif, item.ID).
		Scan(&item.UpdatedAt)
}

func (r *DataInformasiRepository) DeleteStatistik(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM "kemenag_ppid"."data_statistik" WHERE "id" = $1`, id)
	return err
}

// ─── INFOGRAFIS ─────────────────────────────────────────────────────────────

const infografisColumns = `"id", "judul", "kategori", "tanggal", "deskripsi", "image_url", "is_aktif", "created_at", "updated_at"`

func scanInfografis(row interface{ Scan(...any) error }) (*model.DataInfografis, error) {
	var info model.DataInfografis
	if err := row.Scan(&info.ID, &info.Judul, &info.Kategori, &info.Tanggal, &info.Deskripsi, &info.ImageURL, &info.IsAktif, &info.CreatedAt, &info.UpdatedAt); err != nil {
		return nil, err
	}
	return &info, nil
}

func (r *DataInformasiRepository) ListInfografis(ctx context.Context, kategori string, onlyAktif bool) ([]model.DataInfografis, error) {
	query := `SELECT ` + infografisColumns + ` FROM "kemenag_ppid"."data_infografis" WHERE 1=1`
	args := []any{}
	if kategori != "" {
		args = append(args, kategori)
		query += ` AND "kategori" = $` + strconv.Itoa(len(args))
	}
	if onlyAktif {
		args = append(args, true)
		query += ` AND "is_aktif" = $` + strconv.Itoa(len(args))
	}
	query += ` ORDER BY "created_at" DESC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.DataInfografis{}
	for rows.Next() {
		info, err := scanInfografis(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *info)
	}
	return items, rows.Err()
}

func (r *DataInformasiRepository) GetInfografisByID(ctx context.Context, id string) (*model.DataInfografis, error) {
	query := `SELECT ` + infografisColumns + ` FROM "kemenag_ppid"."data_infografis" WHERE "id" = $1`
	row := r.pool.QueryRow(ctx, query, id)
	return scanInfografis(row)
}

func (r *DataInformasiRepository) CreateInfografis(ctx context.Context, item *model.DataInfografis) error {
	if item.Tanggal == "" {
		item.Tanggal = time.Now().Format("02 Jan 2006")
	}
	query := `INSERT INTO "kemenag_ppid"."data_infografis" ("judul", "kategori", "tanggal", "deskripsi", "image_url", "is_aktif")
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING "id", "created_at", "updated_at"`
	return r.pool.QueryRow(ctx, query, item.Judul, item.Kategori, item.Tanggal, item.Deskripsi, item.ImageURL, item.IsAktif).
		Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
}

func (r *DataInformasiRepository) UpdateInfografis(ctx context.Context, item *model.DataInfografis) error {
	query := `UPDATE "kemenag_ppid"."data_infografis"
SET "judul" = $1, "kategori" = $2, "tanggal" = $3, "deskripsi" = $4, "image_url" = $5, "is_aktif" = $6, "updated_at" = NOW()
WHERE "id" = $7
RETURNING "updated_at"`
	return r.pool.QueryRow(ctx, query, item.Judul, item.Kategori, item.Tanggal, item.Deskripsi, item.ImageURL, item.IsAktif, item.ID).
		Scan(&item.UpdatedAt)
}

func (r *DataInformasiRepository) DeleteInfografis(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM "kemenag_ppid"."data_infografis" WHERE "id" = $1`, id)
	return err
}
