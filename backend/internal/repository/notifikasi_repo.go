package repository

import (
	"context"
	"fmt"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/pocketbase"
)

// NotifikasiRepository persists notification attempts in PocketBase.
type NotifikasiRepository struct {
	pb *pocketbase.Client
}

// NewNotifikasiRepository creates a NotifikasiRepository backed by PocketBase.
func NewNotifikasiRepository(pb *pocketbase.Client) *NotifikasiRepository {
	return &NotifikasiRepository{pb: pb}
}

// Create stores a notification attempt.
func (r *NotifikasiRepository) Create(ctx context.Context, n *model.Notifikasi) (*model.NotifikasiDTO, error) {
	data := map[string]interface{}{
		"permohonan_id": n.PermohonanID,
		"channel":       n.Channel,
		"penerima":      n.Penerima,
		"pesan":         n.Pesan,
		"status":        n.Status,
	}
	if n.ID != "" {
		data["id"] = n.ID
	}

	rec, err := r.pb.CreateRecord("notifikasi", data)
	if err != nil {
		return nil, err
	}

	n.ID, _ = rec["id"].(string)
	n.CreatedAt = pocketbase.ParsePBTime(rec["created_at"])
	if rec["created_at"] == nil {
		n.CreatedAt = pocketbase.ParsePBTime(rec["created"])
	}

	return toNotifikasiDTO(n), nil
}

// ListByPermohonan returns notification history for a permohonan.
func (r *NotifikasiRepository) ListByPermohonan(ctx context.Context, permohonanID string) ([]model.NotifikasiDTO, error) {
	filter := fmt.Sprintf("permohonan_id='%s'", permohonanID)
	items, _, err := r.pb.ListRecords("notifikasi", filter, "-created_at", 1, 100)
	if err != nil {
		return nil, err
	}

	res := make([]model.NotifikasiDTO, 0, len(items))
	for _, it := range items {
		id, _ := it["id"].(string)
		pid, _ := it["permohonan_id"].(string)
		ch, _ := it["channel"].(string)
		pen, _ := it["penerima"].(string)
		pes, _ := it["pesan"].(string)
		st, _ := it["status"].(string)
		createdAt := pocketbase.ParsePBTime(it["created_at"])
		if it["created_at"] == nil {
			createdAt = pocketbase.ParsePBTime(it["created"])
		}

		res = append(res, model.NotifikasiDTO{
			ID:           id,
			PermohonanID: pid,
			Channel:      ch,
			Penerima:     pen,
			Pesan:        pes,
			Status:       st,
			CreatedAt:    createdAt,
		})
	}
	return res, nil
}

func toNotifikasiDTO(n *model.Notifikasi) *model.NotifikasiDTO {
	return &model.NotifikasiDTO{
		ID:           n.ID,
		PermohonanID: n.PermohonanID,
		Channel:      n.Channel,
		Penerima:     n.Penerima,
		Pesan:        n.Pesan,
		Status:       n.Status,
		CreatedAt:    n.CreatedAt,
	}
}
