# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# ตั้งค่า working directory เป็น root ของ monorepo ภายใน container
# เพื่อให้ turborepo และ pnpm สามารถเข้าถึงทุก workspace ได้
WORKDIR /app

# คัดลอกไฟล์หลักของ monorepo ที่จำเป็นสำหรับการจัดการ dependencies และการ build
# ต้องคัดลอกจาก context root (ซึ่งจะถูกส่งเข้ามาเมื่อ build)
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# สร้างโฟลเดอร์สำหรับ apps/ และ packages/ ล่วงหน้า
# เพื่อป้องกัน permission issues และเตรียมพร้อมสำหรับการคัดลอก workspace
RUN mkdir -p apps packages

# คัดลอก package.json ของทุก workspace ที่แอปนี้ต้องใช้
# ตัวอย่าง: แอป API อาจจะใช้ package common
COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
# เพิ่มบรรทัดนี้สำหรับทุกๆ package หรือ app อื่นๆ ที่ apps/api ต้องพึ่งพา (ถ้ามี)
# เช่น ถ้า api ใช้ ui: COPY packages/ui/package.json packages/ui/

# ติดตั้ง root dependencies
# pnpm install จะจัดการ node_modules ของทุก workspace ให้ถูกต้อง
RUN pnpm install --frozen-lockfile

# คัดลอก source code เฉพาะที่จำเป็น (หรือทั้งหมด)
# ถ้าคุณต้องการให้ Docker cache ทำงานได้ดีขึ้นสำหรับ source code
# คุณสามารถคัดลอกทีละโฟลเดอร์ (เช่น apps/api/src)
# แต่ถ้าไฟล์ package.json ไม่ได้เปลี่ยนบ่อย การ COPY . . ทั้งหมดอาจจะง่ายกว่า
COPY . .

# Build เฉพาะแอป "api" โดยใช้ Turborepo
# ตรวจสอบว่า script "build" ใน package.json ของ apps/api ถูกกำหนดไว้ (เช่น "build": "nest build")
# หรือใน turbo.json มี task "build" สำหรับ "api"
RUN pnpm --filter=api build

# --- Stage 2: Production Stage ---
FROM node:20-alpine AS runner

# ตั้งค่า environment variables สำหรับ production
ENV NODE_ENV=production

# ตั้งค่า working directory เป็น root ของ monorepo ภายใน container
WORKDIR /app

# สร้างโฟลเดอร์ที่จำเป็นสำหรับ app ที่จะรัน
RUN mkdir -p apps packages

# คัดลอกไฟล์หลักของ monorepo
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# คัดลอก package.json ของ app "api" และ dependencies ที่จำเป็นใน production
COPY --from=builder /app/apps/api/package.json /app/apps/api/
COPY --from=builder /app/packages/config/package.json /app/packages/config/
COPY --from=builder /app/packages/database/package.json /app/database/config/
# เพิ่มบรรทัดนี้สำหรับทุกๆ package หรือ app อื่นๆ ที่ apps/api ต้องพึ่งพาใน production (ถ้ามี)

# คัดลอกเฉพาะ build output ของแอป "api"
# ตรวจสอบ path ของ dist folder ของแอป "api"
COPY --from=builder /app/dist/apps/api /app/dist/apps/api

# ติดตั้งเฉพาะ production dependencies ใน production stage
# เพื่อให้ image มีขนาดเล็กที่สุด
RUN pnpm install --prod --frozen-lockfile

# Expose port ที่ NestJS app ของคุณรันอยู่
EXPOSE 3000

# กำหนด command สำหรับรัน NestJS app "api"
# ตรวจสอบว่า main.js อยู่ที่ไหนใน build output ของคุณ
CMD ["node", "dist/apps/api/main.js"]