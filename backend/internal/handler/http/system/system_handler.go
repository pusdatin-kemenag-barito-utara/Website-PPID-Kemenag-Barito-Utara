package system

import (
	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

type Handler struct {
	svc *service.SystemService
}

func NewHandler(svc *service.SystemService) *Handler {
	return &Handler{svc: svc}
}

// GetStatus returns the current online/maintenance status of the PPID system.
func (h *Handler) GetStatus(c fiber.Ctx) error {
	status, err := h.svc.GetStatus(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Gagal memeriksa status sistem",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    status,
	})
}
