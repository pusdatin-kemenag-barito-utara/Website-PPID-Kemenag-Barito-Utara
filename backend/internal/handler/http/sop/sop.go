package sop

import (
	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

// Handler handles HTTP requests for SOP documents.
type Handler struct {
	svc *service.SopService
}

// NewHandler creates a new SOP handler.
func NewHandler(svc *service.SopService) *Handler {
	return &Handler{svc: svc}
}

// List handles GET /api/v1/sop (public, only active SOPs).
func (h *Handler) List(c fiber.Ctx) error {
	kategori := c.Query("kategori")
	items, err := h.svc.List(c.Context(), kategori)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{
		"items": items,
		"total": len(items),
	})
}

// ListAll handles GET /api/v1/admin/sop (admin, all SOPs).
func (h *Handler) ListAll(c fiber.Ctx) error {
	kategori := c.Query("kategori")
	items, err := h.svc.ListAll(c.Context(), kategori)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{
		"items": items,
		"total": len(items),
	})
}

// Create handles POST /api/v1/admin/sop.
func (h *Handler) Create(c fiber.Ctx) error {
	var input model.SopDTO
	if err := c.Bind().Body(&input); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}

	created, err := h.svc.Create(c.Context(), input)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.Created(c, created)
}

// Update handles PUT /api/v1/admin/sop/:id.
func (h *Handler) Update(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("SOP tidak ditemukan."))
	}

	var input model.SopDTO
	if err := c.Bind().Body(&input); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}

	updated, err := h.svc.Update(c.Context(), id, input)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, updated)
}

// Delete handles DELETE /api/v1/admin/sop/:id.
func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("SOP tidak ditemukan."))
	}

	if err := h.svc.Delete(c.Context(), id); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OKMessage(c, fiber.StatusOK, "SOP berhasil dihapus.")
}
