package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/auth"
	"github.com/kemenag/ppid-kemenag/backend/internal/config"
	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// EnsureAdminUser creates or updates the configured admin account.
func EnsureAdminUser(ctx context.Context, pool *pgxpool.Pool, cfg *config.Config) error {
	repo := repository.NewUserRepository(pool)

	email := cfg.AdminEmail
	if email == "" {
		return nil
	}

	// Purge any foreign or legacy admin account other than the authorized AdminEmail
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_ppid.admin_users WHERE email != $1`, email)

	existingUser, err := repo.FindByEmail(ctx, email)
	if err != nil && !platform.Is(err, platform.ErrNotFound) {
		return fmt.Errorf("check admin user: %w", err)
	}

	hash, err := auth.HashPassword(cfg.AdminPassword)
	if err != nil {
		return fmt.Errorf("hash seed admin password: %w", err)
	}

	if existingUser != nil {
		// Update password hash if existing
		query := `UPDATE kemenag_ppid.admin_users SET password_hash = $1, active = true, updated_at = NOW() WHERE id = $2`
		_, err := pool.Exec(ctx, query, hash, existingUser.ID)
		if err != nil {
			return fmt.Errorf("sync admin password: %w", err)
		}
		return nil
	}

	fullName := cfg.AdminFullName
	if fullName == "" {
		fullName = "Administrator PPID"
	}

	_, err = repo.Create(ctx, &model.AdminUser{
		Email:        email,
		PasswordHash: hash,
		FullName:     fullName,
		Role:         "admin",
		Active:       true,
	})
	if err != nil {
		return fmt.Errorf("create seed admin: %w", err)
	}

	log.Printf("[seed] admin user %q berhasil dibuat/disinkronkan", email)
	return nil
}

// EnsureSeedData seeds the content tables from the legacy app when empty.
func EnsureSeedData(ctx context.Context, pool *pgxpool.Pool) error {
	infoRepo := repository.NewInformasiRepository(pool)
	regRepo := repository.NewRegulasiRepository(pool)
	permRepo := repository.NewPermohonanRepository(pool)

	infoCount, err := infoRepo.List(ctx, model.InformasiFilter{})
	if err != nil {
		return fmt.Errorf("count informasi_publik: %w", err)
	}
	if len(infoCount) == 0 {
		for i := range initialInformasiDocs {
			if _, err := infoRepo.Create(ctx, &initialInformasiDocs[i]); err != nil {
				return fmt.Errorf("seed informasi %q: %w", initialInformasiDocs[i].Judul, err)
			}
		}
		log.Printf("[seed] %d dokumen informasi publik dimuat", len(initialInformasiDocs))
	}

	regCount, err := regRepo.List(ctx, "", false)
	if err != nil {
		return fmt.Errorf("count regulasi: %w", err)
	}
	if len(regCount) == 0 {
		for i := range initialRegulasi {
			if _, err := regRepo.Create(ctx, &initialRegulasi[i]); err != nil {
				return fmt.Errorf("seed regulasi %q: %w", initialRegulasi[i].Nomor, err)
			}
		}
		log.Printf("[seed] %d dokumen regulasi dimuat", len(initialRegulasi))
	}

	permCount, err := permRepo.List(ctx, "", "")
	if err != nil {
		return fmt.Errorf("count permohonan: %w", err)
	}
	if len(permCount) == 0 {
		for i := range initialPermohonan {
			tiket, err := permRepo.NextTiketNo(ctx)
			if err != nil {
				return fmt.Errorf("seed permohonan tiket: %w", err)
			}
			initialPermohonan[i].TiketNo = tiket
			if _, err := permRepo.Create(ctx, &initialPermohonan[i]); err != nil {
				return fmt.Errorf("seed permohonan %q: %w", initialPermohonan[i].Nama, err)
			}
		}
		log.Printf("[seed] %d permohonan contoh dimuat", len(initialPermohonan))
	}

	return nil
}

// Seed data mirrors the legacy src/lib/informasi-publik-store.ts items.
var initialInformasiDocs = []model.InformasiPublik{
	// 1. Kategori Berkala
	{
		Judul:     "Laporan Kinerja Instansi Pemerintah (LKjIP) Kemenag Barito Utara Tahun 2025",
		Kategori:  model.KategoriBerkala,
		Tanggal:   "10 Jan 2026",
		Ukuran:    "3.4 MB",
		Deskripsi: "Laporan pertanggungjawaban capaian kinerja tahunan instansi.",
		FileURL:   "/documents/lkjip-kemenag-2025.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Rencana Kerja & Anggaran Kementerian/Lembaga (RKA-KL) TA 2026",
		Kategori:  model.KategoriBerkala,
		Tanggal:   "05 Jan 2026",
		Ukuran:    "2.1 MB",
		Deskripsi: "Rincian alokasi anggaran belanja operasional dan program.",
		FileURL:   "/documents/rka-kl-2026.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Laporan Keuangan & Realisasi APBN Tahun Anggaran 2025 (Audited)",
		Kategori:  model.KategoriBerkala,
		Tanggal:   "20 Jan 2026",
		Ukuran:    "4.8 MB",
		Deskripsi: "Laporan realisasi anggaran, neraca keuangan, dan catatan atas laporan keuangan instansi.",
		FileURL:   "/documents/laporan-keuangan-2025.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Ringkasan Program Kerja dan Kegiatan Prioritas Kemenag Barito Utara TA 2026",
		Kategori:  model.KategoriBerkala,
		Tanggal:   "15 Jan 2026",
		Ukuran:    "1.7 MB",
		Deskripsi: "Rencana strategis program bimbingan keagamaan, pendidikan madrasah, dan tata kelola haji.",
		FileURL:   "/documents/program-kerja-2026.pdf",
		IsAktif:   true,
	},

	// 2. Kategori Serta Merta
	{
		Judul:     "Pengumuman Prosedur Keselamatan & Evakuasi Darurat Bencana KUA",
		Kategori:  model.KategoriSertaMerta,
		Tanggal:   "12 Feb 2026",
		Ukuran:    "1.1 MB",
		Deskripsi: "Panduan tanggap darurat evakuasi bencana banjir dan kebakaran di seluruh kantor KUA.",
		FileURL:   "/documents/sop-evakuasi-darurat.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Pemberitahuan Penyesuaian Operasional Layanan Tatap Muka Pasca Cuaca Ekstrem",
		Kategori:  model.KategoriSertaMerta,
		Tanggal:   "18 Feb 2026",
		Ukuran:    "850 KB",
		Deskripsi: "Pemberitahuan perubahan jam operasional kantor sementara demi keselamatan masyarakat dan pegawai.",
		FileURL:   "/documents/penyesuaian-layanan.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Peringatan Dini Waspada Penipuan Mengatasnamakan Panitia PPPK Kemenag",
		Kategori:  model.KategoriSertaMerta,
		Tanggal:   "25 Feb 2026",
		Ukuran:    "920 KB",
		Deskripsi: "Himbauan resmi kepada calon peserta seleksi agar berhati-hati terhadap pihak yang menjanjikan kelulusan.",
		FileURL:   "/documents/waspada-penipuan-pppk.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Protokol Penanganan Darurat Gangguan Jaringan Sistem PTSP Terpadu",
		Kategori:  model.KategoriSertaMerta,
		Tanggal:   "28 Feb 2026",
		Ukuran:    "1.3 MB",
		Deskripsi: "Instruksi peralihan layanan manual sementara saat terjadi kendala koneksi server pusat.",
		FileURL:   "/documents/protokol-ptsp-darurat.pdf",
		IsAktif:   true,
	},

	// 3. Kategori Setiap Saat
	{
		Judul:     "Daftar Informasi Publik (DIP) PPID Kemenag Kabupaten Barito Utara Tahun 2026",
		Kategori:  model.KategoriSetiapSaat,
		Tanggal:   "02 Jan 2026",
		Ukuran:    "1.8 MB",
		Deskripsi: "Katalog master seluruh dokumen publik resmi yang wajib disediakan dan diumumkan secara terbuka.",
		FileURL:   "/documents/daftar-informasi-publik-2026.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Standar Operasional Prosedur (SOP) Permohonan Informasi & Pengaduan Warga",
		Kategori:  model.KategoriSetiapSaat,
		Tanggal:   "03 Jan 2026",
		Ukuran:    "1.5 MB",
		Deskripsi: "Petunjuk teknis dan tahapan masyarakat dalam mengajukan permohonan informasi hingga penyelesaian.",
		FileURL:   "/documents/sop-layanan-ppid.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Buku Pedoman Tata Naskah Dinas & Administrasi Resmi Kementerian Agama RI",
		Kategori:  model.KategoriSetiapSaat,
		Tanggal:   "04 Jan 2026",
		Ukuran:    "5.2 MB",
		Deskripsi: "Panduan standarisasi format surat, naskah dinas, dan pengarsipan Kementerian Agama.",
		FileURL:   "/documents/pedoman-tata-naskah.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Daftar Profil, Tugas Pokok, Fungsi, dan Pejabat Struktural Kemenag Barito Utara",
		Kategori:  model.KategoriSetiapSaat,
		Tanggal:   "06 Jan 2026",
		Ukuran:    "2.4 MB",
		Deskripsi: "Rincian tugas pokok bidang haji, bimas islam, pendis, dan sekretariat.",
		FileURL:   "/documents/profil-pejabat-tusi.pdf",
		IsAktif:   true,
	},

	// 4. Kategori Dikecualikan
	{
		Judul:     "SK Penetapan Uji Konsekuensi Informasi yang Dikecualikan PPID Tahun 2026",
		Kategori:  model.KategoriDikecualikan,
		Tanggal:   "15 Jan 2026",
		Ukuran:    "1.9 MB",
		Deskripsi: "Keputusan penetapan klasifikasi dokumen yang dirahasiakan sesuai Pasal 17 UU No. 14 Tahun 2008.",
		FileURL:   "/documents/sk-uji-konsekuensi-2026.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Berita Acara Hasil Uji Konsekuensi Dokumen Rahasia Jabatan & Data Pribadi Pegawai",
		Kategori:  model.KategoriDikecualikan,
		Tanggal:   "16 Jan 2026",
		Ukuran:    "2.3 MB",
		Deskripsi: "Dokumen pertimbangan hukum pengecualian informasi rekam medis, data pribadi, dan penilaian kinerja ASN.",
		FileURL:   "/documents/ba-uji-konsekuensi.pdf",
		IsAktif:   true,
	},
	{
		Judul:     "Daftar Rekapitulasi Informasi Rahasia Negara & Dokumen Pengadaan yang Dikecualikan",
		Kategori:  model.KategoriDikecualikan,
		Tanggal:   "19 Jan 2026",
		Ukuran:    "1.4 MB",
		Deskripsi: "Ringkasan dokumen yang belum dapat dibuka sebelum penetapan pemenang lelang resmi.",
		FileURL:   "/documents/rekap-informasi-dikecualikan.pdf",
		IsAktif:   true,
	},
}

// Seed data mirrors the legacy src/lib/regulasi-store.ts items.
var initialRegulasi = []model.Regulasi{
	{
		Nomor:      "UU No. 14 Tahun 2008",
		Tahun:      "2008",
		Judul:      "Undang-Undang Republik Indonesia Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik",
		Kategori:   "Undang-Undang",
		TglTerbit:  "30 Apr 2008",
		Ukuran:     "2.8 MB",
		Keterangan: "Landasan hukum utama keterbukaan dan kewajiban penyediaan informasi publik.",
		IsAktif:    true,
	},
	{
		Nomor:      "PP No. 61 Tahun 2010",
		Tahun:      "2010",
		Judul:      "Peraturan Pemerintah Republik Indonesia Nomor 61 Tahun 2010 tentang Pelaksanaan UU KIP",
		Kategori:   "Peraturan Pemerintah",
		TglTerbit:  "23 Agu 2010",
		Ukuran:     "1.9 MB",
		Keterangan: "Aturan pelaksanaan tata cara pelayanan dan penetapan PPID di instansi pemerintah.",
		IsAktif:    true,
	},
	{
		Nomor:      "PMA No. 46 Tahun 2014",
		Tahun:      "2014",
		Judul:      "Peraturan Menteri Agama No. 46 Tahun 2014 tentang Pengelolaan Pelayanan Informasi Publik Kementerian Agama",
		Kategori:   "Peraturan Menteri",
		TglTerbit:  "15 Okt 2014",
		Ukuran:     "2.4 MB",
		Keterangan: "Pedoman tata kelola PPID khusus di lingkungan Kementerian Agama.",
		IsAktif:    true,
	},
	{
		Nomor:      "KMA No. 657 Tahun 2021",
		Tahun:      "2021",
		Judul:      "Keputusan Menteri Agama No. 657 Tahun 2021 tentang Rencana Strategis Kementerian Agama",
		Kategori:   "Keputusan Menteri",
		TglTerbit:  "10 Jun 2021",
		Ukuran:     "3.1 MB",
		Keterangan: "Arah kebijakan dan target indikator kinerja pelayanan Kementerian Agama.",
		IsAktif:    true,
	},
	{
		Nomor:      "SK Kakan Kemenag No. 01/2026",
		Tahun:      "2026",
		Judul:      "Keputusan Kepala Kantor Kemenag Barito Utara tentang Penunjukan Pengelola PPID TA 2026",
		Kategori:   "SK Kepala Kantor",
		TglTerbit:  "02 Jan 2026",
		Ukuran:     "1.2 MB",
		Keterangan: "SK struktur susunan tim pelaksana & penanggung jawab PPID Kemenag Barito Utara.",
		IsAktif:    true,
	},
}

// Seed data mirrors the legacy admin mock requests.
var initialPermohonan = []model.Permohonan{
	{
		Jenis:   model.JenisPermintaanPermohonan,
		Nama:    "Muhammad Nazilah",
		NIK:     "6205011608900001",
		Email:   "budi.santoso@gmail.com",
		Phone:   "081234567890",
		Rincian: "Permohonan Data Realisasi Anggaran PPID Tahun 2025",
		Tujuan:  "Penelitian dan analisis anggaran",
		Status:  model.StatusMenunggu,
	},
	{
		Jenis:   model.JenisPermintaanPermohonan,
		Nama:    "Sintya Wati",
		NIK:     "6205014507920002",
		Email:   "siti.rahmah@yahoo.com",
		Phone:   "085298765432",
		Rincian: "Permohonan Informasi Struktur Kepegawaian dan Formasi CPNS",
		Tujuan:  "Persiapan seleksi aparatur",
		Status:  model.StatusDiproses,
	},
	{
		Jenis:   model.JenisPermintaanPermohonan,
		Nama:    "Cimol",
		NIK:     "6205011201900003",
		Email:   "ahmad.hidayat@gmail.com",
		Phone:   "081345678901",
		Rincian: "Permohonan SOP Layanan Pengaduan Masyarakat",
		Tujuan:  "Pemenuhan substansi laporan KIP",
		Status:  model.StatusSelesai,
	},
}
