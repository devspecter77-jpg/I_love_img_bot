const MESSAGES = {
  // /start xabari - 3 ta tugma bilan
  WELCOME: (name) =>
    `👋 Salom, <b>${name}</b>!\n\n✨ <b>AI Orqa Fon Boti</b> ✨\n\n🎁 <b>Birinchi 2 ta rasm BEPUL!</b>\n💰 Keyingi rasmlar: 5,000 so'm/rasm\n\n❓ Savollar: @RootDev07\n\nQuyidagi amallardan birini tanlang:`,

  // Tariflar
  PRICING:
    `💎 <b>Tariflar</b>\n\n` +
    `🆓 <b>FREE</b>\n` +
    `├ 2 ta rasm bepul\n` +
    `├ Barcha funksiyalar\n` +
    `└ Telefon raqam kerak\n\n` +
    `🛒 <b>PRO</b>\n` +
    `├ 5,000 so'm/rasm\n` +
    `├ Cheksiz rasmlar\n` +
    `├ Yuqori sifat\n` +
    `└ Tez ishlov\n\n` +
    `💳 <b>GOLD</b> (Tez orada)\n` +
    `├ 50,000 so'm/oy\n` +
    `├ Cheksiz rasmlar\n` +
    `├ Eng yuqori sifat\n` +
    `├ Birinchi navbat\n` +
    `└ Premium qo'llab-quvvatlash\n\n` +
    `📱 To'lov:\n` +
    `💳 Karta: <code>8600 1234 5678 9012</code>\n` +
    `👤 Ism: ROOTDEV\n\n` +
    `❓ Savollar: @RootDev07`,

  // Telefon raqamini so'rash
  REQUEST_PHONE:
    `📱 <b>Telefon raqamingizni ulashing</b>\n\nBotdan foydalanish uchun telefon raqamingizni ulashing.\n\n👇 Quyidagi tugmani bosing:`,

  PHONE_RECEIVED: (phone) =>
    `✅ Telefon raqam qabul qilindi: <b>${phone}</b>\n\nEndi botdan foydalanishingiz mumkin!`,

  // ── Orqa fonni ketkazish ──
  REMOVE_BG_INTRO:
    `🗑 <b>Orqa fonni ketkazish</b>\n\nRasmlaringizni yuboring.\nOrqa fon olib tashlanib, <b>oq fon</b> qo'yiladi.\n\n📸 Rasmlarni yuboring (1–20 ta):`,

  // ── Orqa fon qo'shish ──
  ADD_BG_INTRO:
    `🖼 <b>Orqa fon qo'shish</b>\n\nAvval <b>fon rasmini</b> yuboring.\n(Rasmdan orqa fon olib tashlanib, yangi fon qo'yiladi)`,

  ADD_BG_WAIT_PHOTOS:
    `✅ Fon rasmi qabul qilindi!\n\nEndi <b>rasmlaringizni</b> yuboring (1–20 ta):\n(Orqa fon olib tashlanib, yuborgan foningiz qo'yiladi)`,

  // ── BG o'chirish + BG qo'shish ──
  REMOVE_ADD_BG_INTRO:
    `🔄 <b>BG o'chirish va BG qo'shish</b>\n\nAvval <b>fon rasmini</b> yuboring:`,

  REMOVE_ADD_BG_WAIT_PHOTOS:
    `✅ Fon rasmi qabul qilindi!\n\nEndi <b>rasmlaringizni</b> yuboring (1–20 ta).\nOrqa fon olib tashlanib, yangi fon qo'yiladi:`,

  // ── Umumiy ──
  PHOTO_RECEIVED: (count) =>
    `✅ Rasm ${count} ta qabul qilindi!\n\nYana rasm yuboring yoki <b>✅ Tayyor</b> tugmasini bosing.`,

  PROCESSING_START: (count) =>
    `⚡️ <b>${count} ta rasm ishlanmoqda...</b>\n\n🔥 AI ishlayapti, biroz kuting... ⚡️`,

  PROCESSING_PROGRESS: (current, total) => {
    const pct = Math.floor((current / total) * 100);
    const filled = Math.floor(pct / 10);
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
    const emojis = ['⚡️', '🔥', '✨', '💫', '⭐️'];
    const emoji = emojis[current % emojis.length];
    return `${emoji} Ishlanmoqda: ${current}/${total}\n${bar} ${pct}%`;
  },

  PROCESSING_DONE: (count) =>
    `🎉 <b>Tayyor! ${count} ta rasm muvaffaqiyatli ishlandi!</b> ✨\n\nNatijalar quyida 👇`,

  ZIP_READY: (count) =>
    `📦 ${count} ta rasm ZIP arxivida tayyor!`,

  SESSION_RESET:
    '🔄 Sessiya tozalandi. Bosh menyuga qaytdingiz.',

  STATUS: (stats) =>
    `📊 <b>Statistika</b>\n\n` +
    `📸 Ishlangan rasmlar: <b>${stats.processedImages}</b>\n` +
    `🎁 Bepul rasmlar qoldi: <b>${stats.remainingFree}</b>\n` +
    `🎉 Bonus rasmlar: <b>${stats.bonusImages}</b>\n` +
    `💰 Balans: <b>${stats.balance} so'm</b>`,

  // To'lov xabarlari
  FREE_LIMIT_REACHED: (stats) =>
    `🎉 <b>Siz FREE versiyani ishlatib bo'ldingiz!</b>\n\n` +
    `✅ ${stats.processedImages} ta rasm muvaffaqiyatli ishlandi.\n\n` +
    `${stats.bonusImages > 0 
      ? `🎉 <b>Sizda ${stats.bonusImages} ta bonus rasm bor!</b>\n\nBonus rasmlarni ishlatib bo'lgandan keyin PRO tarifga o'tasiz.\n\n`
      : `🚀 <b>Endi PRO tarifimizdan foydalanishingiz mumkin!</b>\n\n💰 Narx: <b>5,000 so'm/rasm</b>\n\n`
    }` +
    `📱 To'lov uchun:\n` +
    `💳 Karta: <code>8600 1234 5678 9012</code>\n` +
    `👤 Ism: ROOTDEV\n\n` +
    `To'lovdan keyin screenshot yuboring yoki balansni to'ldiring.\n\n` +
    `❓ Savollar bo'lsa: @RootDev07`,

  PAYMENT_REQUIRED: (payment) =>
    `💳 <b>To'lov kerak</b>\n\n` +
    `🎁 Bepul: ${payment.freeCount} ta rasm\n` +
    `🎉 Bonus: ${payment.bonusCount} ta rasm\n` +
    `💰 Pulli: ${payment.paidCount} ta rasm × 5,000 so'm\n\n` +
    `<b>Jami: ${payment.amount.toLocaleString('uz-UZ')} so'm</b>\n\n` +
    `Balansni to'ldiring yoki to'lov qiling:\n\n` +
    `📱 To'lov uchun:\n` +
    `💳 Karta: <code>8600 1234 5678 9012</code>\n` +
    `👤 Ism: ROOTDEV\n\n` +
    `To'lovdan keyin screenshot yuboring.\n\n` +
    `❓ Savollar: @RootDev07`,

  INSUFFICIENT_BALANCE: (required, current) =>
    `❌ <b>Balans yetarli emas</b>\n\n` +
    `Kerak: <b>${required.toLocaleString('uz-UZ')} so'm</b>\n` +
    `Mavjud: <b>${current.toLocaleString('uz-UZ')} so'm</b>\n\n` +
    `Iltimos, balansni to'ldiring.`,

  PAYMENT_SUCCESS: (amount) =>
    `✅ <b>To'lov muvaffaqiyatli!</b>\n\n` +
    `${amount.toLocaleString('uz-UZ')} so'm to'landi.\n\n` +
    `Rasmlar ishlanmoqda... ⚡️`,

  CANCELLED:
    '❌ Bekor qilindi. Bosh menyuga qaytdingiz.',

  NO_IMAGES:
    '⚠️ Hali rasm yuklanmagan. Iltimos, avval rasmlarni yuboring.',

  NO_OUTPUT:
    '⚠️ Ishlangan rasm topilmadi.',

  MAX_IMAGES_REACHED: (max) =>
    `⚠️ Maksimal ${max} ta rasm. ✅ Tayyor tugmasini bosing.`,

  UNSUPPORTED_FORMAT:
    '❌ Faqat JPG, PNG, WebP formatlar qabul qilinadi.',

  FILE_TOO_LARGE: (mb) =>
    `❌ Fayl juda katta. Maksimal hajm: ${mb}MB.`,

  DOWNLOAD_ERROR:
    '❌ Rasmni yuklab bo\'lmadi. Qayta urinib ko\'ring.',

  RATE_LIMITED:
    '⏱ Juda ko\'p so\'rov. Biroz kuting.',

  ERROR:
    '❌ Xatolik yuz berdi. /reset buyrug\'ini yuboring.',

  PROCESSING_ERROR: (n) =>
    `⚠️ ${n}-rasm ishlanmadi, o'tkazib yuborildi.`,

  HELP:
    `📖 <b>Yordam</b>\n\n` +
    `<b>Amallar:</b>\n` +
    `🗑 Orqa fonni ketkazish — oq fon qo'yadi\n` +
    `🖼 Orqa fon qo'shish — o'z foningizni qo'yadi\n` +
    `🔄 BG o'chirish + qo'shish — ikkalasi birga\n\n` +
    `<b>Buyruqlar:</b>\n` +
    `/start — Bosh menyu\n` +
    `/status — Statistika\n` +
    `/balance — Balans va to'ldirish\n` +
    `/pricing — Tariflar\n` +
    `/reset — Tozalash\n` +
    `/help — Yordam\n\n` +
    `<b>Tariflar:</b>\n` +
    `🆓 FREE — 2 ta rasm bepul\n` +
    `🛒 PRO — 5,000 so'm/rasm\n` +
    `💳 GOLD — 50,000 so'm/oy (tez orada)\n\n` +
    `<b>To'lov:</b>\n` +
    `💳 Karta: <code>8600 1234 5678 9012</code>\n` +
    `👤 Ism: ROOTDEV\n\n` +
    `❓ Savollar: @RootDev07`,
};

module.exports = { MESSAGES };
