# 💰 Balans Tizimi

## ✅ Qanday ishlaydi?

### 1. **Avtomatik to'lov**

Foydalanuvchi rasmlarni yuklaydi va "✅ Tayyor" tugmasini bosadi:

#### Agar balans yetarli bo'lsa:
```
✅ To'lov muvaffaqiyatli!

💰 Balansdan yechildi: 15,000 so'm
💳 Qolgan balans: 10,000 so'm

Rasmlar ishlanmoqda... ⚡️
```

#### Agar balans yetarli bo'lmasa:
```
❌ Balans yetarli emas

Kerak: 15,000 so'm
Mavjud: 5,000 so'm
Yetishmaydi: 10,000 so'm

Iltimos, balansni to'ldiring:

[5,000 so'm] [10,000 so'm] [20,000 so'm]
[50,000 so'm] [100,000 so'm]
```

### 2. **Balans to'ldirish**

#### Foydalanuvchi:
1. Karta raqamiga to'lov qiladi
2. Screenshot yuboradi
3. Admin tasdiqlaydi
4. Balans to'ldiriladi

#### Admin:
1. `/admin`
2. "💰 Hisob to'ldirish"
3. Chat ID: 123456789
4. Balans qo'shadi

## 📊 Hisob-kitob

### Misol 1: Bepul rasmlar tugagan

**Foydalanuvchi:**
- Ishlangan rasmlar: 2
- Bepul rasmlar qoldi: 0
- Balans: 25,000 so'm

**Yangi rasmlar:** 5 ta

**Hisob:**
- Bepul: 0 ta
- Pulli: 5 ta × 5,000 = 25,000 so'm
- Jami: 25,000 so'm

**Natija:**
- Balansdan yechildi: 25,000 so'm
- Qolgan balans: 0 so'm
- Rasmlar ishlanadi ✅

### Misol 2: Balans yetarli emas

**Foydalanuvchi:**
- Ishlangan rasmlar: 5
- Bepul rasmlar qoldi: 0
- Balans: 10,000 so'm

**Yangi rasmlar:** 3 ta

**Hisob:**
- Bepul: 0 ta
- Pulli: 3 ta × 5,000 = 15,000 so'm
- Jami: 15,000 so'm

**Natija:**
- Balans yetarli emas ❌
- Kerak: 15,000 so'm
- Mavjud: 10,000 so'm
- Yetishmaydi: 5,000 so'm
- Balans to'ldirish taklif qilinadi

### Misol 3: Bepul rasmlar bor

**Foydalanuvchi:**
- Ishlangan rasmlar: 0
- Bepul rasmlar qoldi: 2
- Balans: 0 so'm

**Yangi rasmlar:** 2 ta

**Hisob:**
- Bepul: 2 ta
- Pulli: 0 ta
- Jami: 0 so'm

**Natija:**
- To'lov kerak emas ✅
- Rasmlar ishlanadi

### Misol 4: Qisman bepul

**Foydalanuvchi:**
- Ishlangan rasmlar: 1
- Bepul rasmlar qoldi: 1
- Balans: 20,000 so'm

**Yangi rasmlar:** 5 ta

**Hisob:**
- Bepul: 1 ta
- Pulli: 4 ta × 5,000 = 20,000 so'm
- Jami: 20,000 so'm

**Natija:**
- Balansdan yechildi: 20,000 so'm
- Qolgan balans: 0 so'm
- Rasmlar ishlanadi ✅

## 💳 Admin balans qo'shish

### Jarayon:

```
1. /admin
2. "💰 Hisob to'ldirish"
3. Chat ID: 123456789
4. Balans tanlash:
   - 5,000 so'm
   - 10,000 so'm
   - 25,000 so'm
   - 50,000 so'm
   - 100,000 so'm
5. ✅ Tasdiqlash
```

### Natija:

**Admin ko'radi:**
```
✅ Balans qo'shildi!

👤 User ID: 123456789
💰 Qo'shildi: +10,000 so'm
💳 Yangi balans: 10,000 so'm
```

**Foydalanuvchi oladi:**
```
🎉 Sizga balans qo'shildi!

💰 +10,000 so'm
💳 Yangi balans: 10,000 so'm

Endi rasmlarni ishlashingiz mumkin!

❓ Savollar: @RootDev07
```

## 🎁 Rasm limiti qo'shish

### Jarayon:

```
1. /admin
2. "💰 Hisob to'ldirish"
3. Chat ID: 123456789
4. Rasm limiti tanlash:
   - 2 ta rasm
   - 5 ta rasm
   - 10 ta rasm
   - 20 ta rasm
   - 50 ta rasm
   - 100 ta rasm
5. ✅ Tasdiqlash
```

### Qanday ishlaydi:

```javascript
// processedImages ni kamaytirish
const newProcessed = Math.max(0, user.processedImages - count);
```

**Misol:**
- Foydalanuvchi 5 ta rasm ishlagan
- Admin 10 ta rasm qo'shadi
- Yangi processedImages: 0
- Bepul rasmlar: 2 ta

## 📊 Statistika

### Foydalanuvchi:

```
/status

📊 Statistika
📸 Ishlangan rasmlar: 5
🎁 Bepul rasmlar qoldi: 0
💰 Balans: 25,000 so'm
```

### Balans:

```
/balance

💰 Balans

💳 Joriy balans: 25,000 so'm
📊 Ishlangan rasmlar: 5
🎁 Bepul rasmlar qoldi: 0
```

## 🔄 To'lov jarayoni

### 1. Rasmlar yuklash
```
1. Rejim tanlash
2. Rasmlarni yuborish
3. "✅ Tayyor" tugmasini bosish
```

### 2. To'lov tekshiruvi
```
Avtomatik:
- Bepul rasmlar bormi?
- Balans yetarlimi?
```

### 3. Natija

#### A. Bepul rasmlar bor:
```
⚡️ Rasmlar ishlanmoqda...
```

#### B. Balans yetarli:
```
✅ To'lov muvaffaqiyatli!
💰 Balansdan yechildi: 15,000 so'm
⚡️ Rasmlar ishlanmoqda...
```

#### C. Balans yetarli emas:
```
❌ Balans yetarli emas
Iltimos, balansni to'ldiring:
[5,000] [10,000] [20,000] [50,000] [100,000]
```

## 💡 Afzalliklar

### Foydalanuvchi uchun:
- ✅ Avtomatik to'lov
- ✅ Balans tizimi
- ✅ Aniq hisob-kitob
- ✅ Tez ishlov

### Admin uchun:
- ✅ Balans qo'shish
- ✅ Rasm limiti qo'shish
- ✅ To'liq nazorat
- ✅ Statistika

## 🎯 Xulosa

**Balans tizimi to'liq ishlaydi:**
- ✅ Avtomatik to'lov
- ✅ Balansdan yechish
- ✅ Admin balans qo'shish
- ✅ Rasm limiti qo'shish
- ✅ To'liq statistika

---

**Versiya:** 2.5.0 (Final)  
**Admin:** @RootDev07  
**Chat ID:** 5834939103
