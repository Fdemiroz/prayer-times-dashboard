# =============================================================================
# Prayer Times Dashboard - Docker Image
# Optimized for deployment on NUC/Raspberry Pi/Server
# =============================================================================

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public folder exists (even if empty)
RUN mkdir -p public

# HA env vars are needed at build time (NEXT_PUBLIC_ vars are inlined)
ARG NEXT_PUBLIC_HA_URL=http://192.168.2.21:8123
ARG NEXT_PUBLIC_HA_TOKEN=
ENV NEXT_PUBLIC_HA_URL=$NEXT_PUBLIC_HA_URL
ENV NEXT_PUBLIC_HA_TOKEN=$NEXT_PUBLIC_HA_TOKEN

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
