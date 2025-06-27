# Stage 0: Prune the workspace for gateway
FROM node:20-bullseye AS pruner

WORKDIR /app

RUN npm install -g pnpm@latest

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

ARG APP_NAME=gateway
RUN npx turbo prune --scope=$APP_NAME --docker


# Stage 1: Build the application
FROM node:20-bullseye AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ ./
COPY --from=pruner /app/out/json/package.json ./package.json
COPY --from=pruner /app/out/json/pnpm-lock.yaml ./pnpm-lock.yaml

RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

ARG APP_NAME=gateway
RUN pnpm run build --filter=$APP_NAME


# Stage 2: Final production image
FROM node:20-bullseye AS runner

WORKDIR /app

ARG APP_NAME=gateway
ENV NODE_ENV=production
ENV APP_NAME=$APP_NAME

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/$APP_NAME/dist ./apps/$APP_NAME/dist

EXPOSE 8000

CMD sh -c "node apps/${APP_NAME}/dist/main.js"
