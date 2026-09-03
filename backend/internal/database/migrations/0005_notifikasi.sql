CREATE TABLE IF NOT EXISTS "kemenag_ppid"."notifikasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"permohonan_id" uuid NOT NULL REFERENCES "kemenag_ppid"."permohonan" ("id") ON DELETE CASCADE,
	"channel" varchar(20) NOT NULL DEFAULT 'wa',
	"penerima" varchar(200) NOT NULL DEFAULT '',
	"pesan" text NOT NULL DEFAULT '',
	"status" varchar(20) NOT NULL DEFAULT 'TERKIRIM',
	"created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "notifikasi_permohonan_idx"
	ON "kemenag_ppid"."notifikasi" ("permohonan_id", "created_at");