# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Install only relevant dependencies for this app
RUN pnpm install --frozen-lockfile --filter=apps/gateway...

# Build the gateway app only
RUN pnpm turbo run build --filter=apps/gateway...

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Copy only built output
COPY --from=builder /app/apps/gateway/dist ./dist
COPY --from=builder /app/apps/gateway/package.json ./

RUN pnpm install --prod --frozen-lockfile

CMD ["node", "dist/main.js"]
