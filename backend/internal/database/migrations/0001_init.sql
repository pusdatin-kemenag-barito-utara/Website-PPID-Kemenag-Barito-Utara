CREATE SCHEMA IF NOT EXISTS "kemenag_ppid";

DO $$
BEGIN
	CREATE TYPE "kemenag_ppid"."kategori_info" AS ENUM('BERKALA', 'SERTA_MERTA', 'SETIAP_SAAT', 'DIKECUALIKAN', 'REGULASI');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "kemenag_ppid"."admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(150) NOT NULL DEFAULT '',
	"role" varchar(30) NOT NULL DEFAULT 'admin',
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "kemenag_ppid"."informasi_publik" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"judul" varchar(255) NOT NULL,
	"kategori" "kemenag_ppid"."kategori_info" NOT NULL,
	"deskripsi" text,
	"file_url" varchar(500) NOT NULL DEFAULT '',
	"is_aktif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "informasi_publik_kategori_idx" ON "kemenag_ppid"."informasi_publik" ("kategori");