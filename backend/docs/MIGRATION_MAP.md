# MIGRATION_MAP — PPID Kemenag Barito Utara

Peta inventori & status migrasi dari sistem lama (Next.js 16 + Supabase + localStorage)
ke sistem baru (Astro 7 + React di `frontend/`, Go Fiber v3 + PostgreSQL di `backend/`).

> Dokumen ini adalah **kontrak**. Setiap modul dicentang hanya setelah terverifikasi end-to-end.

---

## 1. Arsitektur Target

```
frontend/   Astro 7.2 (output:server, @astrojs/node standalone) + React islands + Tailwind v4
backend/    Go 1.26 + Fiber v3.5 + pgx/v5 + golang-jwt/v5 + bcrypt
DB          PostgreSQL skema kemenag_ppid (migration runner di backend/migrations)
Routing     nginx:  /*  → Astro :3000      /api/* → Go :8080
Auth        JWT go-native, cookie HttpOnly ppid_admin_token, role admin
```

## 2. Inventori Rute (Lama → Baru)

> Kategori lama: **[STATIS-STATE]** = tidak pernah berubah (SSG), **[CLIENT-DATA]** = data di browser (peluang bug).

### Halaman Publik (23)
| # | Rute lama | Sumber data | Rute baru (target) | Modul | Status |
|---|---|---|---|---|---|
| 1 | `/` beranda | client + 5 sumber | `frontend/src/pages/index.astro` | M1–M5 | ✅ |
| 2 | `/tentang` | STATIS-STATE | `tentang.astro` | M2 | — (tidak ada di legacy) |
| 3 | `/profil` | `useProfilStore` → data statis | `profil.astro` | M2 | ✅ |
| 4 | `/profil/visi-misi` | STATIS-STATE | `profil/visi-misi.astro` | M2 | ✅ |
| 5 | `/profil/tugas-fungsi` | STATIS-STATE | `profil/tugas-fungsi.astro` | M2 | ✅ |
| 6 | `/profil/pejabat` | `useProfilStore` → data statis | `profil/pejabat.astro` | M2 | ✅ |
| 7 | `/profil/struktur` | STATIS-STATE | `profil/struktur.astro` | M2 | ✅ |
| 8 | `/dasar-hukum` | STATIS-STATE | `dasar-hukum.astro` | M2 | — (tidak ada di legacy) |
| 9 | `/data-informasi` (landing) | `useDataInformasiStore` → data statis | `data-informasi.astro` | M3 | ✅ |
| 10 | `/data-informasi/statistik` | — (tidak ada di legacy) | `data-informasi/statistik.astro` | M3 | — |
| 11 | `/data-informasi/infografis` | `useDataInformasiStore` → data statis | `data-informasi/infografis.astro` | M3 | ✅ |
| 12 | `/informasi-publik` (overview) | STATIS-STATE | `informasi-publik/index.astro` | M1 | ✅ |
| 13 | `/informasi-publik/dikecualikan` | store → API | `informasi-publik/dikecualikan.astro` | M1 | ✅ |
| 14 | `/informasi-publik/serta-merta` | store → API | `informasi-publik/serta-merta.astro` | M1 | ✅ |
| 15 | `/informasi-publik/berkala` | store → API | `informasi-publik/berkala.astro` | M1 | ✅ |
| 16 | `/informasi-publik/setiap-saat` | store → API | `informasi-publik/setiap-saat.astro` | M1 | ✅ |
| 17 | `/layanan-informasi` | STATIS-STATE (form client) | `layanan-informasi/index.astro` | M4 | ✅ |
| 18 | `/layanan-informasi/sop` | `useLayananInfoStore` → data statis | `layanan-informasi/sop.astro` | M4 | ✅ |
| 19 | `/layanan-informasi/alasan-keberatan` | `useLayananInfoStore` → data statis | `layanan-informasi/alasan-keberatan.astro` | M4 | ✅ |
| 20 | `/layanan-informasi/sengketa` | `useLayananInfoStore` → data statis | `layanan-informasi/sengketa.astro` | M4 | ✅ |
| 21 | `/regulasi` | store → API | `regulasi.astro` | M1 | ✅ |
| 22 | `/standar-layanan` | `useStandarLayananStore` → data statis | `standar-layanan/index.astro` | M4 | ✅ |
| 22a | `/standar-layanan/{maklumat,kebijakan,jadwal,biaya,strategi}` | `useStandarLayananStore` → data statis | `standar-layanan/*.astro` | M4 | ✅ |
| 22b | `/layanan-informasi/{keberatan,pengaduan}` | STATIS-STATE (form client) | `layanan-informasi/*.astro` | M4 | ✅ |
| 23 | `/maintenance` | STATIS-STATE | `maintenance.astro` | M8 | ⬜ |

