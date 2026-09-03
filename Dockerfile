# ==========================================
# 1. Build Go Fiber Backend
# ==========================================
FROM golang:1.24-alpine AS go-builder

WORKDIR /app/backend

ENV GOTOOLCHAIN=auto

RUN apk add --no-cache git ca-certificates tzdata

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/ppid-api ./cmd/ppid-api

# ==========================================
# 2. Build Astro 7 Frontend
# ==========================================
FROM node:22-alpine AS fe-builder

WORKDIR /app/frontend

# Build args from Coolify for compile-time Astro envs
ARG PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG PUBLIC_API_BASE_URL
ARG PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG PUSDATIN_URL
ARG NEXT_PUBLIC_PUSDATIN_URL
ARG PUBLIC_GA_MEASUREMENT_ID
ARG PUBLIC_GTAG_ID

ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL:-https://ppid.kemenag-baritoutara.com} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://ppid.kemenag-baritoutara.com} \
    PUBLIC_API_BASE_URL=${PUBLIC_API_BASE_URL:-/api/v1} \
    PUBLIC_TURNSTILE_SITE_KEY=${PUBLIC_TURNSTILE_SITE_KEY:-0x4AAAAAADR1O_LSp1lgc3km} \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-0x4AAAAAADR1O_LSp1lgc3km} \
    PUSDATIN_URL=${PUSDATIN_URL:-https://pusdatin.kemenag-baritoutara.com} \
    NEXT_PUBLIC_PUSDATIN_URL=${NEXT_PUBLIC_PUSDATIN_URL:-https://pusdatin.kemenag-baritoutara.com} \
    PUBLIC_GA_MEASUREMENT_ID=${PUBLIC_GA_MEASUREMENT_ID:-G-C6T6QLCCVB} \
    PUBLIC_GTAG_ID=${PUBLIC_GTAG_ID:-GT-TB7R87XG}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ==========================================
# 3. Final Production Runner Image
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl wget bash

# Copy Go backend binary
COPY --from=go-builder /app/ppid-api /app/ppid-api

# Copy Astro frontend standalone build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=fe-builder /app/frontend/dist ./dist
COPY --from=fe-builder /app/frontend/public ./public

WORKDIR /app

# Copy entrypoint script and ensure Linux line endings
COPY start.sh /app/start.sh
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    API_UPSTREAM_URL=http://127.0.0.1:8080

EXPOSE 3000

CMD ["/bin/bash", "/app/start.sh"]
