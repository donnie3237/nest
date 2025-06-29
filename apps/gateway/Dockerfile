# 1. Base image + pnpm & turbo global
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat \
  && corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm install turbo --global
WORKDIR /app

# 2. Prune monorepo for specific project
FROM base AS pruner
ARG PROJECT
COPY . .
RUN turbo prune --scope=${PROJECT} --docker   # ปรับ prune ให้เป็น docker build filter :contentReference[oaicite:1]{index=1}

# 3. Installer stage
FROM base AS installer
ARG PROJECT
WORKDIR /app
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile   :contentReference[oaicite:2]{index=2}

COPY --from=pruner /app/out/full/ .
RUN pnpm run build --filter=${PROJECT}        :contentReference[oaicite:3]{index=3}
# Optionally prune devdeps
RUN pnpm prune --prod

# 4. Runner stage
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat \
  && addgroup -S --gid 1001 nodejs \
  && adduser -S --uid 1001 nodejs
USER nodejs
WORKDIR /app
COPY --from=installer --chown=nodejs:nodejs /app .
ENV NODE_ENV=production
CMD ["node", "dist/apps/${PROJECT}/main.js"]
