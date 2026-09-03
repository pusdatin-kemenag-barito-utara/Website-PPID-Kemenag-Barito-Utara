-- Migration 0008: Fix permohonan column constraints
ALTER TABLE "kemenag_ppid"."permohonan" ALTER COLUMN "tiket_terkait" DROP NOT NULL;
ALTER TABLE "kemenag_ppid"."permohonan" ALTER COLUMN "tiket_terkait" SET DEFAULT '';
