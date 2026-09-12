# PPID Kemenag Barito Utara

Situs layanan informasi publik Kemenag Barito Utara. Monorepo dengan arsitektur:

- **Frontend** — [Astro](https://astro.build) 7 + React islands (`frontend/`)
- **Backend** — API REST [Go Fiber](https://docs.gofiber.io) v3 (`backend/`)
- **Database** — PostgreSQL (via `docker-compose.yml`)

> Catatan migrasi: aplikasi ini telah dipindahkan dari monolit Next.js (App Router) ke
> Astro + React untuk FE dan Go Fiber untuk BE. Seluruh kode/build Next.js lama sudah
> dihapus dari repositori.

## Struktur

```
├── backend/               # API Go Fiber (port 8080)
│   ├── cmd/ppid-api/      # entry point
│   ├── docs/MIGRATION_MAP.md  # dokumentasi pemetaan migrasi (referensi historis)
│   └── internal/          # handler, service, repository, model, middleware
├── frontend/              # UI Astro 7 + React (port 4321)
│   └── src/
│       ├── pages/         # rute Astro
│       ├── components/    # komponen Astro & React (islands)
│   └── ...
├── dev.ps1                # orchestrator dev (backend + frontend sekaligus)
├── dev-stop.ps1           # menghentikan dev stack
└── docker-compose.yml     # PostgreSQL lokal
```

## Instalasi Dependensi

Untuk menginstal seluruh dependensi (root, frontend Astro, dan backend Go) sekaligus:

```powershell
npm run install:all
```

Atau secara terpisah:
```powershell
npm run install:fe   # Frontend saja
npm run install:be   # Backend Go modules saja
```

## Menjalankan Development

Prasyarat: Go 1.26+, Node.js >= 22.12, dan PostgreSQL (atau `docker compose up -d`).

```powershell
# jalankan backend (Go Fiber) + frontend (Astro) bersamaan
.\dev.ps1

# cek health backend
Invoke-RestMethod http://localhost:8080/api/v1/health

# frontend dibuka di
# http://localhost:4321

# stop stack
.\dev-stop.ps1
```

Seluruh variabel lingkungan dikelola terpusat di **Infisical Cloud** (folder `/ppid-kemenag`)
dan otomatis disuntikkan (*injected*) saat menjalankan perintah `npm run dev` atau saat
container berjalan via Universal Auth. Tidak memerlukan file `.env` lokal.

## Menjalankan secara terpisah

```powershell
# Backend saja
cd backend; go run ./cmd/ppid-api

# Frontend saja
cd frontend; npm install; npm run dev
```

## Build Produksi

```powershell
# Backend
cd backend; go build -o bin/ppid-api ./cmd/ppid-api

# Frontend
cd frontend; npm run build
```

## Dokumentasi

- Integrasi Secrets & Envs: Menggunakan Infisical Cloud (`/ppid-kemenag`)
- Panduan pengembangan frontend: `frontend/AGENTS.md`
- Pemetaan migrasi & daftar rute: `backend/docs/MIGRATION_MAP.md`
