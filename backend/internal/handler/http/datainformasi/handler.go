package datainformasi

import (
	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

type Handler struct {
	svc *service.DataInformasiService
}

func NewHandler(svc *service.DataInformasiService) *Handler {
	return &Handler{svc: svc}
}

// ─── STATISTIK HANDLERS ─────────────────────────────────────────────────────

func (h *Handler) ListStatistik(c fiber.Ctx) error {
	items, err := h.svc.ListStatistik(c.Context(), true)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

func (h *Handler) ListStatistikAdmin(c fiber.Ctx) error {
	items, err := h.svc.ListStatistik(c.Context(), false)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

func (h *Handler) CreateStatistik(c fiber.Ctx) error {
	var req model.DataStatistikDTO
	if err := c.Bind().Body(&req); err != nil {
		return platform.Validationf("Format data statistik tidak valid.")
	}
	if req.Label == "" {
		return platform.Validationf("Label indikator wajib diisi.")
	}
	if req.Nilai == "" {
		return platform.Validationf("Nilai angka indikator wajib diisi.")
	}
	if req.Satuan == "" {
		return platform.Validationf("Satuan wajib diisi.")
	}
	if req.Kategori == "" {
		req.Kategori = "Keagamaan"
	}

	created, err := h.svc.CreateStatistik(c.Context(), req)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.Created(c, fiber.Map{"item": created})
}

func (h *Handler) UpdateStatistik(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return platform.Validationf("ID statistik wajib diisi.")
	}

	var req model.DataStatistikDTO
	if err := c.Bind().Body(&req); err != nil {
		return platform.Validationf("Format data statistik tidak valid.")
	}

	updated, err := h.svc.UpdateStatistik(c.Context(), id, req)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"item": updated})
}

func (h *Handler) DeleteStatistik(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return platform.Validationf("ID statistik wajib diisi.")
	}

	if err := h.svc.DeleteStatistik(c.Context(), id); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"message": "Data statistik berhasil dihapus."})
}

// ─── INFOGRAFIS HANDLERS ────────────────────────────────────────────────────

func (h *Handler) ListInfografis(c fiber.Ctx) error {
	kategori := c.Query("kategori")
	items, err := h.svc.ListInfografis(c.Context(), kategori, true)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

func (h *Handler) ListInfografisAdmin(c fiber.Ctx) error {
	kategori := c.Query("kategori")
	items, err := h.svc.ListInfografis(c.Context(), kategori, false)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

func (h *Handler) CreateInfografis(c fiber.Ctx) error {
	var req model.DataInfografisDTO
	if err := c.Bind().Body(&req); err != nil {
		return platform.Validationf("Format data infografis tidak valid.")
	}
	if req.Judul == "" {
		return platform.Validationf("Judul infografis wajib diisi.")
	}
	if req.ImageURL == "" {
		return platform.Validationf("File gambar infografis wajib diunggah.")
	}
	if req.Kategori == "" {
		req.Kategori = "Keagamaan"
	}

	created, err := h.svc.CreateInfografis(c.Context(), req)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.Created(c, fiber.Map{"item": created})
}

func (h *Handler) UpdateInfografis(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return platform.Validationf("ID infografis wajib diisi.")
	}

	var req model.DataInfografisDTO
	if err := c.Bind().Body(&req); err != nil {
		return platform.Validationf("Format data infografis tidak valid.")
	}

	updated, err := h.svc.UpdateInfografis(c.Context(), id, req)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"item": updated})
}

func (h *Handler) DeleteInfografis(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return platform.Validationf("ID infografis wajib diisi.")
	}

	if err := h.svc.DeleteInfografis(c.Context(), id); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"message": "Data infografis berhasil dihapus."})
}
