package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

type PBField struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	PrimaryKey  bool   `json:"primaryKey,omitempty"`
	Required    bool   `json:"required,omitempty"`
	Hidden      bool   `json:"hidden,omitempty"`
	Min         int    `json:"min,omitempty"`
	Max         int    `json:"max,omitempty"`
	Pattern     string `json:"pattern,omitempty"`
	Presentable bool   `json:"presentable,omitempty"`
}

type PBCollectionDef struct {
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	ListRule   *string   `json:"listRule"`
	ViewRule   *string   `json:"viewRule"`
	CreateRule *string   `json:"createRule"`
	UpdateRule *string   `json:"updateRule"`
	DeleteRule *string   `json:"deleteRule"`
	Fields     []PBField `json:"fields"`
}

func strPtr(s string) *string {
	return &s
}

func getTableDefinitions() map[string]PBCollectionDef {
	publicRule := strPtr("")
	adminOnlyRule := (*string)(nil)

	idField := PBField{
		Name:       "id",
		Type:       "text",
		PrimaryKey: true,
		Required:   true,
		Min:        1,
		Max:        64,
		Pattern:    `^[a-zA-Z0-9_.-]+$`,
	}

	return map[string]PBCollectionDef{
		"admin_users": {
			Name:       "admin_users",
			Type:       "base",
			ListRule:   adminOnlyRule,
			ViewRule:   adminOnlyRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "email", Type: "email", Required: true},
				{Name: "password_hash", Type: "text", Hidden: true},
				{Name: "full_name", Type: "text"},
				{Name: "role", Type: "text"},
				{Name: "active", Type: "bool"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"data_infografis": {
			Name:       "data_infografis",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "judul", Type: "text", Required: true},
				{Name: "kategori", Type: "text"},
				{Name: "tanggal", Type: "text"},
				{Name: "deskripsi", Type: "text"},
				{Name: "image_url", Type: "text"},
				{Name: "is_aktif", Type: "bool"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"data_statistik": {
			Name:       "data_statistik",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "label", Type: "text", Required: true},
				{Name: "nilai", Type: "text"},
				{Name: "satuan", Type: "text"},
				{Name: "kategori", Type: "text"},
				{Name: "deskripsi", Type: "text"},
				{Name: "urutan", Type: "number"},
				{Name: "is_aktif", Type: "bool"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"informasi_publik": {
			Name:       "informasi_publik",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "judul", Type: "text", Required: true},
				{Name: "kategori", Type: "text"},
				{Name: "deskripsi", Type: "text"},
				{Name: "file_url", Type: "text"},
				{Name: "tanggal", Type: "text"},
				{Name: "ukuran", Type: "text"},
				{Name: "is_aktif", Type: "bool"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"konten_seksi": {
			Name:       "konten_seksi",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "seksi", Type: "text"},
				{Name: "modul", Type: "text"},
				{Name: "judul", Type: "text"},
				{Name: "deskripsi", Type: "text"},
				{Name: "isi", Type: "json"},
				{Name: "is_aktif", Type: "bool"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"notifikasi": {
			Name:       "notifikasi",
			Type:       "base",
			ListRule:   adminOnlyRule,
			ViewRule:   adminOnlyRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "permohonan_id", Type: "text"},
				{Name: "channel", Type: "text"},
				{Name: "penerima", Type: "text"},
				{Name: "pesan", Type: "text"},
				{Name: "status", Type: "text"},
				{Name: "created_at", Type: "text"},
			},
		},
		"permohonan": {
			Name:       "permohonan",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: publicRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "tiket_no", Type: "text", Required: true},
				{Name: "jenis", Type: "text"},
				{Name: "nama", Type: "text"},
				{Name: "nik", Type: "text"},
				{Name: "email", Type: "text"},
				{Name: "phone", Type: "text"},
				{Name: "rincian", Type: "text"},
				{Name: "tujuan", Type: "text"},
				{Name: "alasan", Type: "text"},
				{Name: "tiket_terkait", Type: "text"},
				{Name: "status", Type: "text"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"permohonan_informasi": {
			Name:       "permohonan_informasi",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: publicRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "tracking_id", Type: "text"},
				{Name: "nama_pemohon", Type: "text"},
				{Name: "nik", Type: "text"},
				{Name: "email", Type: "text"},
				{Name: "no_hp", Type: "text"},
				{Name: "rincian_informasi", Type: "text"},
				{Name: "tujuan_penggunaan", Type: "text"},
				{Name: "status", Type: "text"},
				{Name: "alasan_penolakan", Type: "text"},
				{Name: "file_identitas", Type: "text"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"regulasi": {
			Name:       "regulasi",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "nomor", Type: "text", Required: true},
				{Name: "tahun", Type: "text"},
				{Name: "judul", Type: "text"},
				{Name: "kategori", Type: "text"},
				{Name: "tgl_terbit", Type: "text"},
				{Name: "ukuran", Type: "text"},
				{Name: "keterangan", Type: "text"},
				{Name: "file_url", Type: "text"},
				{Name: "is_aktif", Type: "bool"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
		"schema_migrations": {
			Name:       "schema_migrations",
			Type:       "base",
			ListRule:   adminOnlyRule,
			ViewRule:   adminOnlyRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "version", Type: "text"},
				{Name: "applied_at", Type: "text"},
			},
		},
		"sop": {
			Name:       "sop",
			Type:       "base",
			ListRule:   publicRule,
			ViewRule:   publicRule,
			CreateRule: adminOnlyRule,
			UpdateRule: adminOnlyRule,
			DeleteRule: adminOnlyRule,
			Fields: []PBField{
				idField,
				{Name: "judul", Type: "text", Required: true},
				{Name: "no_sop", Type: "text"},
				{Name: "kategori", Type: "text"},
				{Name: "tgl_terbit", Type: "text"},
				{Name: "ukuran", Type: "text"},
				{Name: "keterangan", Type: "text"},
				{Name: "file_url", Type: "text"},
				{Name: "urutan", Type: "number"},
				{Name: "is_aktif", Type: "bool"},
				{Name: "created_at", Type: "text"},
				{Name: "updated_at", Type: "text"},
			},
		},
	}
}

type PBClient struct {
	baseURL string
	client  *http.Client
	token   string
}

func newPBClient(baseURL, email, pass string) (*PBClient, error) {
	client := &http.Client{Timeout: 30 * time.Second}

	// Login as superuser
	loginPayload := map[string]string{
		"identity": email,
		"password": pass,
	}
	body, _ := json.Marshal(loginPayload)
	resp, err := client.Post(strings.TrimRight(baseURL, "/")+"/api/collections/_superusers/auth-with-password", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("superuser login request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("superuser login failed (%d): %s", resp.StatusCode, string(respBody))
	}

	var res struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("decode login response: %w", err)
	}

	return &PBClient{baseURL: strings.TrimRight(baseURL, "/"), client: client, token: res.Token}, nil
}

func (p *PBClient) do(method, path string, payload interface{}) (*http.Response, error) {
	var bodyReader io.Reader
	if payload != nil {
		b, err := json.Marshal(payload)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, p.baseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", p.token)
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	return p.client.Do(req)
}

func main() {
	log.Println("=== MEMULAI MIGRASI POSTGRESQL (kemenag_ppid) -> POCKETBASE ===")
	ctx := context.Background()

	pbBaseURL := getEnv("POCKETBASE_URL", "")
	adminEmail := getEnv("POCKETBASE_ADMIN_EMAIL", getEnv("ADMIN_EMAIL", ""))
	adminPass := getEnv("POCKETBASE_ADMIN_PASSWORD", getEnv("ADMIN_PASSWORD", ""))
	postgresURL := getEnv("LEGACY_POSTGRES_URL", "")

	if pbBaseURL == "" || adminEmail == "" || adminPass == "" {
		log.Fatalf("POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, dan POCKETBASE_ADMIN_PASSWORD wajib diset via environment variable / Infisical")
	}
	if postgresURL == "" {
		log.Fatalf("LEGACY_POSTGRES_URL wajib diset via environment variable")
	}

	// 1. Koneksi ke PostgreSQL Legacy
	log.Println("[1/5] Menghubungkan ke PostgreSQL Legacy...")
	cfg, err := pgxpool.ParseConfig(postgresURL)
	if err != nil {
		log.Fatalf("Parse database config error: %v", err)
	}
	cfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	pgPool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		log.Fatalf("Gagal terhubung ke PostgreSQL: %v", err)
	}
	defer pgPool.Close()

	if err := pgPool.Ping(ctx); err != nil {
		log.Fatalf("Ping ke PostgreSQL gagal: %v", err)
	}
	log.Println("Berhasil terhubung ke PostgreSQL!")

	// 2. Koneksi ke PocketBase
	log.Println("[2/5] Menghubungkan & login superuser ke PocketBase...")
	pb, err := newPBClient(pbBaseURL, adminEmail, adminPass)
	if err != nil {
		log.Fatalf("Gagal inisialisasi PocketBase client: %v", err)
	}
	log.Println("Berhasil login superuser ke PocketBase!")

	// 3. Pastikan direktori backup lokal tersedia
	backupDir := filepath.Join(".", "backup_data")
	_ = os.MkdirAll(backupDir, 0755)

	// Ambil daftar collection yang ada di PocketBase
	resp, err := pb.do("GET", "/api/collections?perPage=200", nil)
	if err != nil {
		log.Fatalf("Gagal mengambil collections: %v", err)
	}
	var existingColRes struct {
		Items []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"items"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&existingColRes)
	resp.Body.Close()

	existingCols := make(map[string]string)
	for _, it := range existingColRes.Items {
		existingCols[it.Name] = it.ID
	}

	tableDefs := getTableDefinitions()
	tables := []string{
		"admin_users",
		"data_infografis",
		"data_statistik",
		"informasi_publik",
		"konten_seksi",
		"notifikasi",
		"permohonan",
		"permohonan_informasi",
		"regulasi",
		"schema_migrations",
		"sop",
	}

	// 4. Buat / Siapkan Collection di PocketBase
	log.Println("[3/5] Memastikan seluruh 11 Collection ada di PocketBase...")
	for _, tableName := range tables {
		def, ok := tableDefs[tableName]
		if !ok {
			continue
		}

		if colID, exists := existingCols[tableName]; exists {
			log.Printf("Collection '%s' sudah ada (ID: %s).", tableName, colID)
		} else {
			log.Printf("Membuat collection '%s' di PocketBase...", tableName)
			createResp, err := pb.do("POST", "/api/collections", def)
			if err != nil {
				log.Fatalf("Request create collection %s gagal: %v", tableName, err)
			}
			bodyBytes, _ := io.ReadAll(createResp.Body)
			createResp.Body.Close()
			if createResp.StatusCode >= 300 {
				log.Fatalf("Gagal membuat collection %s (%d): %s", tableName, createResp.StatusCode, string(bodyBytes))
			}
			log.Printf("Collection '%s' berhasil dibuat!", tableName)
		}
	}

	// 5. Ekstrak Data dari PostgreSQL dan Masukkan ke PocketBase
	log.Println("[4/5] Memigrasikan seluruh data tabel dari PostgreSQL ke PocketBase...")
	type MigrationResult struct {
		Table      string
		PgCount    int
		PBCount    int
		MigratedOK bool
	}
	var results []MigrationResult

	for _, tableName := range tables {
		// Hitung jumlah baris di PostgreSQL
		var pgCount int
		err := pgPool.QueryRow(ctx, fmt.Sprintf(`SELECT COUNT(*) FROM "kemenag_ppid"."%s"`, tableName)).Scan(&pgCount)
		if err != nil {
			log.Fatalf("Gagal menghitung baris tabel %s: %v", tableName, err)
		}

		log.Printf("--> Memproses tabel '%s' (%d baris)...", tableName, pgCount)

		// Ambil seluruh baris sebagai JSON
		query := fmt.Sprintf(`SELECT row_to_json(t)::text FROM "kemenag_ppid"."%s" t`, tableName)
		rows, err := pgPool.Query(ctx, query)
		if err != nil {
			log.Fatalf("Gagal query tabel %s: %v", tableName, err)
		}

		var records []map[string]interface{}
		for rows.Next() {
			var jsonStr string
			if err := rows.Scan(&jsonStr); err != nil {
				log.Fatalf("Scan error di tabel %s: %v", tableName, err)
			}
			var record map[string]interface{}
			if err := json.Unmarshal([]byte(jsonStr), &record); err != nil {
				log.Fatalf("Unmarshal error di tabel %s: %v", tableName, err)
			}
			records = append(records, record)
		}
		rows.Close()

		// Simpan backup lokal dalam format JSON
		backupPath := filepath.Join(backupDir, fmt.Sprintf("%s.json", tableName))
		rawJsonBytes, _ := json.MarshalIndent(records, "", "  ")
		if err := os.WriteFile(backupPath, rawJsonBytes, 0644); err != nil {
			log.Printf("Peringatan: Gagal menyimpan backup %s: %v", backupPath, err)
		} else {
			log.Printf("Backup lokal tersimpan: %s", backupPath)
		}

		// Masukkan setiap record ke PocketBase
		migratedRows := 0
		for _, rec := range records {
			// Normalisasi ID untuk tabel tanpa kolom 'id'
			switch tableName {
			case "konten_seksi":
				if seksiVal, ok := rec["seksi"].(string); ok {
					rec["id"] = seksiVal
				}
			case "schema_migrations":
				if verVal, ok := rec["version"].(string); ok {
					rec["id"] = strings.ReplaceAll(verVal, ".", "_")
				}
			}

			recID, _ := rec["id"].(string)
			if recID == "" {
				log.Fatalf("Record di %s tidak memiliki ID valid: %+v", tableName, rec)
			}

			// Cek apakah record sudah ada
			checkResp, err := pb.do("GET", fmt.Sprintf("/api/collections/%s/records/%s", tableName, recID), nil)
			if err == nil && checkResp.StatusCode == http.StatusOK {
				checkResp.Body.Close()
				// Update / patch
				patchResp, err := pb.do("PATCH", fmt.Sprintf("/api/collections/%s/records/%s", tableName, recID), rec)
				if err != nil {
					log.Fatalf("Gagal PATCH %s/%s: %v", tableName, recID, err)
				}
				patchResp.Body.Close()
				migratedRows++
				continue
			}
			if checkResp != nil {
				checkResp.Body.Close()
			}

			// Insert / create
			postResp, err := pb.do("POST", fmt.Sprintf("/api/collections/%s/records", tableName), rec)
			if err != nil {
				log.Fatalf("Gagal POST %s record %s: %v", tableName, recID, err)
			}
			if postResp.StatusCode >= 300 {
				body, _ := io.ReadAll(postResp.Body)
				postResp.Body.Close()
				log.Fatalf("Gagal insert record ke %s (%d): %s (data: %+v)", tableName, postResp.StatusCode, string(body), rec)
			}
			postResp.Body.Close()
			migratedRows++
		}

		// Verifikasi totalItems di PocketBase
		countResp, err := pb.do("GET", fmt.Sprintf("/api/collections/%s/records?perPage=1", tableName), nil)
		var pbCount int
		if err == nil && countResp.StatusCode == http.StatusOK {
			var pageRes struct {
				TotalItems int `json:"totalItems"`
			}
			_ = json.NewDecoder(countResp.Body).Decode(&pageRes)
			pbCount = pageRes.TotalItems
		}
		if countResp != nil {
			countResp.Body.Close()
		}

		results = append(results, MigrationResult{
			Table:      tableName,
			PgCount:    pgCount,
			PBCount:    pbCount,
			MigratedOK: pgCount == pbCount,
		})
	}

	// 6. Pastikan juga admin ada di collection auth 'users'
	log.Println("[5/5] Memastikan admin user terdaftar di auth collection 'users'...")
	checkUserResp, err := pb.do("GET", fmt.Sprintf("/api/collections/users/records?filter=(email='%s')", adminEmail), nil)
	var userFound bool
	if err == nil && checkUserResp.StatusCode == http.StatusOK {
		var uRes struct {
			TotalItems int `json:"totalItems"`
		}
		_ = json.NewDecoder(checkUserResp.Body).Decode(&uRes)
		userFound = uRes.TotalItems > 0
	}
	if checkUserResp != nil {
		checkUserResp.Body.Close()
	}

	if !userFound {
		log.Printf("Menambahkan user '%s' ke auth collection 'users'...", adminEmail)
		userPayload := map[string]interface{}{
			"email":           adminEmail,
			"password":        adminPass,
			"passwordConfirm": adminPass,
			"name":            "Administrator PPID Barito Utara",
			"verified":        true,
			"emailVisibility": true,
		}
		createUResp, err := pb.do("POST", "/api/collections/users/records", userPayload)
		if err != nil {
			log.Printf("Warning: Gagal membuat user di users auth: %v", err)
		} else {
			if createUResp.StatusCode >= 300 {
				b, _ := io.ReadAll(createUResp.Body)
				log.Printf("Warning create user (%d): %s", createUResp.StatusCode, string(b))
			} else {
				log.Println("User admin berhasil didaftarkan di 'users' auth collection!")
			}
			createUResp.Body.Close()
		}
	} else {
		log.Printf("User '%s' sudah terdaftar di 'users' auth collection.", adminEmail)
	}

	// CETAK LAPORAN REKAPITULASI
	fmt.Println("\n=========================================================================")
	fmt.Println("             HASIL MIGRASI POSTGRESQL -> POCKETBASE PPID                 ")
	fmt.Println("=========================================================================")
	fmt.Printf("%-24s | %-12s | %-14s | %-10s\n", "Nama Tabel/Collection", "PostgreSQL", "PocketBase", "Status")
	fmt.Println("-------------------------------------------------------------------------")
	allSuccess := true
	for _, r := range results {
		statusStr := "BERHASIL (OK)"
		if !r.MigratedOK {
			statusStr = "SELISIH (!)"
			allSuccess = false
		}
		fmt.Printf("%-24s | %-12d | %-14d | %-10s\n", r.Table, r.PgCount, r.PBCount, statusStr)
	}
	fmt.Println("=========================================================================")
	if allSuccess {
		fmt.Println("SEMUA TABEL DAN DATA BERHASIL DIMIGRASIKAN 100% TANPA ADA YG TERTINGGAL!")
	} else {
		fmt.Println("ADA KETIDAKSESUAIAN DATA, SILAKAN PERIKSA LOG DI ATAS.")
	}
}
