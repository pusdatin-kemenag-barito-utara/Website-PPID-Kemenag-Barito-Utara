CREATE TABLE IF NOT EXISTS "kemenag_ppid"."konten_seksi" (
	"seksi" varchar(60) PRIMARY KEY NOT NULL,
	"modul" varchar(40) NOT NULL,
	"judul" varchar(120) NOT NULL,
	"deskripsi" text NOT NULL DEFAULT '',
	"isi" jsonb NOT NULL DEFAULT '{}',
	"is_aktif" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "konten_modul_idx" ON "kemenag_ppid"."konten_seksi" ("modul");