### Form Publik (3) — pindah ke API
| Rute | Aksi lama | Aksi baru | Modul | Status |
|---|---|---|---|---|
| `/permohonan` | tidak simpan (!) | `POST /api/v1/permohonan` → tiket DB | M5 | ✅ |
| `/keberatan` | tidak simpan (!) | `POST /api/v1/permohonan` (jenis=keberatan) | M5 | ✅ |
| `/pengaduan` | tidak simpan (!) | `POST /api/v1/permohonan` (jenis=pengaduan) | M5 | ✅ |

### Halaman Admin (8) — wajib login admin + role check
| # | Rute lama | Modul | Status |
|---|---|---|---|
| 1 | `/admin/login` | M6 | ✅ |
| 2 | `/admin/dashboard` | M6 | ✅ |
| 3 | `/admin/informasi-publik` | M1 | ✅ |
| 4 | `/admin/data-informasi` (statistik + infografis) | M3 | ✅ (konten editor) |
| 5 | `/admin/layanan-informasi` (SOP + alasan) | M4 | ✅ (konten editor) |
| 6 | `/admin/profil` (4 tab) | M2 | ✅ (konten editor) |
| 7 | `/admin/regulasi` | M1 | ✅ |
| 8 | `/admin/standar-layanan` (6 tab) | M4 | ✅ (konten editor) |
| 9 | `/admin/pengaturan` (kontak pengaduan) | M4 | ✅ (konten editor `layanan_info`) |

## 3. LocalStorage Keys & Seed (harus dipindah ke DB)

| Key localStorage | Hook | Tabel target |
|---|---|---|
| `ppid_informasi_publik_docs_store` | `useInformasiPublikStore` | `informasi_publik` |
| `ppid_regulasi_data_store` | `useRegulasiStore` | `regulasi` |
| `ppid_data_informasi_store` | `useDataInformasiStore` | `data_statistik`, `infografis` |
| `ppid_layanan_info_data_store` | `useLayananInfoStore` | `layanan_info` |
| `ppid_standar_layanan_store` | `useStandarLayananStore` | `standar_layanan` |
| `ppid_profil_data_store` | `useProfilStore` | `profil_instansi`, `profil_pejabat` |

Seed/type asal: `src/lib/*-store.ts` (data array inline) + `src/lib/profil-data.ts`.
Custom events lama (dipertahankan antar-island baru):
`informasi_publik_updated`, `regulasi_updated`, `data_informasi_updated`,
`layanan_info_updated`, `standar_layanan_updated`, `profil_data_updated`, `open_global_search`.

## 4. Schema DB Target (`kemenag_ppid`)

| Tabel | Sumber | Catatan |
|---|---|---|
| `admin_users` | BARU (Go-native) | bcrypt + JWT, ganti auth Supabase/pusdatin cross-schema |
| `informasi_publik` | lama (schema.ts) | + kolom `download_url` |
| `regulasi` | BARU | dari `useRegulasiStore` |
| `profil_instansi` | lama + store | gabung sejarah/visi/tugas/strategi |
| `profil_pejabat` | `useProfilStore` | + `foto_url` |
| `data_statistik` | `useDataInformasiStore` | |
| `infografis` | `useDataInformasiStore` | `image_url` DI-RENDER (bug lama) |
| `standar_layanan` | `useStandarLayananStore` | jenis: maklumat/jadwal/biaya/komponen/kebijakan/strategi |
| `layanan_info` | `useLayananInfoStore` | jenis: sop/alasan_keberatan/prosedur_sengketa/kontak_pengaduan |
| `permohonan_informasi` | lama (schema.ts) | + `jenis`, tracking_id unik DB, status workflow |
| `pengaturan_situs` | BARU | key-value, ganti 0-persistence |

## 5. API Lama → Baru

| Lama (Next) | Baru (Go Fiber v3) | Status |
|---|---|---|
| `POST /api/auth/login` | `POST /api/v1/auth/login` (bcrypt+JWT+Turnstile) | ✅ |
| `POST /api/auth/logout` | `POST /api/v1/auth/logout` | ✅ |
| (tidak ada) | `GET /api/v1/auth/me` | ✅ |
| `GET /api/health` | `GET /api/v1/health` | ✅ |
| `POST /api/permohonan` (TODO) | `POST /api/v1/permohonan` + `GET /api/v1/permohonan/track` | ⬜ |
| (proxy.ts JWT manual) | `middleware/auth.go` + `RequireRole("admin")` | ✅ |

