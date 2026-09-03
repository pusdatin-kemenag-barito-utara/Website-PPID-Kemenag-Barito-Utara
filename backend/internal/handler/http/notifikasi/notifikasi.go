package notifikasi

import (
	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

// Handler is the HTTP layer for permohonan notifications.
type Handler struct {
	svc *service.NotifikasiService
}

// NewHandler creates a notification Handler.
func NewHandler(svc *service.NotifikasiService) *Handler {
	return &Handler{svc: svc}
}

type sendRequest struct {
	Channel string `json:"channel"`
	Pesan   string `json:"pesan"`
}

// Send records and attempts to deliver a notification (admin only).
func (h *Handler) Send(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("Permohonan tidak ditemukan."))
	}

	var req sendRequest
	if err := c.Bind().Body(&req); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}

	dto, err := h.svc.Send(c.Context(), service.SendInput{
		PermohonanID: id,
		Channel:      req.Channel,
		Pesan:        req.Pesan,
	})
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.Created(c, dto)
}

// History returns past notification attempts (admin only).
func (h *Handler) History(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("Permohonan tidak ditemukan."))
	}

	items, err := h.svc.History(c.Context(), id)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}
