package service

import (
	"context"
	"sync"
	"time"

	"github.com/kemenag/ppid-kemenag/backend/internal/config"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

type SystemStatusResponse struct {
	AppID         string    `json:"app_id"`
	Name          string    `json:"name"`
	Status        string    `json:"status"`
	IsMaintenance bool      `json:"is_maintenance"`
	CheckedAt     time.Time `json:"checked_at"`
}

type SystemService struct {
	repo       *repository.SystemRepository
	cfg        *config.Config
	mu         sync.RWMutex
	cachedResp *SystemStatusResponse
	cachedAt   time.Time
	lastHealth time.Time
}

func NewSystemService(repo *repository.SystemRepository, cfg *config.Config) *SystemService {
	return &SystemService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *SystemService) GetStatus(ctx context.Context) (*SystemStatusResponse, error) {
	s.mu.RLock()
	if s.cachedResp != nil && time.Since(s.cachedAt) < 3*time.Second {
		resp := *s.cachedResp
		s.mu.RUnlock()
		return &resp, nil
	}
	s.mu.RUnlock()

	appID := s.cfg.PusdatinAppID
	if appID == "" {
		appID = "ppid_kemenag_barito_utara"
	}

	status, name, err := s.repo.GetSatelliteAppStatus(ctx, appID)
	if err != nil {
		status = "online"
		name = "PPID Kemenag Barito Utara"
	}

	isMaintenance := status == "maintenance"

	resp := &SystemStatusResponse{
		AppID:         appID,
		Name:          name,
		Status:        status,
		IsMaintenance: isMaintenance,
		CheckedAt:     time.Now(),
	}

	s.mu.Lock()
	s.cachedResp = resp
	s.cachedAt = time.Now()

	// Update health check in background every 1 minute
	if time.Since(s.lastHealth) > time.Minute {
		s.lastHealth = time.Now()
		go func() {
			bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_ = s.repo.UpdateHealthCheck(bgCtx, appID)
		}()
	}
	s.mu.Unlock()

	return resp, nil
}
