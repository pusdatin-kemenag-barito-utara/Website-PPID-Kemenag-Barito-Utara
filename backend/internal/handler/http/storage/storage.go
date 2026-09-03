package storage

import (
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/storage"
)

const maxUploadBytes = 25 << 20 // 25 MB

var allowedExts = map[string]bool{
	".pdf": true, ".png": true, ".jpg": true, ".jpeg": true, ".webp": true, ".gif": true,
	".doc": true, ".docx": true, ".xls": true, ".xlsx": true, ".zip": true,
}

// Handler is the HTTP layer for file storage (berkas publik).
type Handler struct {
	store storage.Storage
}

// NewHandler creates a storage Handler.
func NewHandler(store storage.Storage) *Handler {
	return &Handler{store: store}
}

// Upload receives a multipart file and returns its public URL (admin only).
func (h *Handler) Upload(c fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return platform.Fail(c, platform.Validationf("Field \"file\" tidak ditemukan."))
	}
	if file.Size > maxUploadBytes {
		return platform.Fail(c, platform.Validationf("Ukuran berkas maksimal 25 MB."))
	}

	name := file.Filename
	idx := strings.LastIndex(name, ".")
	ext := ""
	if idx >= 0 {
		ext = strings.ToLower(name[idx:])
	}
	if !allowedExts[ext] {
		return platform.Fail(c, platform.Validationf("Jenis berkas tidak diizinkan."))
	}

	fh, err := file.Open()
	if err != nil {
		return platform.Fail(c, platform.NewError(platform.ErrInternal, "Gagal membaca berkas."))
	}
	defer fh.Close()

	data := make([]byte, file.Size)
	if _, err := fh.Read(data); err != nil {
		return platform.Fail(c, platform.NewError(platform.ErrInternal, "Gagal membaca berkas."))
	}

	folder := c.FormValue("folder")
	if folder == "" {
		folder = c.Query("folder", "dokumen-ppid")
	}

	url, err := h.store.Save(c.Context(), folder, name, file.Header.Get("Content-Type"), data)
	if err != nil {
		return platform.Fail(c, platform.NewError(platform.ErrInternal, "Gagal mengunggah berkas: "+err.Error()))
	}

	return platform.OK(c, fiber.Map{
		"url":  url,
		"name": name,
		"size": file.Size,
	})
}

// Stream proxies and streams a file from Cloudflare R2 or local storage to the client.
func (h *Handler) Stream(c fiber.Ctx) error {
	key := c.Params("*")
	if key == "" {
		return platform.Fail(c, platform.Validationf("Key berkas diperlukan."))
	}

	cleanKey := strings.TrimPrefix(key, "/")
	candidates := []string{cleanKey}
	if !strings.HasPrefix(cleanKey, "ppid/") {
		candidates = append(candidates, "ppid/"+cleanKey)
	}
	if idx := strings.Index(cleanKey, "informasi-publik/"); idx >= 0 {
		candidates = append(candidates, cleanKey[idx:], "ppid/"+cleanKey[idx:])
	} else if idx := strings.Index(cleanKey, "regulasi/"); idx >= 0 {
		candidates = append(candidates, cleanKey[idx:], "ppid/"+cleanKey[idx:])
	} else if idx := strings.Index(cleanKey, "dokumen-ppid/"); idx >= 0 {
		candidates = append(candidates, cleanKey[idx:], "ppid/"+cleanKey[idx:])
	}

	var data []byte
	var contentType string
	var err error
	for _, candidate := range candidates {
		data, contentType, err = h.store.Get(c.Context(), candidate)
		if err == nil && len(data) > 0 {
			key = candidate
			break
		}
	}

	// Resilient fallback: If S3 GetObject failed, fetch directly from public CDN URL
	if err != nil || len(data) == 0 {
		cdnKey := cleanKey
		if !strings.HasPrefix(cdnKey, "ppid/") {
			cdnKey = "ppid/" + cdnKey
		}
		cdnUrl := fmt.Sprintf("https://files.kemenag-baritoutara.com/%s", cdnKey)
		req, reqErr := http.NewRequestWithContext(c.Context(), http.MethodGet, cdnUrl, nil)
		if reqErr == nil {
			resp, httpErr := http.DefaultClient.Do(req)
			if httpErr == nil && resp.StatusCode == http.StatusOK {
				defer resp.Body.Close()
				bodyData, readErr := io.ReadAll(resp.Body)
				if readErr == nil && len(bodyData) > 0 {
					data = bodyData
					contentType = resp.Header.Get("Content-Type")
					if contentType == "" {
						contentType = "application/pdf"
					}
					err = nil
				}
			}
		}
	}

	if err != nil || len(data) == 0 {
		return c.Status(fiber.StatusNotFound).SendString("Berkas tidak ditemukan di Cloudflare R2.")
	}

	filename := filepath.Base(key)
	c.Set("Content-Type", contentType)
	c.Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", filename))
	c.Set("Content-Security-Policy", "frame-ancestors 'self' *")
	c.Set("Access-Control-Allow-Origin", "*")

	return c.Send(data)
}
