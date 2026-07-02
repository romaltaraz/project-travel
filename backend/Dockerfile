# Stage 1 — build TypeScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2 — production runtime
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
# Seed images — copied into the image so the Docker volume inherits them on first run
RUN mkdir -p uploads
COPY uploads ./uploads
EXPOSE 3000
CMD ["node", "dist/index.js"]
