# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package definitions
COPY package.json package-lock.json ./

# Install all dependencies including devDependencies for Astro build
RUN npm ci

# Copy application source
COPY . .

# Build Astro standalone node output
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy build artifacts and public assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Run as non-root user
USER node

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
