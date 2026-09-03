package repository

import (
	"context"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SystemRepository struct {
	pool *pgxpool.Pool
}

func NewSystemRepository(pool *pgxpool.Pool) *SystemRepository {
	return &SystemRepository{pool: pool}
}

// GetSatelliteAppStatus retrieves the real-time status ('online' or 'maintenance')
// from the central Pusdatin satellite_apps table.
func (r *SystemRepository) GetSatelliteAppStatus(ctx context.Context, appID string) (string, string, error) {
	var status, name string
	query := `
		SELECT status, name
		FROM kemenag_pusdatin.satellite_apps
		WHERE id = $1 OR schema_name = 'kemenag_ppid'
		ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END
		LIMIT 1
	`
	err := r.pool.QueryRow(ctx, query, appID).Scan(&status, &name)
	if err != nil {
		// Fallback to online if table is not accessible
		return "online", "PPID Kemenag Barito Utara", nil
	}
	return strings.ToLower(strings.TrimSpace(status)), name, nil
}

// UpdateHealthCheck marks this satellite application as alive in Pusdatin.
func (r *SystemRepository) UpdateHealthCheck(ctx context.Context, appID string) error {
	query := `
		UPDATE kemenag_pusdatin.satellite_apps
		SET last_health_check = NOW()
		WHERE id = $1 OR schema_name = 'kemenag_ppid'
	`
	_, err := r.pool.Exec(ctx, query, appID)
	return err
}
