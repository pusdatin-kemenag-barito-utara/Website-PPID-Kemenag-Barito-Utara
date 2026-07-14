# Product Requirements Document (PRD)
## Website PPID Kemenag Barito Utara (Versi 1.3)

### 1. Ringkasan Proyek
Pengembangan platform sistem informasi Pejabat Pengelola Informasi dan Dokumentasi (PPID) untuk Kementerian Agama (Kemenag) Kabupaten Barito Utara. Sistem ini berfungsi sebagai portal utama keterbukaan informasi publik yang terintegrasi, responsif, memiliki fitur pelacakan permohonan, dan menggunakan sistem autentikasi lintas-skema (cross-schema) yang berpusat pada Pusdatin Kemenag Barito Utara.

### 2. Spesifikasi Teknologi (Tech Stack)

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (Full Stack) + React | Menggunakan App Router untuk SSR/SSG guna performa SEO optimal. |
| **State & Data Fetching**| TanStack Query & Table | Manajemen *fetching* data asinkron dan penyajian tabel data publik. |
| **Styling & UI** | Tailwind CSS, shadcn/ui | Dilengkapi fitur perpindahan tema **Light / Dark Mode**. |
| **Animasi** | Framer Motion | Untuk transisi halaman dan interaksi mikro yang mulus. |
| **Database & Backend** | Supabase (Self-hosted) | PostgreSQL. Memiliki dua skema yang saling berkomunikasi: `kemenag_ppid` dan `kemenag_pusdatin`. |
| **ORM** | Drizzle ORM | Digunakan sebagai Object-Relational Mapper yang type-safe untuk berinteraksi dengan database PostgreSQL (Supabase). |
| **Storage** | Cloudflare R2 | Penyimpanan *cloud* tanpa fitur *watermark*, mendukung multi-format file. |
| **Security & CDN** | Cloudflare CDN & Turnstile | Proteksi anti-bot pada formulir publik dan optimasi *caching*. |
| **Notifikasi** | WhatsApp Bot API | Integrasi dengan WA Bot Kemenag Barito Utara yang sudah ada. |

### 3. Desain & Antarmuka Pengguna (UI/UX)
* **Tipografi Utama:** **Plus Jakarta Sans** (bersih, modern, dan sangat terbaca).
* **Ikonografi:** **Lucide Icons** untuk seluruh ikon menu dan navigasi.
* **Aset Logo:** Menggunakan file `logo-kemenag.svg`.
* **Tema Warna:** Mewarisi *Color Palette* (identitas visual) dari Project Website Kemenag Barito Utara sebelumnya.
* **Mode Tema:** Tersedia *toggle* **Dark Mode & Light Mode** yang terintegrasi.
* **Responsivitas:** *Mobile-first approach*, wajib responsif di Desktop, Laptop, Tablet, dan *Smartphone*.
* **Interaksi File:** Setiap tautan dokumen publik akan membuka *tab* baru pada peramban web (*open in new tab*).

### 4. Struktur Navigasi & Menu Utama
* **Beranda (🏠)**: *Hero section*, ringkasan layanan, dan pelacakan tiket permohonan.
* **Profil (🏛️)**: Profil PPID, Profil Pejabat, Visi Misi Motto, Tugas dan Fungsi, Struktur Organisasi PPID.
* **Data Informasi (📊)**: Dashboard data dan infografis keagamaan.
* **Informasi Publik (📰)**: Informasi Berkala, Serta Merta, Tersedia Setiap Saat, Dikecualikan, dan SOP Layanan.
* **Layanan Informasi (🎧)**: Permohonan Informasi, SOP Layanan, Pengajuan Keberatan, Pengajuan Sengketa, Pengaduan Masyarakat, Alasan Pengajuan Keberatan. (Dilengkapi integrasi Turnstile).
* **Standar Layanan (⚖️)**: Maklumat Pelayanan, Jadwal Pelayanan, Biaya/Tarif, Standar Pelayanan, Arah Kebijakan, Strategi dan Metode PPEM.
* **Regulasi (📜)**: Repositori peraturan/SK PPID.

