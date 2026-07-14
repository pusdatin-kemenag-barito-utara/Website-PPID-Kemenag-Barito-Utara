import { pgTable, pgSchema, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Deklarasi skema kustom (kemenag_ppid)
export const ppidSchema = pgSchema("kemenag_ppid");

// Enum untuk Status Permohonan
export const statusEnum = ppidSchema.enum("status", [
  "MENUNGGU", "DIPROSES", "SELESAI", "DITOLAK"
]);

// Enum untuk Kategori Informasi Publik
export const kategoriInfoEnum = ppidSchema.enum("kategori_info", [
  "BERKALA", "SERTA_MERTA", "SETIAP_SAAT", "DIKECUALIKAN", "REGULASI"
]);

// 1. Tabel Informasi Publik & Regulasi
export const informasiPublik = ppidSchema.table("informasi_publik", {
  id: uuid("id").defaultRandom().primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  kategori: kategoriInfoEnum("kategori").notNull(),
  deskripsi: text("deskripsi"),
  fileUrl: varchar("file_url", { length: 500 }).notNull(), // URL ke Cloudflare R2
  isAktif: boolean("is_aktif").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Tabel Permohonan Informasi (Layanan)
export const permohonanInformasi = ppidSchema.table("permohonan_informasi", {
  id: uuid("id").defaultRandom().primaryKey(),
  trackingId: varchar("tracking_id", { length: 50 }).notNull().unique(), // Contoh: REQ-20260715-XXXX
  namaPemohon: varchar("nama_pemohon", { length: 150 }).notNull(),
  nik: varchar("nik", { length: 16 }).notNull(),
  email: varchar("email", { length: 150 }),
  noHp: varchar("no_hp", { length: 20 }).notNull(),
  rincianInformasi: text("rincian_informasi").notNull(),
  tujuanPenggunaan: text("tujuan_penggunaan").notNull(),
  status: statusEnum("status").default("MENUNGGU"),
  alasanPenolakan: text("alasan_penolakan"),
  fileIdentitas: varchar("file_identitas", { length: 500 }), // URL KTP di Cloudflare R2
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Tabel pusdatin (hanya rujukan profil untuk admin cross-schema auth)
export const pusdatinSchema = pgSchema("kemenag_pusdatin");
export const profiles = pusdatinSchema.table("profiles", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  role: varchar("role", { length: 50 }),
});
