# Dockerfile for apps/product microservice in a pnpm/Turborepo monorepo

# Stage 1: Builder - Install root dependencies, build shared packages, and build the target app
FROM node:20-alpine AS builder

# Set working directory for the builder stage
WORKDIR /app

# 1. Copy essential monorepo configuration files (for pnpm & Turborepo)
COPY package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY tsconfig*.json ./

# 2. Enable Corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 3. Install ALL monorepo dependencies (both prod and dev)
RUN pnpm install --frozen-lockfile

# 4. Copy all 'packages' code (shared libraries)
COPY packages ./packages

# 5. Copy the specific application code ('apps/product' in this case)
COPY apps/product ./apps/product

# 6. Build the target application and its dependencies
RUN turbo run build --filter=product-service

# Stage 2: Runner - Create the final lean image with only production runtime
FROM node:20-alpine AS runner

# Set working directory for the runner stage
WORKDIR /app

# 1. Copy essential monorepo root files needed for pnpm production install
COPY package.json pnpm-lock.yaml ./

# 2. Copy the specific application's package.json
COPY apps/product/package.json ./apps/product/

# 3. Copy the compiled output (dist folder)
COPY --from=builder /app/apps/product/dist ./apps/product/dist

# 4. Install only production dependencies for the specific application
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod --frozen-lockfile --filter=./apps/product...

# No EXPOSE line, as requested (Product service typically communicates internally via RabbitMQ)

# Set the command to run your NestJS application (Product service listens on 8000)
CMD ["node", "apps/product/dist/main.js"]