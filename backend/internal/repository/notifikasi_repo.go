package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
)

// NotifikasiRepository persists notification attempts.
type NotifikasiRepository struct {
	pool *pgxpool.Pool
}

// NewNotifikasiRepository creates a NotifikasiRepository.
func NewNotifikasiRepository(pool *pgxpool.Pool) *NotifikasiRepository {
	return &NotifikasiRepository{pool: pool}
}

// Create stores a notification attempt.
func (r *NotifikasiRepository) Create(ctx context.Context, n *model.Notifikasi) (*model.NotifikasiDTO, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO "kemenag_ppid"."notifikasi"
			("permohonan_id", "channel", "penerima", "pesan", "status")
		VALUES ($1, $2, $3, $4, $5)
		RETURNING "id", "created_at"`,
		n.PermohonanID, n.Channel, n.Penerima, n.Pesan, n.Status,
	)
	if err := row.Scan(&n.ID, &n.CreatedAt); err != nil {
		return nil, err
	}
	return toNotifikasiDTO(n), nil
}

// ListByPermohonan returns notification history for a permohonan.
func (r *NotifikasiRepository) ListByPermohonan(ctx context.Context, permohonanID string) ([]model.NotifikasiDTO, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT "id", "permohonan_id", "channel", "penerima", "pesan", "status", "created_at"
		FROM "kemenag_ppid"."notifikasi"
		WHERE "permohonan_id" = $1
		ORDER BY "created_at" DESC`, permohonanID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.NotifikasiDTO, 0)
	for rows.Next() {
		var n model.Notifikasi
		if err := rows.Scan(&n.ID, &n.PermohonanID, &n.Channel, &n.Penerima, &n.Pesan, &n.Status, &n.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, *toNotifikasiDTO(&n))
	}
	return items, rows.Err()
}

func toNotifikasiDTO(n *model.Notifikasi) *model.NotifikasiDTO {
	return &model.NotifikasiDTO{
		ID:           n.ID,
		PermohonanID: n.PermohonanID,
		Channel:      n.Channel,
		Penerima:     n.Penerima,
		Pesan:        n.Pesan,
		Status:       n.Status,
		CreatedAt:    n.CreatedAt,
	}
}
