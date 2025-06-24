# builder stage
FROM oven/bun:1.1.13-alpine AS builder

WORKDIR /app
COPY bun.lockb /app/
COPY package.json /app/
COPY tsconfig.json /app/
COPY . .

RUN bun install
RUN bun run build

# production stage
FROM oven/bun:1.1.13-alpine AS production

WORKDIR /app

COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist

RUN bun install --production

ENV NODE_ENV=production

CMD ["bun", "dist/main.js"]