# Multi-stage build for Go Fiber API
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/bin/ppid-api ./cmd/ppid-api

# Minimal runtime image
FROM alpine:3.21

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/bin/ppid-api /app/ppid-api

USER appuser

EXPOSE 8080

ENV PORT=8080 \
    APP_ENV=production

ENTRYPOINT ["/app/ppid-api"]
