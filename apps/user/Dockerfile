# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

RUN pnpm install --frozen-lockfile --filter=apps/user...

RUN pnpm turbo run build --filter=uer-service

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/user/dist ./dist
COPY --from=builder /app/apps/user/package.json ./

RUN pnpm install --prod --frozen-lockfile

CMD ["node", "dist/main.js"]
