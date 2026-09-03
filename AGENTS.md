# AGENTS.md

Monorepo PPID Kemenag Barito Utara. Baca panduan ini sebelum menulis kode.

## Arsitektur

- **Frontend** (`frontend/`) — Astro 7 + React islands. Ikuti panduan di
  `frontend/AGENTS.md` sebelum bekerja pada kode frontend.
- **Backend** (`backend/`) — API REST Go Fiber v3. Backend mandiri, tidak
  bergantung pada kode Node/frontend.
- **Database** — PostgreSQL. Skema dimiliki oleh backend (Go migrations).

## Aturan

- JANGAN mengenalkan framework/bundler lama (Next.js, Webpack, Vite monolith)
  ke repositori ini. FE = Astro, BE = Go Fiber.
- Variabel lingkungan berpusat di satu file root `.env.local` yang dipakai
  FE dan BE (bukan penamaan `NEXT_PUBLIC_*` yang sudah usang). Jangan membuat
  file `.env` terpisah di `frontend/` atau `backend/`.
- Dev stack: jalankan `npm install` di root sekali, lalu `npm run dev` di root
  untuk menjalankan FE (Astro, port 3000) dan BE (Go Fiber, port 8080)
  sekaligus via `concurrently`. `Ctrl+C` mematikan keduanya.
