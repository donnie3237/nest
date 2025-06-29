# 1. Base Stage: ใช้ base image ของ Bun
# oven/bun:1-alpine หมายถึง Bun v1.x ล่าสุดบน Alpine (แนะนำ)
# หากต้องการเวอร์ชันล่าสุดเสมอ สามารถเปลี่ยนเป็น oven/bun:latest-alpine ได้
FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# 2. Installer Stage: ติดตั้ง Dependencies ทั้งหมด
FROM base AS installer
ARG PROJECT

# คัดลอกไฟล์ที่จำเป็นสำหรับการติดตั้ง dependency
COPY package.json bun.lockb* tsconfig.json ./
COPY apps/ apps/
COPY packages/ packages/

# ติดตั้ง dependency ทั้งหมดสำหรับ monorepo
RUN bun install --frozen-lockfile

# 3. Builder Stage: Build โปรเจกต์เป้าหมาย
FROM installer AS builder
ARG PROJECT

# รัน build script สำหรับโปรเจกต์ที่ระบุ
# Bun ไม่มี --filter แต่เราใช้ --cwd เพื่อระบุ workspace ที่จะรันคำสั่งแทน
RUN bun run --cwd ./apps/${PROJECT} build

# 4. Runner Stage: สร้าง Final image ที่เล็กและพร้อมใช้งาน
FROM base AS runner
ARG PROJECT
WORKDIR /usr/src/app

# สร้าง user สำหรับรันโปรแกรมเพื่อความปลอดภัย
RUN addgroup -S --gid 1001 bun
RUN adduser -S --uid 1001 bun
USER bun

# คัดลอกเฉพาะ build output จาก builder stage
COPY --from=builder --chown=bun:bun /usr/src/app/apps/${PROJECT}/dist ./dist

ENV NODE_ENV=production

# ใช้ bun run โดยตรงกับไฟล์ผลลัพธ์
CMD ["bun", "run", "dist/main.js"]