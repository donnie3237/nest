
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml ./ 
RUN pnpm install --frozen-lockfile --prod=false 

# Copy the rest of the application source code
COPY . .

# Build the NestJS application (adjust build script if different)
RUN pnpm run build

# Stage 2: Create the final production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
# Copy build output
COPY --from=builder /app/dist ./dist

EXPOSE 3000 

# Command to run the application
CMD [ "pnpm", "run", "start:prod" ] 