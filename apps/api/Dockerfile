# Use Bun official image with correct version
FROM oven/bun:1.3.8

WORKDIR /app

# Copy root workspace files first for better caching
COPY package.json bun.lock turbo.json ./

# Copy workspace packages
COPY packages ./packages

# Copy API code
COPY apps/api ./apps/api

# Install dependencies (all workspace deps)
RUN bun install --frozen-lockfile

# Build workspace if needed
RUN bun run build --filter=api || true

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

# Start the server
CMD ["bun", "run", "start"]
