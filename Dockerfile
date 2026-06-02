# Multi-stage build for self-host: build the Vite SPA, then run the combined Express server
# that serves both the static app and the /board API.

# Stage 1: build client
FROM node:24-alpine AS builder
WORKDIR /app

# Install deps for root (client build)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build the SPA (outputs to dist/)
RUN npm run build

# Stage 2: runtime with server + built assets
FROM node:24-alpine
WORKDIR /app

# Install only production deps for the server
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy built client
COPY --from=builder /app/dist ./dist

# Copy server source and any needed public/test data for samples
COPY server ./server
COPY test/teams ./test/teams
# public/ may contain additional static if used

# Create data dir for board persistence (volume mount recommended)
RUN mkdir -p server/data

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Run the enhanced server (now serves SPA at / + API at /board)
CMD ["node", "server/index.js"]
