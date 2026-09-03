package permohonan

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/config"
	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/service"
)

// Handler is the HTTP layer for permohonan tickets.
type Handler struct {
	svc *service.PermohonanService
	cfg *config.Config
}

// NewHandler creates a permohonan Handler.
func NewHandler(svc *service.PermohonanService, cfg *config.Config) *Handler {
	return &Handler{svc: svc, cfg: cfg}
}

type createRequest struct {
	Jenis          string `json:"jenis"`
	Nama           string `json:"nama"`
	NIK            string `json:"nik"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	Rincian        string `json:"rincian"`
	Tujuan         string `json:"tujuan"`
	Alasan         string `json:"alasan"`
	TiketTerkait   string `json:"tiket_terkait"`
	TurnstileToken string `json:"turnstile_token"`
}

func (r *createRequest) toModel() *model.Permohonan {
	return &model.Permohonan{
		Jenis:        model.JenisPermohonan(r.Jenis),
		Nama:         r.Nama,
		NIK:          r.NIK,
		Email:        r.Email,
		Phone:        r.Phone,
		Rincian:      r.Rincian,
		Tujuan:       r.Tujuan,
		Alasan:       r.Alasan,
		TiketTerkait: r.TiketTerkait,
	}
}

// Create stores a new public request and returns its ticket (public).
func (h *Handler) Create(c fiber.Ctx) error {
	var req createRequest
	if err := c.Bind().Body(&req); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}

	// Verify Cloudflare Turnstile if configured
	if h.cfg != nil && h.cfg.TurnstileSecretKey != "" && !strings.HasPrefix(h.cfg.TurnstileSecretKey, "change-me") {
		if req.TurnstileToken != "" {
			remoteIP := c.IP()
			ok, err := platform.VerifyTurnstile(c.Context(), h.cfg.TurnstileSecretKey, req.TurnstileToken, remoteIP)
			if err != nil {
				log.Printf("[turnstile] verify network error: %v", err)
			}
			if !ok {
				log.Printf("[turnstile] verification rejected (env=%s, ip=%s)", h.cfg.Env, remoteIP)
				if h.cfg.Env != "development" {
					return platform.Fail(c, platform.Validationf("Verifikasi keamanan Cloudflare Turnstile tidak valid atau sudah kedaluwarsa. Silakan ulangi."))
				}
			}
		}
	}

	dto, err := h.svc.Create(c.Context(), req.toModel())
	if err != nil {
		log.Printf("[permohonan-handler] svc.Create error: %v (req: %+v)", err, req)
		return platform.Fail(c, err)
	}
	return platform.Created(c, fiber.Map{
		"id":       dto.ID,
		"tiket_no": dto.TiketNo,
		"jenis":    dto.Jenis,
		"status":   dto.Status,
	})
}

// Track returns the current status of a request by ticket number (public).
func (h *Handler) Track(c fiber.Ctx) error {
	dto, err := h.svc.Track(c.Context(), c.Params("tiket"))
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, dto)
}

// ListAll returns every request, optionally filtered (admin only).
func (h *Handler) ListAll(c fiber.Ctx) error {
	items, err := h.svc.List(c.Context(), c.Query("status"), c.Query("jenis"))
	if err != nil {
		return platform.Fail(c, err)
	}
	return platform.OK(c, fiber.Map{"items": items})
}

type statusRequest struct {
	Status string `json:"status"`
}

// UpdateStatus changes the processing status of a request (admin only).
func (h *Handler) UpdateStatus(c fiber.Ctx) error {
	if !platform.ValidUUID(c.Params("id")) {
		return platform.Fail(c, platform.NotFoundf("Permohonan tidak ditemukan."))
	}

	var req statusRequest
	if err := c.Bind().Body(&req); err != nil {
		return platform.Fail(c, platform.Validationf("Payload tidak valid."))
	}

	if err := h.svc.UpdateStatus(c.Context(), c.Params("id"), req.Status); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OKMessage(c, fiber.StatusOK, "Status permohonan diperbarui.")
}

// Delete removes a request ticket permanently from database (admin only).
func (h *Handler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	if !platform.ValidUUID(id) {
		return platform.Fail(c, platform.NotFoundf("Permohonan tidak ditemukan."))
	}

	if err := h.svc.Delete(c.Context(), id); err != nil {
		return platform.Fail(c, err)
	}
	return platform.OKMessage(c, fiber.StatusOK, "Permohonan berhasil dihapus permanen.")
}
