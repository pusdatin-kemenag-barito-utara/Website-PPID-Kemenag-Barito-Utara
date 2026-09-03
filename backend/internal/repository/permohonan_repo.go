package repository

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
)

// PermohonanRepository persists public requests.
type PermohonanRepository struct {
	pool *pgxpool.Pool
}

// NewPermohonanRepository creates a PermohonanRepository.
func NewPermohonanRepository(pool *pgxpool.Pool) *PermohonanRepository {
	return &PermohonanRepository{pool: pool}
}

const permohonanColumns = `"id", "tiket_no", "jenis", "nama", "nik", "email", "phone", "rincian", "tujuan", "alasan", "tiket_terkait", "status", "created_at", "updated_at"`

func scanPermohonan(row interface{ Scan(...any) error }) (*model.Permohonan, error) {
	var i model.Permohonan
	if err := row.Scan(&i.ID, &i.TiketNo, &i.Jenis, &i.Nama, &i.NIK, &i.Email, &i.Phone, &i.Rincian, &i.Tujuan, &i.Alasan, &i.TiketTerkait, &i.Status, &i.CreatedAt, &i.UpdatedAt); err != nil {
		return nil, err
	}
	return &i, nil
}

func scanPermohonanRows(rows pgx.Rows) ([]model.Permohonan, error) {
	items := []model.Permohonan{}
	for rows.Next() {
		item, err := scanPermohonan(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	return items, rows.Err()
}

// NextTiketNo allocates the next ticket number in the shared sequence.
func (r *PermohonanRepository) NextTiketNo(ctx context.Context) (string, error) {
	var n int64
	err := r.pool.QueryRow(ctx, `SELECT nextval('"kemenag_ppid"."permohonan_seq"')`).Scan(&n)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("PPID-%d-%04d", time.Now().Year(), n), nil
}

// List returns requests, optionally filtered by status and jenis.
func (r *PermohonanRepository) List(ctx context.Context, status, jenis string) ([]model.Permohonan, error) {
	sql := `SELECT ` + permohonanColumns + ` FROM "kemenag_ppid"."permohonan" WHERE 1=1`
	args := []any{}
	if status != "" {
		args = append(args, status)
		sql += ` AND "status" = $` + strconv.Itoa(len(args))
	}
	if jenis != "" {
		args = append(args, jenis)
		sql += ` AND "jenis" = $` + strconv.Itoa(len(args))
	}
	sql += ` ORDER BY "created_at" DESC`

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPermohonanRows(rows)
}

// ByTiketNo returns a single request by its ticket number.
func (r *PermohonanRepository) ByTiketNo(ctx context.Context, tiketNo string) (*model.Permohonan, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+permohonanColumns+` FROM "kemenag_ppid"."permohonan" WHERE "tiket_no" = $1`, tiketNo)
	item, err := scanPermohonan(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, platform.NewError(platform.ErrInvalidTicket, "Nomor tiket tidak ditemukan.")
		}
		return nil, err
	}
	return item, nil
}

// ByID returns a single request by its internal ID (admin).
func (r *PermohonanRepository) ByID(ctx context.Context, id string) (*model.Permohonan, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+permohonanColumns+` FROM "kemenag_ppid"."permohonan" WHERE "id" = $1`, id)
	item, err := scanPermohonan(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, platform.NotFoundf("Permohonan tidak ditemukan.")
		}
		return nil, err
	}
	return item, nil
}

// Create inserts a new request and returns its ID and generated TiketNo if not already assigned.
func (r *PermohonanRepository) Create(ctx context.Context, i *model.Permohonan) (string, error) {
	var id string
	var tiketNo string

	query := `INSERT INTO "kemenag_ppid"."permohonan"
			("tiket_no", "jenis", "nama", "nik", "email", "phone", "rincian", "tujuan", "alasan", "tiket_terkait", "status")
		 VALUES (
			COALESCE(NULLIF($1, ''), 'PPID-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('"kemenag_ppid"."permohonan_seq"')::TEXT, 4, '0')),
			$2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		 )
		 RETURNING "id", "tiket_no"`

	err := r.pool.QueryRow(ctx, query,
		i.TiketNo, i.Jenis, i.Nama, i.NIK, i.Email, i.Phone, i.Rincian, i.Tujuan, i.Alasan, i.TiketTerkait, i.Status).Scan(&id, &tiketNo)
	if err != nil {
		return "", err
	}
	i.TiketNo = tiketNo
	return id, nil
}

// UpdateStatus changes the processing status of a request.
func (r *PermohonanRepository) UpdateStatus(ctx context.Context, id, status string) error {
	tag, err := r.pool.Exec(ctx,
		`UPDATE "kemenag_ppid"."permohonan" SET "status" = $2, "updated_at" = now() WHERE "id" = $1`,
		id, status)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return platform.NotFoundf("Permohonan tidak ditemukan.")
	}
	return nil
}
