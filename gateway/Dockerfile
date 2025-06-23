FROM node:20-alpine AS builder

WORKDIR /app

# --- เพิ่มบรรทัดนี้เพื่อติดตั้ง pnpm ---
RUN npm install -g pnpm
# --- สิ้นสุดการเพิ่ม ---

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy the rest of the application source code
COPY . .

# Build the NestJS application
RUN pnpm run build

# Stage 2: Create the final production image
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm
# --- สิ้นสุดการเพิ่ม ---

# Copy only production dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules
# Copy build output
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Command to run the application
CMD [ "pnpm", "run", "start:prod" ]
