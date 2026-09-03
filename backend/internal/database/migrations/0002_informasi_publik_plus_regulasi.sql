ALTER TABLE "kemenag_ppid"."informasi_publik"
	ADD COLUMN IF NOT EXISTS "tanggal" varchar(50) NOT NULL DEFAULT '',
	ADD COLUMN IF NOT EXISTS "ukuran" varchar(30) NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS "kemenag_ppid"."regulasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nomor" varchar(120) NOT NULL,
	"tahun" varchar(10) NOT NULL DEFAULT '',
	"judul" varchar(255) NOT NULL,
	"kategori" varchar(60) NOT NULL DEFAULT 'Undang-Undang',
	"tgl_terbit" varchar(50) NOT NULL DEFAULT '',
	"ukuran" varchar(30) NOT NULL DEFAULT '',
	"keterangan" text,
	"file_url" varchar(500) NOT NULL DEFAULT '',
	"is_aktif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "regulasi_kategori_idx" ON "kemenag_ppid"."regulasi" ("kategori");