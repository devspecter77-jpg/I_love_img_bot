# 👨‍💼 Admin Qo'llanmasi

## 🔧 Sozlash

### 1. Admin ID ni olish

1. Telegram da [@userinfobot](https://t.me/userinfobot) ga o'ting
2. `/start` yuboring
3. O'z ID ingizni ko'ring (masalan: `123456789`)
4. `.env` fayliga qo'ying:

```env
ADMIN_ID=123456789
```

### 2. Botni qayta ishga tushirish

```cmd
npm start
```

## 💳 To'lovni tasdiqlash

### Jarayon:

1. **Foydalanuvchi to'lov qiladi**
   - Karta: `8600 1234 5678 9012`
   - Ism: ROOTDEV
   - Summa: masalan 5,000 so'm

2. **Foydalanuvchi screenshot yuboradi**
   - Botga rasm yuboradi
   - Caption: "to'lov" yoki "payment"

3. **Sizga xabar keladi**
   ```
   💳 Yangi to'lov screenshot
   
   👤 User: Javohir Abdullayev
   🆔 ID: 123456789
   📱 Username: @javohir
   
   Tasdiqlash uchun: /approve_123456789_5000
   ```

4. **Siz tasdiqlaysiz**
   ```
   /approve_123456789_5000
   ```

5. **Foydalanuvchiga xabar boradi**
   ```
   ✅ To'lovingiz tasdiqlandi!
   
   💰 +5,000 so'm
   💳 Yangi balans: 5,000 so'm
   
   Endi rasmlarni ishlashingiz mumkin!
   ```

## 📋 Admin buyruqlari

### `/approve_USERID_SUMMA`

To'lovni tasdiqlash va balansni to'ldirish.

**Misol:**
```
/approve_123456789_5000
/approve_987654321_10000
/approve_555555555_20000
```

**Format:**
- `USERID` - Foydalanuvchi ID (raqam)
- `SUMMA` - To'lov summasi (so'm)

## 📊 Statistika

### Foydalanuvchi statistikasi

Har bir foydalanuvchi uchun:
- Ishlangan rasmlar soni
- Bepul rasmlar qoldi
- Balans

### Kuzatish

Loglarni tekshiring:
```cmd
type logs\combined.log
type logs\error.log
```

## 🔍 To'lov screenshot tekshirish

### Qabul qilish shartlari:

1. Rasm bo'lishi kerak
2. Caption da "to'lov" yoki "payment" bo'lishi kerak
3. Yoki sessiya yo'q bo'lsa, avtomatik to'lov screenshot deb qabul qilinadi

### Misol caption:

```
to'lov
payment
To'lov qildim
Screenshot to'lov
```

## ⚠️ Muhim

### Xavfsizlik:

1. **Admin ID ni hech kimga bermang**
2. **Faqat siz tasdiqlashingiz mumkin**
3. **To'lov screenshot ni tekshiring**

### To'lovni tekshirish:

1. ✅ Summa to'g'rimi?
2. ✅ Karta raqam to'g'rimi?
3. ✅ Sana yangi mi?
4. ✅ Screenshot haqiqiymi?

### Agar shubhali bo'lsa:

1. Foydalanuvchiga yozing: @username
2. Qo'shimcha ma'lumot so'rang
3. Tasdiqlashdan oldin tekshiring

## 🚫 Rad etish

Agar to'lov noto'g'ri bo'lsa:

1. Foydalanuvchiga yozing
2. Muammoni tushuntiring
3. To'g'ri screenshot so'rang

**Misol xabar:**
```
❌ To'lov screenshot noto'g'ri.

Iltimos, quyidagilarni tekshiring:
- Summa to'g'ri ko'rsatilganmi?
- Karta raqam to'g'rimi?
- Screenshot aniq ko'rinmoqdami?

Qayta screenshot yuboring.
```

## 📈 Monitoring

### Kunlik tekshirish:

1. Loglarni ko'ring
2. To'lovlarni tekshiring
3. Foydalanuvchilar sonini kuzating

### Haftalik:

1. Umumiy statistika
2. Eng ko'p foydalanuvchilar
3. Daromad hisobi

## 🔄 Balansni qo'lda o'zgartirish

Agar kerak bo'lsa, kodda:

```javascript
// Balans qo'shish
userManager.addBalance(userId, amount);

// Balans yechish
userManager.deductBalance(userId, amount);
```

## 📞 Qo'llab-quvvatlash

Foydalanuvchilar sizga murojaat qiladi:
- @RootDev07

Tez javob bering:
- To'lov masalalari: 1-2 soat ichida
- Texnik muammolar: 24 soat ichida
- Umumiy savollar: 48 soat ichida

## 🎯 Maslahatlar

1. **Tez javob bering** - foydalanuvchilar kutishni yoqtirmaydi
2. **Do'stona bo'ling** - yaxshi munosabat qaytadi
3. **Aniq bo'ling** - nima qilish kerakligini tushuntiring
4. **Sabr qiling** - ba'zi foydalanuvchilar texnik bilmaydi

## 🔐 Xavfsizlik qoidalari

1. ❌ Admin parolni hech kimga bermang
2. ❌ Bot tokenni oshkor qilmang
3. ❌ Foydalanuvchi ma'lumotlarini tarqatmang
4. ✅ Loglarni muntazam tekshiring
5. ✅ Shubhali faoliyatni kuzating

---

**Admin:** @RootDev07  
**Versiya:** 2.0.0
