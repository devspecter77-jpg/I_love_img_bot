const { Markup } = require('telegraf');

function getKeyboard(type, count = 0) {
  switch (type) {

    // Telefon raqamini so'rash
    case 'request_phone':
      return Markup.keyboard([
        [Markup.button.contactRequest('📱 Telefon raqamni ulashish')],
      ]).resize();

    // Bosh menyu — 3 ta asosiy tugma
    case 'main':
      return Markup.inlineKeyboard([
        [Markup.button.callback('🗑 Orqa fonni ketkazish', 'mode_remove_bg')],
        [Markup.button.callback('🖼 Orqa fon qo\'shish', 'mode_add_bg')],
        [Markup.button.callback('🔄 BG o\'chirish va BG qo\'shish', 'mode_remove_add_bg')],
        [Markup.button.callback('💎 Tariflar', 'show_pricing')],
      ]);

    // Rasm yuklash jarayonida
    case 'uploading':
      return Markup.inlineKeyboard([
        [Markup.button.callback(`✅ Tayyor (${count} ta rasm)`, 'done_uploading')],
        [Markup.button.callback('❌ Bekor qilish', 'cancel')],
      ]);

    // Faqat bekor qilish
    case 'cancel':
      return Markup.inlineKeyboard([
        [Markup.button.callback('❌ Bekor qilish', 'cancel')],
      ]);

    // Natijalar tayyor bo'lganda
    case 'results':
      return Markup.inlineKeyboard([
        [Markup.button.callback('📦 ZIP yuklab olish', 'download_zip')],
        [Markup.button.callback('🏠 Bosh menyu', 'go_home')],
      ]);

    // To'lov tugmalari
    case 'payment':
      return Markup.inlineKeyboard([
        [Markup.button.callback('💳 To\'lovni tasdiqlash', 'confirm_payment')],
        [Markup.button.callback('❌ Bekor qilish', 'cancel')],
      ]);

    // Balans to'ldirish
    case 'add_balance':
      return Markup.inlineKeyboard([
        [Markup.button.callback('💳 5,000 so\'m', 'balance_5000')],
        [Markup.button.callback('💳 10,000 so\'m', 'balance_10000')],
        [Markup.button.callback('💳 20,000 so\'m', 'balance_20000')],
        [Markup.button.callback('💳 50,000 so\'m', 'balance_50000')],
        [Markup.button.callback('🏠 Bosh menyu', 'go_home')],
      ]);

    default:
      return {};
  }
}

module.exports = { getKeyboard };