## 6. Komponen UI yang Dipindah (Identik)

- `Navbar` — mega-menu 6 dropdown + drawer mobile (client)
- `Footer`
- `ThemeToggle`, `AccessibilityWidget` (text-scale-large/xlarge, high-contrast-mode), `LiveSupportWidget`, `GlobalSearchModal` (→ API), `PdfTicketModal`
- `Logo Kemenag` (public/logo-kemenag.svg) + `hapakat.png`
- **Hanya lapisan data yang berubah** (localStorage → API), class/struktur HTML dipertahankan.

## 7. Env Vars

| Lama | Baru | Keterangan |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | `DATABASE_URL` → `backend` | pgxpool |
| `SUPABASE_URL/ANON/SERVICE_ROLE` | — | **DIBUANG** (auth go-native) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `TURNSTILE_SITE_KEY` | BE verifikasi |
| `TURNSTILE_SECRET_KEY` | `TURNSTILE_SECRET_KEY` | |
| `NEXT_PUBLIC_SITE_URL` | `PUBLIC_SITE_URL` | Astro |
| `HOSTNAME` / `PORT` | `PORT`, `PUBLIC_API_BASE_URL` | dev |
| `R2_*` (4 key) | `R2_*` | Fase 9 |
| `NEXT_PUBLIC_PUSDATIN_URL` | `PUSPATIN_URL`, `PUBLIC_PUSDATIN_URL` | maintenance |
| — | `JWT_SECRET`, `JWT_EXPIRES_MINUTES` | baru |

## 8. Isu Lama yang Harus Diperbaiki (bukan sekadar dipindah)

1. Tombol unduh dokumen **mati** → `file_url` + `<a download>` real.
2. Form publik (permohonan/keberatan/pengaduan) **tidak menyimpan** → tiket DB dengan tracking ID unik.
3. Tracking ID palsu (`Math.random`) → `REQ-YYYYMMDD-XXXX` dari DB.
4. Dashboard & daftar permohonan **hardcoded/mock** → data API.
5. Landing `/informasi-publik` **stub** → konten nyata + navigasi kategori.
6. Halaman struktur profil **placeholder** → gambar/gambar di-render.
7. `imageUrl` infografis **tidak dirender** → ditampilkan.
8. Auth admin: siapa pun user valid lolos ke `/admin` **tanpa cek role** → `RequireRole("admin")`.
9. 21 halaman tanpa SEO → Astro SSR + metadata per halaman + sitemap.

## 9. Status Migrasi

| Modul | BE | DB | FE publik | FE admin | E2E |
|---|---|---|---|---|---|
| Foundation (config/db/health) | ✅ | ✅ | — | — | — |
| M6 Auth (go-native + Turnstile) | ✅ | ✅ | — | ✅ (login+dashboard) | ⬜ |
| M1 Informasi Publik & Regulasi | ✅ (LIST+CRUD) | ✅ (tabel+seed) | ✅ (4 kategori + regulasi) | ✅ (CRUD + upload modal) | ⬜ |
| Fase 3 Chrome (navbar/footer/widgets/theme) | — | — | ✅ (@base-ui/react, tw-animate, shadcn) | — | ⬜ (Playwright) |
| M2 Profil & Pejabat | ✅ (konten_seksi + CRUD) | ✅ (tabel + seed) | ✅ | ✅ (editor konten) | ⬜ |
| M3 Data & Infografis | ✅ (konten_seksi + CRUD) | ✅ (tabel + seed) | ✅ | ✅ (editor konten) | ⬜ |
| M4 Standar & Layanan | ✅ (konten_seksi + CRUD) | ✅ (tabel + seed) | ✅ | ✅ (editor konten) | ⬜ |
| M5 Permohonan & Tiket | ✅ (POST + lacak + status) | ✅ (tabel + seed 3) | ✅ (3 form terhubung) | ✅ (tabel + update status + WA/Email) | ⬜ |
| M7 Storage R2 | ✅ (endpoint upload + fallback lokal) | — (objek) | ✅ (unduh file_url) | ✅ (modal unggah berkas) | ⬜ |
| M8 Notifikasi (WA) | ✅ (record + webhook WA_BOT_WEBHOOK_URL) | ✅ (tabel notifikasi) | — | ✅ (form & riwayat notif) | ⬜ |

✅ selesai · ⬜ belum · — tidak berlaku