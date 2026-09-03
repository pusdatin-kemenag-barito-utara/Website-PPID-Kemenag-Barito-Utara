package informasi

import (
	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

// Handler is the HTTP layer for informasi-publik.
type Handler struct {
	svc *service.InformasiService
}

// NewHandler creates an informasi Handler.
func NewHandler(svc *service.InformasiService) *Handler {
	return &Handler{svc: svc}
}

// List returns public documents, optionally filtered by kategori.
func (h *Handler) List(c fiber.Ctx) error {
	filter := model.InformasiFilter{OnlyAktif: true}
	if k := c.Query("kategori"); k != "" {
		filter.Kategori = model.KategoriInformasi(k)
	}

	items, err := h.svc.List(c.Context(), filter)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

// ListAll returns every document, including inactive ones (admin only).
func (h *Handler) ListAll(c fiber.Ctx) error {
	filter := model.InformasiFilter{}
	if k := c.Query("kategori"); k != "" {
		filter.Kategori = model.KategoriInformasi(k)
	}

	items, err := h.svc.List(c.Context(), filter)
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

type informasiRequest struct {
	Judul     string `json:"judul"`
	Kategori  string `json:"kategori"`
	Deskripsi string `json:"deskripsi"`
	Tanggal   string `json:"tanggal"`
	Ukuran    string `json:"ukuran"`
	FileURL   string `json:"file_url"`
	IsAktif   *bool  `json:"is_aktif"`
}

func (r *informasiRequest) toModel() (*model.InformasiPublik, error) {
	kat := model.KategoriInformasi(r.Kategori)
	switch kat {
	case model.KategoriBerkala, model.KategoriSertaMerta, model.KategoriSetiapSaat, model.KategoriDikecualikan:
	default:
		return nil, platform.Validationf("Kategori tidak valid.")
	}
	if r.Judul == "" {
		return nil, platform.Validationf("Judul wajib diisi.")
	}

	return &model.InformasiPublik{
		Judul:     r.Judul,
		Kategori:  kat,
		Deskripsi: r.Deskripsi,
		Tanggal:   r.Tanggal,
		Ukuran:    r.Ukuran,
		FileURL:   r.FileURL,
		IsAktif:   r.IsAktif != nil && *r.IsAktif,
	}, nil
}

// Create adds a new document (admin only).
func (h *Handler) Create(c fiber.Ctx) error {
	var req informasiRequest
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
		return platform.Fail(c, platform.NotFoundf("Informasi tidak ditemukan."))
	}

	var req informasiRequest
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
	return platform.OKMessage(c, fiber.StatusOK, "Informasi diperbarui.")
}

// Delete removes a document (admin only).
func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("Informasi tidak ditemukan."))
	}

	if err := h.svc.Delete(c.Context(), id); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OKMessage(c, fiber.StatusOK, "Informasi dihapus.")
}
