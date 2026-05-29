# 📝 O'zgarishlar tarixi

## 🎉 Versiya 2.0.0 (2026-05-28)

### ✨ Yangi funksiyalar

#### 1. 📱 Telefon raqamini avtomatik olish
- `/start` bosilganda telefon raqamini so'raydi
- Telegram contact button orqali avtomatik ulashish
- Raqam `userManager` da saqlanadi
- Majburiy - raqamsiz bot ishlamaydi

#### 2. 💰 Bepul limit tizimi
- **Birinchi 2 ta rasm BEPUL!** 🎁
- 3-chi rasmdan boshlab: **500 so'm/rasm**
- Avtomatik limit tekshiruvi
- Rejim tanlanganda darhol tekshiriladi

#### 3. 💳 To'lov tizimi
- Karta raqami: `8600 1234 5678 9012`
- Ism: ROOTDEV
- Screenshot orqali to'lov
- Admin tasdiqlash tizimi
- Balans boshqaruvi

#### 4. 👨‍💼 Admin panel
- To'lovni tasdiqlash: `/approve_USERID_SUMMA`
- Screenshot avtomatik adminlarga yuboriladi
- Foydalanuvchiga avtomatik xabar
- Admin ID tekshiruvi

#### 5. ⚡️ Kreativ emojilar
- Rasm ishlanayotganda: ⚡️ 🔥 ✨ 💫 ⭐️ 🌟 💥 🎨
- Progress bar yanada chiroyli
- Har bir rasm uchun boshqa emoji
- Foydalanuvchi tajribasi yaxshilandi

#### 6. 🖼 Fon rasmi to'g'rilandi
- Fon rasmi **hech qachon kesilmaydi**
- Subject rasm **90% o'lchamda** (oldin 70% edi)
- Markazga to'g'ri joylashtirish
- `add_bg` va `remove_add_bg` rejimlari to'g'rilandi

### 📋 Yangi buyruqlar

#### Foydalanuvchi:
- `/start` - Botni boshlash va telefon raqamini ulashish
- `/status` - Statistika (ishlangan rasmlar, bepul qoldi, balans)
- `/balance` - Balans va to'ldirish
- `/reset` - Sessiyani tozalash
- `/help` - Yordam

#### Admin:
- `/approve_USERID_SUMMA` - To'lovni tasdiqlash

### 🔧 Yangi fayllar

1. **`src/utils/userManager.js`** - Foydalanuvchi boshqaruvi
   - `getOrCreateUser()` - Foydalanuvchini olish/yaratish
   - `savePhoneNumber()` - Telefon raqamini saqlash
   - `canUseFreeImages()` - Bepul rasmlar qoldimi?
   - `calculatePayment()` - To'lov hisob-kitobi
   - `recordProcessedImages()` - Rasmlarni hisobga olish
   - `addBalance()` - Balans qo'shish
   - `deductBalance()` - Balans yechish
   - `getUserStats()` - Statistika

2. **`README.md`** - To'liq qo'llanma
3. **`ADMIN_GUIDE.md`** - Admin uchun qo'llanma
4. **`CHANGELOG.md`** - O'zgarishlar tarixi
5. **`YANGILIKLAR.md`** - Yangiliklar (O'zbek)
6. **`BEPUL_LIMIT.md`** - Bepul limit tizimi

### 🔄 Yangilangan fayllar

1. **`src/bot/handlers.js`**
   - Telefon raqamini qabul qilish
   - Bepul limit tekshiruvi
   - To'lov screenshot qabul qilish
   - Admin tasdiqlash
   - Balans to'ldirish

2. **`src/bot/messages.js`**
   - PRO versiya xabarlari
   - Kreativ emojilar
   - To'lov xabarlari
   - Karta raqami va support username

3. **`src/bot/keyboards.js`**
   - Telefon raqam tugmasi
   - Balans to'ldirish tugmalari
   - To'lov tugmalari

4. **`src/workers/imageWorker.js`**
   - Kreativ emojilar
   - Ishlangan rasmlarni hisobga olish
   - `userManager` integratsiyasi

5. **`src/ai/processor.js`**
   - Fon rasmi kesilish muammosi hal qilindi
   - Subject rasm 90% o'lchamda
   - `addBackgroundToImage()` to'g'rilandi
   - `compositeWithBackground()` to'g'rilandi

6. **`.env`**
   - `ADMIN_ID` - Admin Telegram ID
   - `PAYMENT_CARD` - To'lov karta raqami
   - `PAYMENT_NAME` - To'lov ism
   - `SUPPORT_USERNAME` - Qo'llab-quvvatlash username

### 🐛 Tuzatilgan xatolar

1. ✅ Fon rasmi kesilishi muammosi
2. ✅ Subject rasm juda kichik bo'lishi
3. ✅ Telefon raqamini olish
4. ✅ Bepul limit tekshiruvi
5. ✅ To'lov screenshot qabul qilish

### 📊 Statistika

- **Yangi kod qatorlari:** ~500+
- **Yangi fayllar:** 6
- **Yangilangan fayllar:** 6
- **Yangi funksiyalar:** 10+
- **Tuzatilgan xatolar:** 5

### 🎯 Keyingi versiya (3.0.0)

#### Rejalashtirilgan:

1. **To'lov gateway** (Click, Payme, Uzum Bank)
2. **Database** (PostgreSQL yoki MongoDB)
3. **Admin panel** (web interface)
4. **Statistika dashboard**
5. **Foydalanuvchilar boshqaruvi**
6. **To'lov tarixi**
7. **Avtomatik to'lov tasdiqlash**

---

## 📜 Versiya 1.0.0 (2026-05-27)

### ✨ Dastlabki versiya

- Telegram bot asoslari
- AI orqa fon olib tashlash
- 3 ta rejim: remove_bg, add_bg, remove_add_bg
- Sharp va rembg integratsiyasi
- Queue tizimi (Bull)
- Session boshqaruvi
- Rate limiting
- Cleanup worker

---

**Muallif:** RootDev  
**Qo'llab-quvvatlash:** @RootDev07  
**Joriy versiya:** 2.0.0
