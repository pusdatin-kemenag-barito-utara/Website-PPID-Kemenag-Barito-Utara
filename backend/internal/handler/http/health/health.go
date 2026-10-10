package health

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/pocketbase"
)

// Handler exposes the /api/v1/health endpoint.
type Handler struct {
	pb *pocketbase.Client
}

// NewHandler creates a Health Handler backed by PocketBase.
func NewHandler(pb *pocketbase.Client) *Handler {
	return &Handler{pb: pb}
}

// Check responds with service and PocketBase database status.
func (h *Handler) Check(c fiber.Ctx) error {
	dbStatus := "up"
	if h.pb != nil {
		if err := h.pb.HealthCheck(); err != nil {
			dbStatus = "down"
			return platform.OK(c, fiber.Map{
				"status":   "degraded",
				"database": dbStatus,
				"time":     time.Now().UTC().Format(time.RFC3339),
			})
		}
	}

	return platform.OK(c, fiber.Map{
		"status":   "ok",
		"database": dbStatus,
		"time":     time.Now().UTC().Format(time.RFC3339),
	})
}
