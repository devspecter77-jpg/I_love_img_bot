# 📱 Telefon Raqam Tizimi

## ✅ Qanday ishlaydi?

### 1. **Telefon raqam bo'yicha aniqlash**

Foydalanuvchi telefon raqamini ulashganda:
- Avval bu raqam bazada borligini tekshiradi
- Agar bor bo'lsa, eski ma'lumotlarni qaytaradi
- Agar yo'q bo'lsa, yangi foydalanuvchi yaratadi

### 2. **Eski foydalanuvchi**

Agar telefon raqam avval ishlatilgan bo'lsa:

```
✅ Xush kelibsiz!

📱 Telefon: +998901234567

📊 Sizning statistikangiz:
📸 Ishlangan rasmlar: 5
🎁 Bepul rasmlar qoldi: 0
💰 Balans: 2,500 so'm

💎 PRO tarifdan foydalaning!
```

### 3. **Yangi foydalanuvchi**

Agar telefon raqam yangi bo'lsa:

```
✅ Telefon raqam qabul qilindi: +998901234567

Endi botdan foydalanishingiz mumkin!
```

## 🔍 Tekshirish jarayoni

### Telefon raqamni tozalash:

```javascript
// +998 90 123-45-67 → 998901234567
const cleanPhone = phoneNumber.replace(/[\s\+\-\(\)]/g, '');
```

### Foydalanuvchini topish:

```javascript
function findUserByPhone(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/[\s\+\-\(\)]/g, '');
  
  for (const [userId, user] of users.entries()) {
    if (user.phoneNumber) {
      const userCleanPhone = user.phoneNumber.replace(/[\s\+\-\(\)]/g, '');
      if (userCleanPhone === cleanPhone) {
        return user;
      }
    }
  }
  return null;
}
```

## 📊 Misol

### Foydalanuvchi A (yangi):
1. Telegram ID: `123456789`
2. Telefon: `+998901234567`
3. Ishlangan rasmlar: `0`
4. Bepul rasmlar: `2`

### Foydalanuvchi A (qayta kirdi):
1. Telegram ID: `987654321` (yangi akkaunt)
2. Telefon: `+998901234567` (eski raqam)
3. Ishlangan rasmlar: `5` (eski ma'lumot)
4. Bepul rasmlar: `0` (eski ma'lumot)
5. Balans: `2,500 so'm` (eski ma'lumot)

## 💎 Tariflar

### 🆓 FREE
- 2 ta rasm bepul
- Barcha funksiyalar
- Telefon raqam kerak

### 🛒 PRO
- 500 so'm/rasm
- Cheksiz rasmlar
- Yuqori sifat
- Tez ishlov

### 💳 GOLD (Tez orada)
- 10,000 so'm/oy
- Cheksiz rasmlar
- Eng yuqori sifat
- Birinchi navbat
- Premium qo'llab-quvvatlash

## 🎯 Foydalanuvchi tajribasi

### Birinchi marta:
```
1. /start
2. 📱 Telefon raqamni ulashish
3. ✅ Yangi foydalanuvchi
4. 🎁 2 ta rasm bepul
```

### Qayta kirish (boshqa akkaunt):
```
1. /start
2. 📱 Telefon raqamni ulashish
3. ✅ Xush kelibsiz! (eski ma'lumotlar)
4. 📊 Statistika ko'rsatiladi
5. 💎 Agar bepul rasmlar tugagan bo'lsa, PRO taklif qilinadi
```

### Qayta kirish (eski akkaunt):
```
1. /start
2. 📱 Telefon raqam allaqachon saqlangan
3. 🏠 Bosh menyu
4. 📊 Statistika saqlanadi
```

## 🔐 Xavfsizlik

### Telefon raqam tekshiruvi:
```javascript
if (contact.user_id !== userId) {
  return ctx.reply('❌ Iltimos, o\'z telefon raqamingizni ulashing.');
}
```

### Ma'lumotlar ko'chirish:
```javascript
// Eski foydalanuvchi ma'lumotlarini yangi ID ga ko'chirish
userManager.updateUser(userId, {
  phoneNumber: contact.phone_number,
  processedImages: existingUser.processedImages,
  balance: existingUser.balance,
});
```

## 📋 Buyruqlar

- `/start` - Botni boshlash
- `/status` - Statistika
- `/balance` - Balans
- `/pricing` - Tariflar
- `/help` - Yordam

## 💡 Muhim

1. **Telefon raqam majburiy** - raqamsiz bot ishlamaydi
2. **Raqam bo'yicha aniqlash** - eski ma'lumotlar saqlanadi
3. **Bepul limit** - telefon raqam bo'yicha hisoblanadi
4. **Balans** - telefon raqam bo'yicha saqlanadi

## 🎉 Natija

- ✅ Foydalanuvchi telefon raqam bo'yicha aniqlanadi
- ✅ Eski ma'lumotlar saqlanadi
- ✅ Bepul limit telefon raqam bo'yicha
- ✅ Balans telefon raqam bo'yicha
- ✅ Tariflar aniq ko'rsatiladi

---

**Muallif:** RootDev  
**Qo'llab-quvvatlash:** @RootDev07  
**Versiya:** 2.1.0
