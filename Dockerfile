# Use the official Bun image
FROM oven/bun:1.0.31

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN bun install

# Expose the port (Fly sets PORT as an env var)
ENV PORT 8080

# Run your Bun app
CMD ["bun", "run", "src/server.ts"]
