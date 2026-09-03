package regulasi

import (
	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

// Handler is the HTTP layer for regulasi.
type Handler struct {
	svc *service.RegulasiService
}

// NewHandler creates a regulasi Handler.
func NewHandler(svc *service.RegulasiService) *Handler {
	return &Handler{svc: svc}
}

// List returns public regulasi documents, optionally filtered by kategori.
func (h *Handler) List(c fiber.Ctx) error {
	items, err := h.svc.List(c.Context(), c.Query("kategori"), true)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

// ListAll returns every document, including inactive ones (admin only).
func (h *Handler) ListAll(c fiber.Ctx) error {
	items, err := h.svc.List(c.Context(), c.Query("kategori"), false)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

type regulasiRequest struct {
	Nomor      string `json:"nomor"`
	Tahun      string `json:"tahun"`
	Judul      string `json:"judul"`
	Kategori   string `json:"kategori"`
	TglTerbit  string `json:"tgl_terbit"`
	Ukuran     string `json:"ukuran"`
	Keterangan string `json:"keterangan"`
	FileURL    string `json:"file_url"`
	IsAktif    *bool  `json:"is_aktif"`
}

func (r *regulasiRequest) toModel() (*model.Regulasi, error) {
	if r.Judul == "" {
		return nil, platform.Validationf("Judul wajib diisi.")
	}
	if r.Nomor == "" {
		return nil, platform.Validationf("Nomor wajib diisi.")
	}

	return &model.Regulasi{
		Nomor:      r.Nomor,
		Tahun:      r.Tahun,
		Judul:      r.Judul,
		Kategori:   r.Kategori,
		TglTerbit:  r.TglTerbit,
		Ukuran:     r.Ukuran,
		Keterangan: r.Keterangan,
		FileURL:    r.FileURL,
		IsAktif:    r.IsAktif != nil && *r.IsAktif,
	}, nil
}

// Create adds a new document (admin only).
func (h *Handler) Create(c fiber.Ctx) error {
	var req regulasiRequest
	if err := c.Bind().Body(&req); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}
	doc, err := req.toModel()
	if err != nil {
		return platform.Fail(c, err)
	}

	id, err := h.svc.Create(c.Context(), doc)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.Created(c, fiber.Map{"id": id})
}

// Update replaces a document (admin only).
func (h *Handler) Update(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("Regulasi tidak ditemukan."))
	}

	var req regulasiRequest
	if err := c.Bind().Body(&req); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}
	doc, err := req.toModel()
	if err != nil {
		return platform.Fail(c, err)
	}

	if err := h.svc.Update(c.Context(), id, doc); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OKMessage(c, fiber.StatusOK, "Regulasi diperbarui.")
}

// Delete removes a document (admin only).
func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("Regulasi tidak ditemukan."))
	}

	if err := h.svc.Delete(c.Context(), id); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OKMessage(c, fiber.StatusOK, "Regulasi dihapus.")
}
