FROM node:20-alpine

WORKDIR /app

# Install Python and dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    vips-dev

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy AI service
COPY ai-service/ ./ai-service/

# Install Python dependencies for AI service (CPU version for Railway)
RUN cd ai-service && pip3 install --no-cache-dir --break-system-packages -r requirements-cpu.txt

# Copy source
COPY src/ ./src/
COPY start-services.js ./

# Create storage directories
RUN mkdir -p storage/temp storage/output logs

# Non-root user for security
RUN addgroup -S botuser && adduser -S botuser -G botuser
RUN chown -R botuser:botuser /app
USER botuser

EXPOSE 3000 8000

CMD ["node", "start-services.js"]
