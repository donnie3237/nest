# Dockerfile.bun

# 1. Base Stage: ใช้ base image ของ Bun ที่มีทุกอย่างพร้อมแล้ว
# oven/bun:1-alpine หมายถึง Bun v1.x ล่าสุดบน Alpine (แนะนำ)
FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# 2. Dependencies Stage: ติดตั้ง Dependencies จาก pnpm lockfile
FROM base AS dependencies
# คัดลอกไฟล์ที่จำเป็นจาก pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/ apps/

# Bun สามารถอ่าน pnpm-lock.yaml และติดตั้งทุกอย่างที่จำเป็นให้เองได้โดยตรง
# เราใส่ --production=false เพื่อให้ติดตั้ง devDependencies สำหรับขั้นตอน build ด้วย
RUN bun install --production=false

# 3. Builder Stage: Build โปรเจกต์เป้าหมาย
FROM dependencies AS builder
ARG PROJECT_NAME

# Build เฉพาะโปรเจกต์เป้าหมายที่เราต้องการ
RUN bun run --filter=${PROJECT_NAME} build

# 4. Final Runner Stage: สร้าง Final image ที่เล็กและพร้อมใช้งาน
FROM base AS final
ARG PROJECT_NAME
ARG PROJECT_PATH
WORKDIR /usr/src/app

# สร้าง user สำหรับรันโปรแกรมเพื่อความปลอดภัย
RUN addgroup -S --gid 1001 bun
RUN adduser -S --uid 1001 bun
USER bun

# คัดลอก Build output และ Production dependencies ที่จำเป็น
# Bun จะจัดการคัดลอกเฉพาะ production node_modules ที่จำเป็นจาก workspace ทั้งหมดให้เอง
COPY --from=builder --chown=bun:bun /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /usr/src/app/apps/${PROJECT_PATH}/dist ./dist

ENV NODE_ENV=production

# ใช้ Bun runtime รันโปรแกรม
CMD ["bun", "run", "dist/main.js"]