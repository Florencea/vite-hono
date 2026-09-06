# Dynamic Node.js version argument (defaults to engines.node in package.json)
ARG NODE_VERSION=24.20.0

# Build stage
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Ensure drizzle directory exists for COPY in runner stage
RUN mkdir -p /app/drizzle

# Build client and server
RUN npm run build

# Production stage
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package info and production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/server/app.js"]
