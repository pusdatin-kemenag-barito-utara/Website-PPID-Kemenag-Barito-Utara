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

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ==========================================
# 3. Final Production Runner Image
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl wget bash && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

# Copy Go backend binary
COPY --from=go-builder /app/ppid-api /app/ppid-api

# Copy Astro frontend standalone build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=fe-builder /app/frontend/dist ./dist
COPY --from=fe-builder /app/frontend/public ./public

WORKDIR /app

# Copy entrypoint and start script, ensuring Linux line endings
COPY start.sh /app/start.sh
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh && \
    sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    API_UPSTREAM_URL=http://127.0.0.1:8080

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/bin/bash", "/app/start.sh"]
