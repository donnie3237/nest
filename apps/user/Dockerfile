# Multi-stage build with turbo prune and Bun runtime

# Stage 0: Prune the workspace for the specific application
FROM oven/bun:latest AS pruner

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy necessary files for pruning
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/

# Install root dependencies
RUN pnpm install --frozen-lockfile

# Set the app name (default to "user-service")
ARG APP_NAME=user-service
RUN turbo prune --scope=$APP_NAME --docker


# Stage 1: Build the application
FROM oven/bun:latest AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/json/package.json ./package.json

RUN bun install --frozen-lockfile

ARG APP_NAME=user-service
RUN pnpm run build --filter=$APP_NAME


# Stage 2: Final production image
FROM oven/bun:latest AS runner

WORKDIR /app

ARG APP_NAME=user-service
ENV APP_NAME=$APP_NAME
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/$APP_NAME/dist ./apps/$APP_NAME/dist

EXPOSE 8000

# Run the app using dynamic APP_NAME
CMD sh -c "bun apps/${APP_NAME}/dist/main"
