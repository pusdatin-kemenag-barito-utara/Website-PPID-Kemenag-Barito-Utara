package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/kemenag/ppid-kemenag/backend/internal/config"
	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// NotifikasiService handles sending notification attempts to permohonan
// authors. Real delivery uses an optional WA-bot webhook; without it the
// attempt is only recorded (deep-links in the admin UI remain primary).
type NotifikasiService struct {
	repo    *repository.NotifikasiRepository
	perm    *repository.PermohonanRepository
	webhook string
	http    *http.Client
}

// NewNotifikasiService creates a NotifikasiService.
func NewNotifikasiService(repo *repository.NotifikasiRepository, perm *repository.PermohonanRepository, cfg *config.Config) *NotifikasiService {
	return &NotifikasiService{
		repo:    repo,
		perm:    perm,
		webhook: cfg.WABotWebhookURL,
		http:    &http.Client{Timeout: 10 * time.Second},
	}
}

// SendInput is the request payload for a notification attempt.
type SendInput struct {
	PermohonanID string
	Channel      string
	Pesan        string
}

// Send records and optionally delivers a notification attempt.
func (s *NotifikasiService) Send(ctx context.Context, in SendInput) (*model.NotifikasiDTO, error) {
	if in.PermohonanID == "" || !platform.ValidUUID(in.PermohonanID) {
		return nil, platform.NotFoundf("Permohonan tidak ditemukan.")
	}
	if in.Channel != model.NotifikasiChannelWa && in.Channel != model.NotifikasiChannelEmail {
		return nil, platform.Validationf("Channel notifikasi tidak valid.")
	}
	if in.Pesan == "" {
		return nil, platform.Validationf("Isi pesan notifikasi wajib diisi.")
	}

	p, err := s.perm.ByID(ctx, in.PermohonanID)
	if err != nil {
		return nil, err
	}

	receiver := p.Email
	if in.Channel == model.NotifikasiChannelWa {
		receiver = p.Phone
	}

	status := modelStatusDelivered()
	if s.webhook != "" {
		if err := s.pushWebhook(ctx, p, in.Channel, in.Pesan); err != nil {
			return nil, platform.NewError(platform.ErrInternal, "Gagal mengirim notifikasi: gateway tidak merespons.")
		}
	}

	return s.repo.Create(ctx, &model.Notifikasi{
		PermohonanID: p.ID,
		Channel:      in.Channel,
		Penerima:     receiver,
		Pesan:        in.Pesan,
		Status:       status,
	})
}

// History returns past notification attempts for a permohonan.
func (s *NotifikasiService) History(ctx context.Context, permohonanID string) ([]model.NotifikasiDTO, error) {
	if !platform.ValidUUID(permohonanID) {
		return nil, platform.NotFoundf("Permohonan tidak ditemukan.")
	}
	return s.repo.ListByPermohonan(ctx, permohonanID)
}

type webhookPayload struct {
	PermohonanID string `json:"permohonan_id"`
	TiketNo      string `json:"tiket_no"`
	Nama         string `json:"nama"`
	Channel      string `json:"channel"`
	Penerima     string `json:"penerima"`
	Pesan        string `json:"pesan"`
}

func (s *NotifikasiService) pushWebhook(ctx context.Context, p *model.Permohonan, channel, pesan string) error {
	receiver := p.Email
	if channel == model.NotifikasiChannelWa {
		receiver = p.Phone
	}
	payload, err := json.Marshal(webhookPayload{
		PermohonanID: p.ID,
		TiketNo:      p.TiketNo,
		Nama:         p.Nama,
		Channel:      channel,
		Penerima:     receiver,
		Pesan:        pesan,
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.webhook, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := s.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("webhook status %d", res.StatusCode)
	}
	return nil
}

func modelStatusDelivered() string { return "TERKIRIM" }