### 5. Fitur Sistem Kunci & Alur Logika

#### A. Autentikasi Admin Lintas Skema (Cross-Schema Auth)
Sistem tidak membuat tabel pengguna baru. Saat pengguna masuk ke halaman admin atau *dashboard* operasional, prosesnya adalah sebagai berikut:
1. Sistem melakukan validasi sesi ke database Supabase.
2. *Query* autentikasi akan merujuk ke skema induk: `kemenag_pusdatin.profiles` menggunakan **Drizzle ORM** agar penulisan *query* lebih rapi dan *type-safe*.
3. Jika kredensial terverifikasi dan profil memiliki peran (*role*) sebagai admin PPID, akses akan diterbitkan untuk mengelola data pada skema `kemenag_ppid`.

#### B. Sistem Manajemen File (Cloudflare R2)
Modul unggahan pada *dashboard* admin menerima format file PDF, Word (doc/docx), Excel (xls/xlsx), dan Gambar (jpg/png/jpeg). Dokumen dapat diunduh bebas oleh publik tanpa ada penambahan *watermark* otomatis.

#### C. Tiket Pelacakan Layanan Publik (Tracking ID)
Masyarakat yang berhasil mengirim form permohonan informasi maupun layanan keberatan akan secara otomatis mendapatkan **Kode Tiket** unik. Kode ini digunakan untuk memantau status tindak lanjut permohonan langsung di halaman Beranda.

#### D. Integrasi Notifikasi (WhatsApp Bot)
Terdapat *webhook/API Caller* yang dibangun di atas Next.js. Setiap kali ada formulir permohonan atau sengketa baru yang disubmit ke dalam sistem, hal ini akan memicu *trigger* otomatis (*push notification*) ke WhatsApp Bot Kemenag Barito Utara sebagai alert bagi tim admin.

---

### 6. Arsitektur Sistem (System Architecture)
Sistem dibangun menggunakan arsitektur monolitik modern berbasis Next.js App Router yang memadukan komputasi Server-Side (SSR/Server Actions) dan Client-Side.

* **Client / Browser:** Mengakses UI yang di-render oleh Next.js, dilindungi oleh Cloudflare Turnstile untuk form submission, dan menerima aset statis dari Cloudflare CDN.
* **Next.js Server (VPS):** Menangani API Routes, Server Actions, dan logika autentikasi SSO (membaca/memvalidasi sesi token).
* **ORM & Database Layer:** Next.js Server berkomunikasi dengan Supabase PostgreSQL menggunakan **Drizzle ORM**. Koneksi dilakukan dengan mekanisme lintas-skema.
* **Storage Layer:** Pengunggahan file dari sistem *Dashboard* akan dikirim (bisa via *presigned URL*) langsung ke *bucket* Cloudflare R2 untuk penyimpanan jangka panjang.
* **Notification Layer:** Notifikasi *event-driven* (seperti tiket permohonan baru) akan men-*trigger webhook* yang langsung terhubung ke layanan API WhatsApp Bot Kemenag Barito Utara.

---

### 7. Skema Database Dasar (Drizzle ORM)
Berikut adalah rancangan awal skema tabel utama pada skema `kemenag_ppid` menggunakan format penulisan Drizzle ORM (`schema.ts`):

```typescript
import { pgTable, pgSchema, uuid, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

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

// -------------------------------------------------------------
// Catatan Integrasi:
// Untuk tabel autentikasi/profil pengguna (admin), 
// Drizzle akan merujuk langsung ke skema 'kemenag_pusdatin'.
// export const pusdatinSchema = pgSchema("kemenag_pusdatin");
// export const profiles = pusdatinSchema.table("profiles", { ... });
// -------------------------------------------------------------
```
