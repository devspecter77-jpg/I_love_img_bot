# 👨‍💼 Admin Panel

## 🔐 Kirish

### 1. Admin ID ni sozlash

`.env` faylida:
```env
ADMIN_ID=YOUR_TELEGRAM_ID
ADMIN_USERNAME=@RootDev07
```

### 2. Admin ID ni olish

1. [@userinfobot](https://t.me/userinfobot) ga o'ting
2. `/start` yuboring
3. O'z ID ingizni ko'ring
4. `.env` ga qo'ying

### 3. Admin panelga kirish

```
/admin
```

## 📊 Admin Panel Funksiyalari

### 1. 👥 Barcha foydalanuvchilar

Barcha foydalanuvchilar ro'yxatini ko'rish:
- Ism
- Telefon raqam
- User ID
- Ishlangan rasmlar
- Bepul rasmlar qoldi
- Balans

**Sahifalash:** 10 ta foydalanuvchi/sahifa

### 2. 👤 Foydalanuvchi tafsilotlari

Har bir foydalanuvchi uchun:
- To'liq ma'lumotlar
- Statistika
- Ro'yxatdan o'tgan sana
- Oxirgi faollik

### 3. 💰 Balans qo'shish

Foydalanuvchiga balans qo'shish:
- 5,000 so'm
- 10,000 so'm
- 25,000 so'm
- 50,000 so'm
- 100,000 so'm

**Natija:**
- Foydalanuvchiga avtomatik xabar
- Balans yangilanadi

### 4. 🎁 Bepul rasmlar berish

Foydalanuvchiga bepul rasmlar berish:
- 2 ta rasm
- 5 ta rasm
- 10 ta rasm
- 20 ta rasm
- 50 ta rasm

**Qanday ishlaydi:**
- `processedImages` kamayadi
- Bepul rasmlar ko'payadi
- Foydalanuvchiga xabar boradi

### 5. 📊 Umumiy statistika

- Jami foydalanuvchilar
- Telefon raqam berganlar
- FREE foydalanuvchilar
- PRO foydalanuvchilar
- Jami ishlangan rasmlar
- Jami balans
- O'rtacha ko'rsatkichlar

## 🎯 Foydalanish

### Admin panel ochish:

```
/admin
```

### Foydalanuvchilar ro'yxati:

```
👥 Foydalanuvchilar ro'yxati
📄 Sahifa 1/5

1. Javohir Abdullayev
   📱 +998901234567
   🆔 123456789
   📸 5 | 🎁 0 | 💰 2,500

2. Alisher Karimov
   📱 +998901234568
   🆔 987654321
   📸 2 | 🎁 0 | 💰 0

...
```

### Foydalanuvchi tafsilotlari:

```
👤 Foydalanuvchi tafsilotlari

🆔 ID: 123456789
👤 Ism: Javohir Abdullayev
📱 Telefon: +998901234567
🔗 Username: @javohir

📊 Statistika:
📸 Ishlangan rasmlar: 5
🎁 Bepul rasmlar qoldi: 0
💰 Balans: 2,500 so'm

📅 Ro'yxatdan o'tgan: 28.05.2026, 10:30
🔄 Oxirgi faollik: 28.05.2026, 15:45
```

### Balans qo'shish:

1. Foydalanuvchini tanlang
2. "💰 Balans qo'shish" tugmasini bosing
3. Summani tanlang
4. Tasdiqlang

**Natija:**
```
✅ Balans qo'shildi!

👤 User ID: 123456789
💰 Qo'shildi: +10,000 so'm
💳 Yangi balans: 12,500 so'm
```

**Foydalanuvchiga xabar:**
```
🎉 Sizga balans qo'shildi!

💰 +10,000 so'm
💳 Yangi balans: 12,500 so'm

Endi rasmlarni ishlashingiz mumkin!

❓ Savollar: @RootDev07
```

### Bepul rasmlar berish:

1. Foydalanuvchini tanlang
2. "🎁 Bepul rasmlar berish" tugmasini bosing
3. Sonini tanlang
4. Tasdiqlang

**Natija:**
```
✅ Bepul rasmlar berildi!

👤 User ID: 123456789
🎁 Berildi: 10 ta rasm
📸 Yangi ishlangan: 0
🎁 Bepul qoldi: 2
```

**Foydalanuvchiga xabar:**
```
🎉 Sizga bepul rasmlar berildi!

🎁 10 ta rasm bepul!
📸 Jami bepul rasmlar: 2

Endi rasmlarni ishlashingiz mumkin!

❓ Savollar: @RootDev07
```

## 📋 Admin Buyruqlari

### Asosiy:
- `/admin` - Admin panel
- `/approve_USERID_SUMMA` - To'lovni tasdiqlash

### Misol:
```
/admin
/approve_123456789_10000
```

## 🔍 Qidirish

Foydalanuvchini qidirish (keyingi versiyada):
- Telefon raqam bo'yicha
- User ID bo'yicha
- Ism bo'yicha

## 📊 Statistika

### Umumiy:
```
📊 Umumiy statistika

👥 Foydalanuvchilar:
├ Jami: 150
├ Telefon raqam bergan: 145
├ Telefon raqam bermagan: 5
├ FREE foydalanuvchilar: 80
└ PRO foydalanuvchilar: 70

📸 Rasmlar:
├ Jami ishlangan: 450
└ O'rtacha: 3.0 ta/user

💰 Balans:
├ Jami: 125,000 so'm
└ O'rtacha: 833 so'm/user
```

## 🎯 Misol Stsenariylar

### 1. Foydalanuvchiga balans qo'shish:

```
1. /admin
2. "👥 Barcha foydalanuvchilar"
3. Foydalanuvchini tanlang
4. "💰 Balans qo'shish"
5. "10,000 so'm"
6. ✅ Tayyor!
```

### 2. Bepul rasmlar berish:

```
1. /admin
2. "👥 Barcha foydalanuvchilar"
3. Foydalanuvchini tanlang
4. "🎁 Bepul rasmlar berish"
5. "10 ta rasm"
6. ✅ Tayyor!
```

### 3. Statistikani ko'rish:

```
1. /admin
2. "📊 Statistika"
3. Ko'ring!
```

## 🔐 Xavfsizlik

### Admin tekshiruvi:
```javascript
function isAdmin(userId) {
  return userId.toString() === ADMIN_ID;
}
```

### Faqat admin:
- Admin panel
- Foydalanuvchilar ro'yxati
- Balans qo'shish
- Bepul rasmlar berish
- Statistika

## 💡 Maslahatlar

1. **Muntazam tekshiring** - har kuni statistikani ko'ring
2. **Tez javob bering** - foydalanuvchilar kutishni yoqtirmaydi
3. **Balans qo'shing** - faol foydalanuvchilarga
4. **Bepul rasmlar bering** - yangi foydalanuvchilarga
5. **Statistikani tahlil qiling** - qaysi funksiyalar ko'p ishlatiladi

## 🚀 Keyingi versiya

### Rejalashtirilgan:
1. **Qidirish** - telefon, ID, ism bo'yicha
2. **Export** - Excel/CSV formatda
3. **Grafik** - statistika grafiklari
4. **Xabar yuborish** - barcha foydalanuvchilarga
5. **Filtr** - FREE/PRO bo'yicha
6. **Tarif o'zgartirish** - GOLD tarifga o'tkazish

---

**Admin:** @RootDev07  
**Versiya:** 2.2.0
