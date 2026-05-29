# ⚡️ Botni Tezlashtirish

## 🔍 Muammoni aniqlash

### 1. AI service ishlab turibdimi?

```cmd
curl http://localhost:8000/health
```

Yoki brauzerda: `http://localhost:8000/health`

**Natija:**
```json
{
  "status": "ok",
  "model_ready": true,
  "model": "u2net",
  "max_size": 512
}
```

### 2. Loglarni tekshirish

```cmd
type logs\combined.log
type logs\error.log
```

## ⚡️ Tezlashtirish usullari

### 1. AI service sozlamalari

`.env` faylida:
```env
# Eng tez rejim
MAX_SIZE=512

# Yoki yanada tezroq
MAX_SIZE=384
```

**Tavsiya:**
- `MAX_SIZE=384` - Eng tez (1-3s)
- `MAX_SIZE=512` - Tez (2-5s)
- `MAX_SIZE=640` - O'rta (5-10s)
- `MAX_SIZE=1024` - Sifatli (15-30s)

### 2. AI service ni qayta ishga tushirish

```cmd
cd ai-service
python main.py
```

### 3. Redis ishlab turibdimi?

Redis kerak emas, lekin agar ishlatmoqchi bo'lsangiz:

```cmd
redis-server
```

Yoki Redis ni o'chirish:
- `src/queue/imageQueue.js` faylida Bull o'rniga oddiy queue ishlatish

### 4. Rasmlarni parallel ishlov berish

`ai-service/main.py` da:
```python
# Workers sonini oshirish
_executor = ThreadPoolExecutor(max_workers=4)  # 4 → 8
```

### 5. HD rejimni o'chirish

`src/ai/processor.js` da:
```javascript
// HD rejimni o'chirish
form.append('hd_mode', 'false');  // Har doim false
```

### 6. Rasm o'lchamini kamaytirish

Telegram dan kelgan rasmlarni kichiklashtirish:

`src/utils/telegram.js` ga qo'shish:
```javascript
const sharp = require('sharp');

// Rasmni kichiklashtirish
await sharp(filePath)
  .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
  .toFile(outputPath);
```

### 7. Timeout ni oshirish

`src/ai/processor.js` da:
```javascript
const response = await axios.post(`${AI_SERVICE_URL}/remove-background`, form, {
  timeout: 300000,  // 5 minut
  // ...
});
```

## 🚀 Optimal sozlamalar

### Tez rejim (tavsiya):

`.env`:
```env
MAX_SIZE=384
MAX_IMAGES_PER_SESSION=10
MAX_FILE_SIZE_MB=5
```

`ai-service/main.py`:
```python
_executor = ThreadPoolExecutor(max_workers=8)
MAX_SIZE = int(os.getenv("MAX_SIZE", "384"))
```

### Sifatli rejim:

`.env`:
```env
MAX_SIZE=768
MAX_IMAGES_PER_SESSION=5
MAX_FILE_SIZE_MB=10
```

## 🔧 Muammolarni hal qilish

### 1. AI service ishlamayapti

```cmd
cd ai-service
python main.py
```

**Xato:** `ModuleNotFoundError: No module named 'rembg'`

**Yechim:**
```cmd
pip install -r requirements.txt
```

### 2. Bot qotib qoladi

**Sabab:** AI service juda sekin

**Yechim:**
```env
MAX_SIZE=384  # Kichikroq o'lcham
```

### 3. Xotira tugayapti

**Sabab:** Ko'p rasmlar bir vaqtda

**Yechim:**
```env
MAX_IMAGES_PER_SESSION=5  # Kamroq rasmlar
```

### 4. CPU 100%

**Sabab:** Ko'p worker

**Yechim:**
```python
_executor = ThreadPoolExecutor(max_workers=2)  # Kamroq worker
```

## 📊 Tezlik taqqoslash

| MAX_SIZE | Tezlik | Sifat | Tavsiya |
|----------|--------|-------|---------|
| 384 | ⚡️⚡️⚡️ 1-3s | ⭐️⭐️⭐️ | Tez bot |
| 512 | ⚡️⚡️ 2-5s | ⭐️⭐️⭐️⭐️ | **Optimal** |
| 640 | ⚡️ 5-10s | ⭐️⭐️⭐️⭐️ | Yaxshi sifat |
| 768 | 🐌 10-15s | ⭐️⭐️⭐️⭐️⭐️ | Yuqori sifat |
| 1024 | 🐌🐌 15-30s | ⭐️⭐️⭐️⭐️⭐️ | Eng yuqori |

## 💡 Tavsiyalar

### Tez bot uchun:
```env
MAX_SIZE=384
MAX_IMAGES_PER_SESSION=10
MAX_FILE_SIZE_MB=5
```

### Sifatli bot uchun:
```env
MAX_SIZE=640
MAX_IMAGES_PER_SESSION=5
MAX_FILE_SIZE_MB=10
```

### Balans (tavsiya):
```env
MAX_SIZE=512
MAX_IMAGES_PER_SESSION=10
MAX_FILE_SIZE_MB=8
```

## 🔍 Diagnostika

### 1. Tezlikni o'lchash

```javascript
// src/ai/processor.js ga qo'shish
const startTime = Date.now();
await removeBackgroundAI(inputPath, outputPath, options);
const duration = Date.now() - startTime;
logger.info(`Rasm ishlandi: ${duration}ms`);
```

### 2. Loglarni kuzatish

```cmd
# Windows
Get-Content logs\combined.log -Wait -Tail 50

# Yoki
type logs\combined.log
```

### 3. AI service loglarini ko'rish

AI service terminalida ko'rinadi:
```
INFO: Ishlanmoqda: image.jpg | 150KB | hd=false
INFO: Tayyor: image.jpg -> 80KB
```

## 🎯 Xulosa

**Eng tez sozlamalar:**
1. `MAX_SIZE=384` - Eng tez
2. `max_workers=8` - Ko'proq parallel
3. `MAX_IMAGES_PER_SESSION=10` - Cheklangan
4. AI service ishlab turishi kerak

**Tekshirish:**
```cmd
# 1. AI service
curl http://localhost:8000/health

# 2. Bot
npm start

# 3. Test
Telegram da rasm yuboring va vaqtni o'lchang
```

---

**Versiya:** 2.6.0  
**Admin:** @RootDev07
