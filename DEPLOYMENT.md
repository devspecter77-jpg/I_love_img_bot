# Deployment Guide — AI Background Removal Bot

## Project Structure

```
rootback/
├── src/                        # Node.js bot
│   ├── index.js                # Entry point
│   ├── bot/
│   │   ├── handlers.js         # All Telegram event handlers
│   │   ├── keyboards.js        # Inline keyboard layouts
│   │   └── messages.js         # All bot message templates
│   ├── ai/
│   │   └── processor.js        # Sharp + AI service integration
│   ├── api/
│   │   └── server.js           # Express health/stats API
│   ├── queue/
│   │   └── imageQueue.js       # Bull queue (Redis) + in-memory fallback
│   ├── workers/
│   │   ├── imageWorker.js      # Image processing job handler
│   │   └── cleanupWorker.js    # Scheduled file cleanup
│   └── utils/
│       ├── logger.js           # Winston logger
│       ├── redis.js            # Redis client
│       ├── sessionManager.js   # User session state
│       ├── storage.js          # File system helpers
│       └── telegram.js         # File download/send helpers
├── ai-service/                 # Python FastAPI microservice
│   ├── main.py                 # BiRefNet / rembg endpoints
│   ├── requirements.txt        # GPU dependencies
│   ├── requirements-cpu.txt    # CPU-only dependencies
│   └── Dockerfile
├── storage/                    # Auto-created at runtime
│   ├── temp/                   # Downloaded input files
│   └── output/                 # Processed result files
├── logs/                       # Auto-created at runtime
├── .env                        # Environment variables
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Option 1: Local Development (No Docker)

### Prerequisites
- Node.js 18+
- Python 3.10+
- Redis (optional, falls back to in-memory queue)

### Step 1: Install Node dependencies
```bash
npm install
```

### Step 2: Set up Python AI service
```bash
cd ai-service
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# CPU-only (recommended for development):
pip install -r requirements-cpu.txt

# GPU (production):
pip install -r requirements.txt
```

### Step 3: Configure environment
Edit `.env` — the bot token is already set. Adjust other values as needed.

### Step 4: Start services

Terminal 1 — AI service:
```bash
cd ai-service
python main.py
```

Terminal 2 — Bot:
```bash
npm start
```

---

## Option 2: Docker Compose (Recommended for Production)

### Prerequisites
- Docker 24+
- Docker Compose v2

### Step 1: Configure
```bash
# Edit .env and set your BOT_TOKEN
# (already set in .env)
```

### Step 2: Build and start
```bash
docker compose up -d --build
```

### Step 3: Check logs
```bash
docker compose logs -f bot
docker compose logs -f ai-service
```

### Step 4: Stop
```bash
docker compose down
```

---

## Option 3: VPS Deployment (Ubuntu 22.04)

### Step 1: Server setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git curl

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone and configure
```bash
git clone <your-repo> bgbot
cd bgbot
cp .env.example .env
nano .env  # Set BOT_TOKEN and other values
```

### Step 3: Deploy
```bash
docker compose up -d --build
```

### Step 4: Auto-restart on reboot
```bash
sudo systemctl enable docker
# docker compose already uses restart: unless-stopped
```

### Step 5: Monitor
```bash
# View logs
docker compose logs -f

# Check health
curl http://localhost:3000/health
curl http://localhost:8000/health

# Queue stats
curl http://localhost:3000/stats
```

---

## GPU Support (Optional, for faster AI)

In `docker-compose.yml`, uncomment the GPU section under `ai-service`:
```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

Also install NVIDIA Container Toolkit:
```bash
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `BOT_TOKEN` | (set) | Telegram bot token |
| `REDIS_HOST` | 127.0.0.1 | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `AI_SERVICE_URL` | http://localhost:8000 | Python AI service URL |
| `MAX_IMAGES_PER_SESSION` | 20 | Max photos per user session |
| `MAX_FILE_SIZE_MB` | 10 | Max upload size in MB |
| `SESSION_TIMEOUT_MINUTES` | 30 | Session expiry time |
| `MAX_REQUESTS_PER_MINUTE` | 10 | Anti-spam: requests/minute |
| `MAX_REQUESTS_PER_HOUR` | 100 | Anti-spam: requests/hour |
| `CLEANUP_INTERVAL_MINUTES` | 60 | How often to clean temp files |

---

## Bot Commands

| Command | Description |
|---|---|
| `/start` | Welcome message, start session |
| `/reset` | Clear current session |
| `/status` | Show how many photos uploaded |
| `/help` | Show help guide |

---

## Bot Flow

```
User sends /start
    ↓
User uploads photos (1–20)
    ↓
User presses "Done" button
    ↓
Bot asks for background image
    ↓
User uploads background
    ↓
Bot queues processing job
    ↓
AI removes background from each photo
    ↓
Sharp composites subject onto new background
    ↓
Bot sends each result photo
    ↓
User can download all as ZIP
```

---

## Scaling for Thousands of Users

- **Redis + Bull**: Handles concurrent job queues across multiple workers
- **Horizontal scaling**: Run multiple bot instances behind a load balancer (use webhook mode instead of polling)
- **Webhook mode**: For production, switch from polling to webhooks:
  ```js
  // In src/index.js, replace bot.launch() with:
  await bot.launch({ webhook: { domain: 'https://yourdomain.com', port: 3000 } });
  ```
- **Separate workers**: Run `node src/workers/imageWorker.js` on dedicated machines
- **Object storage**: Replace local `storage/` with S3/MinIO for multi-instance setups
