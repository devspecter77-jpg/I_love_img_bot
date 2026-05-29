# 🚫 Bepul Limit Tizimi

## ✅ Qanday ishlaydi:

### 1. **Birinchi 2 ta rasm BEPUL** 🎁
- Har bir yangi foydalanuvchi 2 ta rasmni bepul ishlashi mumkin
- Telefon raqamini ulashgandan keyin aktivlashadi

### 2. **2 ta rasmdan keyin - PULLI** 💰
- 3-chi rasmdan boshlab: **500 so'm/rasm**
- Foydalanuvchi rejim tanlasa, darhol limit tekshiriladi
- Agar bepul rasmlar tugagan bo'lsa, balans to'ldirish taklif qilinadi

### 3. **Balans to'ldirish** 💳
- 5,000 so'm
- 10,000 so'm
- 20,000 so'm
- 50,000 so'm

## 📋 Foydalanuvchi tajribasi:

### Birinchi marta:
```
1. /start → Telefon raqamni ulashish
2. Rejim tanlash (🗑 🖼 🔄)
3. Rasmlarni yuborish
4. ✅ Tayyor
5. Natijalar (2 ta rasm bepul)
```

### 3-chi rasmdan:
```
1. /start → Bosh menyu
2. Rejim tanlash → ❌ Bepul limit tugadi!
3. Balans to'ldirish (5k, 10k, 20k, 50k)
4. Rejim tanlash → ✅ Davom etish
5. Rasmlarni yuborish
6. ✅ Tayyor → To'lovni tasdiqlash
7. Natijalar
```

## 🔍 Tekshirish jarayoni:

### Har bir rejim tanlanganda:
```javascript
// mode_remove_bg, mode_add_bg, mode_remove_add_bg
if (!userManager.canUseFreeImages(userId)) {
  // Bepul limit tugadi
  return ctx.reply(MESSAGES.FREE_LIMIT_REACHED(stats), {
    ...getKeyboard('add_balance'),
  });
}
```

### Rasmlar ishlanganidan keyin:
```javascript
// imageWorker.js
userManager.recordProcessedImages(userId, outputFiles.length);
```

## 📊 Buyruqlar:

- `/start` - Botni boshlash
- `/status` - Statistika (ishlangan rasmlar, bepul qoldi, balans)
- `/balance` - Balans va to'ldirish
- `/reset` - Sessiyani tozalash
- `/help` - Yordam

## 💡 Xususiyatlar:

### ✅ Qo'shilgan:
1. Bepul limit tekshiruvi (2 ta rasm)
2. Balans to'ldirish tizimi
3. To'lov hisob-kitobi
4. Foydalanuvchi statistikasi

### ⏳ Keyingi qadamlar:
1. To'lov gateway (Click, Payme, Uzum Bank)
2. Database (PostgreSQL/MongoDB)
3. Admin panel

## 🎯 Misol:

### Foydalanuvchi A:
- 1-chi rasm: ✅ Bepul (qoldi: 1)
- 2-chi rasm: ✅ Bepul (qoldi: 0)
- 3-chi rasm: ❌ Balans to'ldiring!

### Foydalanuvchi B:
- Balans to'ldirdi: +10,000 so'm
- 3-chi rasm: ✅ -500 so'm (qoldi: 9,500)
- 4-chi rasm: ✅ -500 so'm (qoldi: 9,000)
- ...

## 🚀 Ishga tushirish:

```cmd
npm start
```

Botda sinab ko'ring:
1. `/start` - telefon raqamni ulashing
2. 2 ta rasm bepul ishlang
3. 3-chi rasmda limit xabari ko'rinadi
4. Balans to'ldiring
5. Davom eting!

## 📝 Muhim:

- Bepul limit **foydalanuvchi uchun** (telefon raqam bo'yicha)
- Balans **foydalanuvchi uchun** saqlanadi
- Har bir rasm **500 so'm**
- Birinchi **2 ta rasm BEPUL**

Hammasi tayyor! 🎉
