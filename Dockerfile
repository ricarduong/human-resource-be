# ─────────────────────────────────────────────
# Stage 1: Production dependencies
# ─────────────────────────────────────────────
FROM node:24-alpine AS prod-deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# ─────────────────────────────────────────────
# Stage 2: Builder
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

RUN yarn prisma:generate

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src/

RUN yarn build

# ─────────────────────────────────────────────
# Stage 3: Production image
# ─────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser  -u 1001 -S nodejs -G nodejs

# Copy production-only node_modules (no devDependencies)
COPY --from=prod-deps /app/node_modules ./node_modules/
# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
# Copy compiled app
COPY --from=builder /app/dist ./dist/
COPY prisma ./prisma/
COPY package.json ./

# Transfer ownership to the non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

# Docker-native healthcheck using the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

RUN rm -rf /usr/local/lib/node_modules/npm && \
    rm -f /usr/local/bin/npm

CMD ["node", "dist/server.js"]
