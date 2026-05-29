# 💰 Admin - Hisob To'ldirish

## 🎯 Yangi funksiya: Chat ID bo'yicha hisob to'ldirish

### 1. Admin panelga kirish

```
/admin
```

### 2. Hisob to'ldirish tugmasini bosish

```
💰 Hisob to'ldirish
```

### 3. Chat ID ni yuborish

```
Foydalanuvchining Chat ID sini yuboring.

Misol: 123456789
```

**Chat ID ni qayerdan olish:**
- Foydalanuvchi botga `/start` yuboradi
- Admin panelda "👥 Barcha foydalanuvchilar" da ko'rish mumkin
- Yoki foydalanuvchidan so'rang

### 4. Rasm limiti tanlash

```
💰 Hisob to'ldirish

👤 Foydalanuvchi: Javohir Abdullayev
🆔 Chat ID: 123456789

Qancha rasm limiti qo'shasiz?

[2 ta rasm] [5 ta rasm] [10 ta rasm]
[20 ta rasm] [50 ta rasm] [100 ta rasm]
```

### 5. Tasdiqlash

```
✅ Rasm limiti qo'shildi!

👤 User ID: 123456789
🎁 Qo'shildi: 10 ta rasm

Foydalanuvchi endi 10 ta rasm qo'shimcha qila oladi!
```

## 📋 Misol

### Stsenariy 1: Yangi foydalanuvchiga bonus

```
1. /admin
2. "💰 Hisob to'ldirish"
3. Chat ID: 123456789
4. "10 ta rasm"
5. ✅ Tayyor!
```

**Natija:**
- Foydalanuvchi 2 ta bepul + 10 ta bonus = 12 ta rasm qila oladi

### Stsenariy 2: Faol foydalanuvchiga mukofot

```
1. /admin
2. "💰 Hisob to'ldirish"
3. Chat ID: 987654321
4. "50 ta rasm"
5. ✅ Tayyor!
```

**Natija:**
- Foydalanuvchi 50 ta rasm qo'shimcha qila oladi

## 🔍 Chat ID bo'yicha qidirish

### 1. Admin panelda

```
/admin
```

### 2. Qidirish tugmasini bosish

```
🔍 Chat ID bo'yicha qidirish
```

### 3. Chat ID ni yuborish

```
123456789
```

### 4. Foydalanuvchi tafsilotlari

```
👤 Foydalanuvchi tafsilotlari

🆔 ID: 123456789
👤 Ism: Javohir Abdullayev
📱 Telefon: +998901234567

📊 Statistika:
📸 Ishlangan rasmlar: 5
🎁 Bepul rasmlar qoldi: 0
💰 Balans: 2,500 so'm
```

## 💡 Qanday ishlaydi?

### Rasm limiti qo'shish:

```javascript
// processedImages ni kamaytirish
const newProcessed = Math.max(0, user.processedImages - count);
userManager.updateUser(userId, { processedImages: newProcessed });
```

**Misol:**
- Foydalanuvchi 5 ta rasm ishlagan
- Admin 10 ta rasm qo'shadi
- Yangi processedImages: 0 (5 - 10 = -5, lekin 0 dan kam bo'lmaydi)
- Bepul rasmlar: 2 ta (FREE_IMAGES_COUNT - 0)

## 📊 Variantlar

### Rasm limiti:
- 2 ta rasm
- 5 ta rasm
- 10 ta rasm
- 20 ta rasm
- 50 ta rasm
- 100 ta rasm

### Balans qo'shish:
- 5,000 so'm
- 10,000 so'm
- 25,000 so'm
- 50,000 so'm
- 100,000 so'm

## 🎯 Foydalanish holatlari

### 1. Yangi foydalanuvchiga bonus
```
Chat ID: 123456789
Rasm limiti: 5 ta
Natija: 2 + 5 = 7 ta bepul rasm
```

### 2. Faol foydalanuvchiga mukofot
```
Chat ID: 987654321
Rasm limiti: 20 ta
Natija: 20 ta qo'shimcha rasm
```

### 3. Muammoli foydalanuvchiga yordam
```
Chat ID: 555555555
Rasm limiti: 10 ta
Natija: 10 ta qo'shimcha rasm
```

### 4. Aksiya ishtirokchisiga sovg'a
```
Chat ID: 777777777
Rasm limiti: 50 ta
Natija: 50 ta qo'shimcha rasm
```

## 🔐 Xavfsizlik

### Faqat admin:
- Chat ID ni faqat admin ko'ra oladi
- Hisob to'ldirishni faqat admin amalga oshiradi
- Barcha o'zgarishlar logga yoziladi

### Tekshirish:
```javascript
if (!adminPanel.isAdmin(ctx.from.id)) {
  return ctx.reply('❌ Sizda admin huquqi yo\'q.');
}
```

## 📝 Loglar

### Rasm limiti qo'shilganda:
```
[INFO] User 123456789: 10 ta rasm qo'shildi (yangi: 0)
```

### Foydalanuvchiga xabar:
```
🎉 Sizga bepul rasmlar berildi!

🎁 10 ta rasm bepul!
📸 Jami bepul rasmlar: 12

Endi rasmlarni ishlashingiz mumkin!

❓ Savollar: @RootDev07
```

## 🚀 Keyingi qadamlar

1. **Balans va rasm limiti birga** - ikkalasini ham qo'shish
2. **Tarix** - kim, qachon, qancha qo'shgan
3. **Statistika** - jami qo'shilgan limitlar
4. **Export** - Excel/CSV formatda

---

**Admin:** @RootDev07  
**Chat ID:** 5834939103  
**Versiya:** 2.4.0
