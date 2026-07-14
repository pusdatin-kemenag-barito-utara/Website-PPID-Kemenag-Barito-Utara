CREATE SCHEMA IF NOT EXISTS "kemenag_ppid";
--> statement-breakpoint

CREATE TYPE "kemenag_ppid"."kategori_info" AS ENUM('BERKALA', 'SERTA_MERTA', 'SETIAP_SAAT', 'DIKECUALIKAN', 'REGULASI');--> statement-breakpoint
CREATE TYPE "kemenag_ppid"."status" AS ENUM('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');--> statement-breakpoint
CREATE TABLE "kemenag_ppid"."informasi_publik" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"judul" varchar(255) NOT NULL,
	"kategori" "kemenag_ppid"."kategori_info" NOT NULL,
	"deskripsi" text,
	"file_url" varchar(500) NOT NULL,
	"is_aktif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kemenag_ppid"."permohonan_informasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracking_id" varchar(50) NOT NULL,
	"nama_pemohon" varchar(150) NOT NULL,
	"nik" varchar(16) NOT NULL,
	"email" varchar(150),
	"no_hp" varchar(20) NOT NULL,
	"rincian_informasi" text NOT NULL,
	"tujuan_penggunaan" text NOT NULL,
	"status" "kemenag_ppid"."status" DEFAULT 'MENUNGGU',
	"alasan_penolakan" text,
	"file_identitas" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "permohonan_informasi_tracking_id_unique" UNIQUE("tracking_id")
);
--> statement-breakpoint
