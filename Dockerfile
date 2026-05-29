FROM node:20-alpine

WORKDIR /app

# Install dependencies for sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy source
COPY src/ ./src/

# Create storage directories
RUN mkdir -p storage/temp storage/output logs

# Non-root user for security
RUN addgroup -S botuser && adduser -S botuser -G botuser
RUN chown -R botuser:botuser /app
USER botuser

EXPOSE 3000

CMD ["node", "src/index.js"]
