# 🎨 AI Background Removal Bot

Telegram bot for AI-powered background removal and replacement.

**Version:** 1.0.0

## ✨ Features

- 🖼️ **Remove Background** - AI orqa fonni olib tashlash
- 🎨 **Add Background** - Yangi orqa fon qo'shish
- 🔄 **Remove + Add** - Fonni olib tashlash va yangi fon qo'yish
- 💰 **Payment System** - Balans va to'lov tizimi
- 🎁 **Free Images** - Har bir foydalanuvchi uchun 2 ta bepul rasm
- 👨‍💼 **Admin Panel** - Foydalanuvchilarni boshqarish

## 🚀 Deployment (Railway)

### 1. GitHub ga push qiling:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Railway da deploy qiling:

1. [Railway.app](https://railway.app) ga kiring
2. "New Project" → "Deploy from GitHub repo"
3. Repository ni tanlang
4. Environment variables qo'shing:
   - `BOT_TOKEN` - Telegram bot token
   - `ADMIN_ID` - Admin chat ID
   - `MAX_SIZE` - 384 (tez) yoki 512 (sifatli)
   - Boshqa kerakli o'zgaruvchilar

### 3. Deploy!

Railway avtomatik deploy qiladi va bot ishga tushadi.

## 🛠️ Local Development

### Prerequisites:

- Node.js 18+
- Python 3.11+
- npm

### Installation:

```bash
# Dependencies o'rnatish
npm install

# Python dependencies
cd ai-service
pip install -r requirements.txt
cd ..

# .env faylni yaratish
cp .env.example .env
# .env faylda BOT_TOKEN ni to'ldiring
```

### Running:

```bash
# AI service
cd ai-service
python main.py

# Bot (boshqa terminalda)
npm start
```

## 📊 Pricing

- 🆓 **FREE**: 2 ta rasm bepul
- 🛒 **PRO**: 5,000 so'm/rasm
- 💳 **GOLD**: 50,000 so'm/oy (coming soon)

## 👨‍💻 Admin Commands

- `/admin` - Admin panel
- `/status` - Foydalanuvchi statistikasi
- `/pricing` - Tariflar

## 🔧 Configuration

`.env` faylda sozlamalar:

- `MAX_SIZE=384` - Eng tez (1-3s)
- `MAX_SIZE=512` - Optimal (2-5s)
- `MAX_SIZE=640` - Sifatli (5-10s)

## 📝 License

MIT

## 👤 Author

**RootDev** - [@RootDev07](https://t.me/RootDev07)

## 🙏 Support

Savollar uchun: [@RootDev07](https://t.me/RootDev07)
