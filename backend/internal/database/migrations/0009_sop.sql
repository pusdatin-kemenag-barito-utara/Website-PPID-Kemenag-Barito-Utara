CREATE TABLE IF NOT EXISTS "kemenag_ppid"."sop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"judul" varchar(255) NOT NULL,
	"no_sop" varchar(120) NOT NULL,
	"kategori" varchar(80) NOT NULL DEFAULT 'Layanan Informasi',
	"tgl_terbit" varchar(50) NOT NULL DEFAULT '',
	"ukuran" varchar(30) NOT NULL DEFAULT '',
	"keterangan" text,
	"file_url" varchar(500) NOT NULL DEFAULT '',
	"urutan" int NOT NULL DEFAULT 1,
	"is_aktif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "sop_kategori_idx" ON "kemenag_ppid"."sop" ("kategori");

INSERT INTO "kemenag_ppid"."sop" ("judul", "no_sop", "kategori", "tgl_terbit", "ukuran", "file_url", "urutan")
VALUES
	('SOP Pelayanan Permohonan Informasi Publik PPID', 'SOP/PPID/001/2026', 'Permohonan Informasi', '02 Jan 2026', '1.4 MB', 'https://files.kemenag-baritoutara.com/ppid/informasi-publik/berkala/2026/09/1788403230_Buku_Agenda_Surat_Masuk_2026-08-29.pdf', 1),
	('SOP Pengajuan dan Penanganan Keberatan Informasi Publik', 'SOP/PPID/002/2026', 'Pengajuan Keberatan', '05 Jan 2026', '1.2 MB', 'https://files.kemenag-baritoutara.com/ppid/informasi-publik/berkala/2026/09/1788403230_Buku_Agenda_Surat_Masuk_2026-08-29.pdf', 2),
	('SOP Pengujian Konsekuensi Informasi Dikecualikan', 'SOP/PPID/003/2026', 'Informasi Dikecualikan', '10 Jan 2026', '1.8 MB', 'https://files.kemenag-baritoutara.com/ppid/informasi-publik/berkala/2026/09/1788403230_Buku_Agenda_Surat_Masuk_2026-08-29.pdf', 3),
	('SOP Pengaduan Masyarakat dan Layanan Aspirasi Online', 'SOP/PPID/004/2026', 'Pengaduan Masyarakat', '15 Jan 2026', '1.1 MB', 'https://files.kemenag-baritoutara.com/ppid/informasi-publik/berkala/2026/09/1788403230_Buku_Agenda_Surat_Masuk_2026-08-29.pdf', 4)
ON CONFLICT DO NOTHING;
