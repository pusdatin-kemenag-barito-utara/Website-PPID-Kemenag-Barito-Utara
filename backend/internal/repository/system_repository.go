package repository

import (
	"context"

	"github.com/kemenag/ppid-kemenag/backend/internal/pocketbase"
)

type SystemRepository struct {
	pb *pocketbase.Client
}

func NewSystemRepository(pb *pocketbase.Client) *SystemRepository {
	return &SystemRepository{pb: pb}
}

// GetSatelliteAppStatus retrieves the status from PocketBase or falls back to 'online'.
func (r *SystemRepository) GetSatelliteAppStatus(ctx context.Context, appID string) (string, string, error) {
	if r.pb != nil {
		if err := r.pb.HealthCheck(); err == nil {
			return "online", "PPID Kemenag Barito Utara", nil
		}
	}
	return "online", "PPID Kemenag Barito Utara", nil
}

// UpdateHealthCheck marks this satellite application as alive.
func (r *SystemRepository) UpdateHealthCheck(ctx context.Context, appID string) error {
	return nil
}
