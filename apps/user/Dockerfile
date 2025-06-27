# apps/gateway/Dockerfile
# Multi-stage build with turbo prune and Bun runtime

# Stage 0: Prune the workspace for the specific application
FROM oven/bun:latest AS pruner

WORKDIR /app

RUN npm install -g pnpm

# Copy necessary files for pruning:
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/

# Install root dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Prune the workspace to include only the target app and its dependencies
ARG APP_NAME=user-service
RUN turbo prune --scope=$APP_NAME --docker


# Stage 1: Build the application from the pruned workspace
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy the pruned workspace output
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/json/package.json ./package.json

# Install dependencies in the builder context using Bun's package manager
RUN bun install --frozen-lockfile

# Build the specific NestJS application
ARG APP_NAME=gateway
RUN pnpm run build --filter=$APP_NAME


# Stage 2: Create the final production-ready image
FROM oven/bun:latest AS runner

WORKDIR /app

# Copy the pruned package.json and node_modules (production only)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy the built application output
ARG APP_NAME=gateway
COPY --from=builder /app/apps/$APP_NAME/dist ./apps/$APP_NAME/dist

# Set environment variables for production
ENV NODE_ENV production

# Command to run the application using Bun
CMD ["bun", "apps/gateway/dist/main"]