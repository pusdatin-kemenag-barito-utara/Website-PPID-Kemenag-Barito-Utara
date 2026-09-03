package health

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
)

// Handler exposes the /api/v1/health endpoint.
type Handler struct {
	pool *pgxpool.Pool
}

// NewHandler creates a Health Handler backed by the DB pool.
func NewHandler(pool *pgxpool.Pool) *Handler {
	return &Handler{pool: pool}
}

// Check responds with service and database status.
func (h *Handler) Check(c fiber.Ctx) error {
	dbStatus := "up"
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()

	if err := h.pool.Ping(ctx); err != nil {
		dbStatus = "down"
		return platform.OK(c, fiber.Map{
			"status":   "degraded",
			"database": dbStatus,
			"time":     time.Now().UTC().Format(time.RFC3339),
		})
	}

	return platform.OK(c, fiber.Map{
		"status":   "ok",
		"database": dbStatus,
		"time":     time.Now().UTC().Format(time.RFC3339),
	})
}
