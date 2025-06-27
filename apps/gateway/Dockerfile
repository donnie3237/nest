# Dockerfile for apps/gateway microservice in a pnpm/Turborepo monorepo

# Stage 1: Builder ... (Same as before)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY tsconfig*.json ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY packages ./packages
COPY apps/gateway ./apps/gateway
RUN turbo run build --filter=gateway

# Stage 2: Runner ... (Same as before)
FROM node:20-alpine AS runner
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/gateway/package.json ./apps/gateway/
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod --frozen-lockfile --filter=./apps/gateway...

# Expose the port your NestJS Gateway application listens on (changed to 8000)
EXPOSE 8000

# Set the command to run your NestJS application
CMD ["node", "apps/gateway/dist/main.js"]