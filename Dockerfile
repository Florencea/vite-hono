# syntax=docker/dockerfile:1

# --- Build stage: official Vite+ toolchain image ---
FROM ghcr.io/voidzero-dev/vite-plus:latest AS builder
WORKDIR /app

# Install dependencies first for layer caching
COPY --chown=vp:vp package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN vp install

# Copy source and build (vp reads engines.node in package.json and provisions Node automatically)
COPY --chown=vp:vp . .
RUN vp build

# Export the exact resolved Node.js binary for the runtime stage
RUN cp "$(vp env which node | head -1)" /tmp/node

# --- Deps stage: production-only dependencies ---
FROM ghcr.io/voidzero-dev/vite-plus:latest AS deps
WORKDIR /app
COPY --chown=vp:vp package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN vp install --prod

# --- Runtime stage: small, glibc, no vp ---
FROM debian:bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# The exact Node.js binary resolved by vp from engines.node
COPY --from=builder /tmp/node /usr/local/bin/node

# Copy built assets and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/server/app.js"]
