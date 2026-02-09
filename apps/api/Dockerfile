# Use Bun official image
FROM oven/bun:1.1

WORKDIR /app

# Copy root workspace files
COPY package.json bun.lock ./
COPY packages ./packages

# Copy API code
COPY apps/api ./apps/api

# Install dependencies
RUN bun install --frozen-lockfile

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

# Start the server
CMD ["bun", "run", "start"]
