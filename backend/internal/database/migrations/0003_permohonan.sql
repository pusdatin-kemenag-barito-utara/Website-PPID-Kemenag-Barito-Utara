CREATE SEQUENCE IF NOT EXISTS "kemenag_ppid"."permohonan_seq";

CREATE TABLE IF NOT EXISTS "kemenag_ppid"."permohonan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tiket_no" varchar(40) NOT NULL UNIQUE,
	"jenis" varchar(20) NOT NULL DEFAULT 'PERMOHONAN',
	"nama" varchar(160) NOT NULL,
	"nik" varchar(40) NOT NULL DEFAULT '',
	"email" varchar(160) NOT NULL DEFAULT '',
	"phone" varchar(40) NOT NULL DEFAULT '',
	"rincian" text,
	"tujuan" text,
	"alasan" text,
	"tiket_terkait" varchar(40) NOT NULL DEFAULT '',
	"status" varchar(20) NOT NULL DEFAULT 'MENUNGGU',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "permohonan_status_idx" ON "kemenag_ppid"."permohonan" ("status");
CREATE INDEX IF NOT EXISTS "permohonan_jenis_idx" ON "kemenag_ppid"."permohonan" ("jenis");
CREATE INDEX IF NOT EXISTS "permohonan_tiket_idx" ON "kemenag_ppid"."permohonan" ("tiket_no");