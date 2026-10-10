package database

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/kemenag/ppid-kemenag/backend/internal/pocketbase"
)

// CollectionIndexes maps collection names to their required SQLite B-Tree index DDL definitions.
var CollectionIndexes = map[string][]string{
	"permohonan": {
		"CREATE UNIQUE INDEX `idx_permohonan_tiket` ON `permohonan` (`tiket_no`)",
		"CREATE INDEX `idx_permohonan_status_created` ON `permohonan` (`status`, `created_at`)",
	},
	"informasi_publik": {
		"CREATE INDEX `idx_info_kategori_aktif` ON `informasi_publik` (`is_aktif`, `kategori`, `created_at`)",
	},
	"regulasi": {
		"CREATE INDEX `idx_regulasi_kategori_aktif` ON `regulasi` (`is_aktif`, `kategori`, `created_at`)",
	},
	"sop": {
		"CREATE INDEX `idx_sop_urutan` ON `sop` (`is_aktif`, `urutan`)",
	},
	"data_statistik": {
		"CREATE INDEX `idx_data_stat_urutan` ON `data_statistik` (`is_aktif`, `urutan`)",
	},
	"data_infografis": {
		"CREATE INDEX `idx_data_infografis_aktif` ON `data_infografis` (`is_aktif`, `created_at`)",
	},
	"notifikasi": {
		"CREATE INDEX `idx_notif_permohonan` ON `notifikasi` (`permohonan_id`, `created_at`)",
	},
	"admin_users": {
		"CREATE UNIQUE INDEX `idx_admin_users_email` ON `admin_users` (`email`)",
	},
}

// EnsureIndexes applies the database indexes to PocketBase collections idempotently.
func EnsureIndexes(ctx context.Context, pb *pocketbase.Client) error {
	for colName, requiredIndexes := range CollectionIndexes {
		resp, err := pb.Request(http.MethodGet, "/api/collections/"+colName, nil, nil)
		if err != nil {
			log.Printf("[indexes] warning: skip %s: %v", colName, err)
			continue
		}
		b, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("[indexes] collection %s not found (HTTP %d)", colName, resp.StatusCode)
			continue
		}

		var colData struct {
			Indexes []string `json:"indexes"`
		}
		if err := json.Unmarshal(b, &colData); err != nil {
			log.Printf("[indexes] parse %s indexes err: %v", colName, err)
			continue
		}

		// Check if all required indexes are already present
		existingSet := make(map[string]bool)
		for _, idx := range colData.Indexes {
			normalized := strings.ToLower(strings.Join(strings.Fields(idx), " "))
			existingSet[normalized] = true
		}

		allPresent := true
		newIndexes := append([]string{}, colData.Indexes...)
		for _, req := range requiredIndexes {
			normalized := strings.ToLower(strings.Join(strings.Fields(req), " "))
			if !existingSet[normalized] {
				allPresent = false
				newIndexes = append(newIndexes, req)
			}
		}

		if allPresent {
			continue
		}

		patchPayload := map[string]interface{}{
			"indexes": newIndexes,
		}

		patchResp, err := pb.Request(http.MethodPatch, "/api/collections/"+colName, nil, patchPayload)
		if err != nil {
			log.Printf("[indexes] patch %s err: %v", colName, err)
			continue
		}
		patchBody, _ := io.ReadAll(patchResp.Body)
		patchResp.Body.Close()

		if patchResp.StatusCode != http.StatusOK {
			log.Printf("[indexes] failed to patch %s (HTTP %d): %s", colName, patchResp.StatusCode, string(patchBody))
		} else {
			log.Printf("[indexes] successfully applied B-Tree indexes for collection: %s (%d total)", colName, len(newIndexes))
		}
	}
	return nil
}
