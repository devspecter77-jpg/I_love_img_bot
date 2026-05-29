const { Markup } = require('telegraf');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../utils/logger');
const sessionManager = require('../utils/sessionManager');
const userManager = require('../utils/userManager');
const adminPanel = require('./adminPanel');
const { downloadFile } = require('../utils/telegram');
const { addToQueue } = require('../queue/imageQueue');
const { getKeyboard } = require('./keyboards');
const { MESSAGES } = require('./messages');

// Anti-spam
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 10,
  duration: 60,
});

async function checkRateLimit(ctx) {
  try {
    await rateLimiter.consume(ctx.from.id.toString());
    return true;
  } catch {
    await ctx.reply(MESSAGES.RATE_LIMITED);
    return false;
  }
}

// Bosh menyuni ko'rsatish
async function showMainMenu(ctx) {
  await ctx.reply(MESSAGES.WELCOME(ctx.from.first_name), {
    parse_mode: 'HTML',
    ...getKeyboard('main'),
  });
}

function setupHandlers(bot) {

  // ── /start ──
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const user = userManager.getOrCreateUser(userId, {
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      username: ctx.from.username,
    });

    sessionManager.resetSession(userId);

    // Telefon raqami yo'q bo'lsa, so'rash
    if (!user.phoneNumber) {
      return ctx.reply(MESSAGES.REQUEST_PHONE, {
        parse_mode: 'HTML',
        ...getKeyboard('request_phone'),
      });
    }

    await showMainMenu(ctx);
  });

  // ── /reset ──
  bot.command('reset', async (ctx) => {
    sessionManager.resetSession(ctx.from.id);
    await showMainMenu(ctx);
  });

  // ── /help ──
  bot.help(async (ctx) => {
    await ctx.reply(MESSAGES.HELP, { parse_mode: 'HTML' });
  });

  // ── /status ──
  bot.command('status', async (ctx) => {
    const stats = userManager.getUserStats(ctx.from.id);
    await ctx.reply(MESSAGES.STATUS(stats), { parse_mode: 'HTML' });
  });

  // ── /balance ──
  bot.command('balance', async (ctx) => {
    const stats = userManager.getUserStats(ctx.from.id);
    await ctx.reply(
      `💰 <b>Balans</b>\n\n` +
      `💳 Joriy balans: <b>${stats.balance.toLocaleString('uz-UZ')} so'm</b>\n` +
      `📊 Ishlangan rasmlar: ${stats.processedImages}\n` +
      `🎁 Bepul rasmlar qoldi: ${stats.remainingFree}\n\n` +
      `📱 To'lov uchun:\n` +
      `💳 Karta: <code>8600 1234 5678 9012</code>\n` +
      `👤 Ism: ROOTDEV\n\n` +
      `To'lovdan keyin screenshot yuboring.\n\n` +
      `❓ Savollar: @RootDev07\n\n` +
      `Yoki quyidagi tugmalardan birini tanlang:`,
      {
        parse_mode: 'HTML',
        ...getKeyboard('add_balance'),
      }
    );
  });

  // ── /pricing ──
  bot.command('pricing', async (ctx) => {
    await ctx.reply(MESSAGES.PRICING, {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('💰 Balans to\'ldirish', 'show_balance')],
        [Markup.button.callback('🏠 Bosh menyu', 'go_home')],
      ]).reply_markup,
    });
  });

  // ── /admin ──
  bot.command('admin', async (ctx) => {
    await adminPanel.showAdminPanel(ctx);
  });

  // ── Admin: To'lovni tasdiqlash ──
  bot.command(/approve_(\d+)_(\d+)/, async (ctx) => {
    const adminId = process.env.ADMIN_ID || '123456789';
    if (ctx.from.id.toString() !== adminId) {
      return; // Faqat admin
    }

    const userId = parseInt(ctx.match[1]);
    const amount = parseInt(ctx.match[2]);

    userManager.addBalance(userId, amount);
    const stats = userManager.getUserStats(userId);

    await ctx.reply(
      `✅ <b>To'lov tasdiqlandi!</b>\n\n` +
      `👤 User ID: ${userId}\n` +
      `💰 Summa: ${amount.toLocaleString('uz-UZ')} so'm\n` +
      `💳 Yangi balans: ${stats.balance.toLocaleString('uz-UZ')} so'm`,
      { parse_mode: 'HTML' }
    );

    // Foydalanuvchiga xabar
    try {
      await ctx.telegram.sendMessage(
        userId,
        `✅ <b>To'lovingiz tasdiqlandi!</b>\n\n` +
        `💰 +${amount.toLocaleString('uz-UZ')} so'm\n` +
        `💳 Yangi balans: <b>${stats.balance.toLocaleString('uz-UZ')} so'm</b>\n\n` +
        `Endi rasmlarni ishlashingiz mumkin!\n\n` +
        `❓ Savollar: @RootDev07`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      logger.error('Foydalanuvchiga xabar yuborib bo\'lmadi:', err);
    }
  });

  // ════════════════════════════════════════
  // INLINE KEYBOARD CALLBACKS
  // ════════════════════════════════════════

  // To'lovni tasdiqlash
  bot.action('confirm_payment', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = ctx.from.id;
    const session = sessionManager.getSession(userId);

    if (!session || !session.paymentInfo) {
      return ctx.reply(MESSAGES.ERROR);
    }

    const payment = session.paymentInfo;
    const user = userManager.getOrCreateUser(userId);

    // Balansdan yechish
    const success = userManager.deductBalance(userId, payment.amount);
    if (!success) {
      return ctx.reply(
        `❌ <b>Balans yetarli emas</b>\n\n` +
        `Kerak: <b>${payment.amount.toLocaleString('uz-UZ')} so'm</b>\n` +
        `Mavjud: <b>${user.balance.toLocaleString('uz-UZ')} so'm</b>\n` +
        `Yetishmaydi: <b>${(payment.amount - user.balance).toLocaleString('uz-UZ')} so'm</b>\n\n` +
        `Iltimos, balansni to'ldiring:`,
        {
          parse_mode: 'HTML',
          ...getKeyboard('add_balance'),
        }
      );
    }

    await ctx.reply(
      `✅ <b>To'lov muvaffaqiyatli!</b>\n\n` +
      `💰 Balansdan yechildi: ${payment.amount.toLocaleString('uz-UZ')} so'm\n` +
      `💳 Qolgan balans: ${userManager.getUserStats(userId).balance.toLocaleString('uz-UZ')} so'm\n\n` +
      `Rasmlar ishlanmoqda... ⚡️`,
      { parse_mode: 'HTML' }
    );
    
    await startProcessingWithPayment(ctx, userId, session);
  });

  // Balans to'ldirish tugmalari
  bot.action(/^balance_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = ctx.from.id;
    const amount = parseInt(ctx.match[1]);

    // To'lov ko'rsatmasi
    await ctx.reply(
      `💳 <b>To'lov ko'rsatmasi</b>\n\n` +
      `💰 Summa: <b>${amount.toLocaleString('uz-UZ')} so'm</b>\n\n` +
      `📱 To'lov uchun:\n` +
      `💳 Karta: <code>8600 1234 5678 9012</code>\n` +
      `👤 Ism: ROOTDEV\n\n` +
      `To'lovdan keyin screenshot yuboring.\n\n` +
      `❓ Savollar: @RootDev07`,
      { parse_mode: 'HTML' }
    );

    // Demo: avtomatik balans qo'shish (keyinchalik to'lov gateway ulash)
    // userManager.addBalance(userId, amount);
    // const stats = userManager.getUserStats(userId);
    // await ctx.reply(
    //   `✅ <b>Balans to'ldirildi!</b>\n\n` +
    //   `💰 +${amount} so'm\n` +
    //   `💳 Yangi balans: <b>${stats.balance} so'm</b>\n\n` +
    //   `Endi rasmlarni ishlashingiz mumkin!`,
    //   { parse_mode: 'HTML' }
    // );
    // await showMainMenu(ctx);
  });

  // 1️⃣ Orqa fonni ketkazish — rasmlarni kutish
  bot.action('mode_remove_bg', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = ctx.from.id;
    
    // Bepul rasmlar tugaganini tekshirish
    if (!userManager.canUseFreeImages(userId)) {
      const stats = userManager.getUserStats(userId);
      return ctx.reply(MESSAGES.FREE_LIMIT_REACHED(stats), {
        parse_mode: 'HTML',
        ...getKeyboard('add_balance'),
      });
    }
    
    const session = sessionManager.initSession(userId);
    session.mode = 'remove_bg';
    session.state = 'uploading_photos';
    sessionManager.updateSession(userId, session);
    await ctx.reply(MESSAGES.REMOVE_BG_INTRO, {
      parse_mode: 'HTML',
      ...getKeyboard('cancel'),
    });
  });

  // 2️⃣ Orqa fon qo'shish — avval fon rasmi
  bot.action('mode_add_bg', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = ctx.from.id;
    
    // Bepul rasmlar tugaganini tekshirish
    if (!userManager.canUseFreeImages(userId)) {
      const stats = userManager.getUserStats(userId);
      return ctx.reply(MESSAGES.FREE_LIMIT_REACHED(stats), {
        parse_mode: 'HTML',
        ...getKeyboard('add_balance'),
      });
    }
    
    const session = sessionManager.initSession(userId);
    session.mode = 'add_bg';
    session.state = 'waiting_background';
    sessionManager.updateSession(userId, session);
    await ctx.reply(MESSAGES.ADD_BG_INTRO, {
      parse_mode: 'HTML',
      ...getKeyboard('cancel'),
    });
  });

  // 3️⃣ BG o'chirish + BG qo'shish — avval fon rasmi
  bot.action('mode_remove_add_bg', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = ctx.from.id;
    
    // Bepul rasmlar tugaganini tekshirish
    if (!userManager.canUseFreeImages(userId)) {
      const stats = userManager.getUserStats(userId);
      return ctx.reply(MESSAGES.FREE_LIMIT_REACHED(stats), {
        parse_mode: 'HTML',
        ...getKeyboard('add_balance'),
      });
    }
    
    const session = sessionManager.initSession(userId);
    session.mode = 'remove_add_bg';
    session.state = 'waiting_background';
    sessionManager.updateSession(userId, session);
    await ctx.reply(MESSAGES.REMOVE_ADD_BG_INTRO, {
      parse_mode: 'HTML',
      ...getKeyboard('cancel'),
    });
  });

  // ✅ Tayyor — rasmlarni ishga tushirish
  bot.action('done_uploading', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = ctx.from.id;
    const session = sessionManager.getSession(userId);

    if (!session || session.images.length === 0) {
      return ctx.reply(MESSAGES.NO_IMAGES);
    }

    // To'lov kerakligini tekshirish
    const payment = userManager.calculatePayment(userId, session.images.length);
    
    if (payment.needsPayment) {
      // Balansdan yechishga urinish
      const user = userManager.getOrCreateUser(userId);
      
      if (user.balance >= payment.amount) {
        // Balans yetarli - avtomatik yechish
        const success = userManager.deductBalance(userId, payment.amount);
        
        if (success) {
          await ctx.reply(
            `✅ <b>To'lov muvaffaqiyatli!</b>\n\n` +
            `💰 Balansdan yechildi: ${payment.amount.toLocaleString('uz-UZ')} so'm\n` +
            `💳 Qolgan balans: ${(user.balance - payment.amount).toLocaleString('uz-UZ')} so'm\n\n` +
            `Rasmlar ishlanmoqda... ⚡️`,
            { parse_mode: 'HTML' }
          );
          
          await startProcessing(ctx, userId, session);
        } else {
          return ctx.reply(MESSAGES.INSUFFICIENT_BALANCE(payment.amount, user.balance), {
            parse_mode: 'HTML',
            ...getKeyboard('add_balance'),
          });
        }
      } else {
        // Balans yetarli emas
        session.paymentInfo = payment;
        sessionManager.updateSession(userId, session);
        
        await ctx.reply(
          `❌ <b>Balans yetarli emas</b>\n\n` +
          `Kerak: <b>${payment.amount.toLocaleString('uz-UZ')} so'm</b>\n` +
          `Mavjud: <b>${user.balance.toLocaleString('uz-UZ')} so'm</b>\n` +
          `Yetishmaydi: <b>${(payment.amount - user.balance).toLocaleString('uz-UZ')} so'm</b>\n\n` +
          `Iltimos, balansni to'ldiring:`,
          {
            parse_mode: 'HTML',
            ...getKeyboard('add_balance'),
          }
        );
      }
    } else {
      // Bepul rasmlar
      await startProcessing(ctx, userId, session);
    }
  });

  // ❌ Bekor qilish
  bot.action('cancel', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    sessionManager.resetSession(ctx.from.id);
    await ctx.reply(MESSAGES.CANCELLED);
    await showMainMenu(ctx);
  });

  // 🏠 Bosh menyu
  bot.action('go_home', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    sessionManager.resetSession(ctx.from.id);
    await showMainMenu(ctx);
  });

  // 💎 Tariflar
  bot.action('show_pricing', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const stats = userManager.getUserStats(ctx.from.id);
    await ctx.reply(MESSAGES.PRICING, {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('💰 Balans to\'ldirish', 'show_balance')],
        [Markup.button.callback('🏠 Bosh menyu', 'go_home')],
      ]).reply_markup,
    });
  });

  // ════════════════════════════════════════
  // ADMIN PANEL CALLBACKS
  // ════════════════════════════════════════

  // Admin panel asosiy
  bot.action('admin_home', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    await adminPanel.showAdminPanel(ctx);
  });

  // Foydalanuvchilar ro'yxati
  bot.action('admin_users_list', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    await adminPanel.showUsersList(ctx, 0);
  });

  // Sahifalash
  bot.action(/^admin_users_page_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const page = parseInt(ctx.match[1]);
    await adminPanel.showUsersList(ctx, page);
  });

  // Statistika
  bot.action('admin_stats', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    await adminPanel.showAdminStats(ctx);
  });

  // Yangilash
  bot.action('admin_refresh', async (ctx) => {
    try { await ctx.answerCbQuery('Yangilanmoqda...'); } catch {}
    await adminPanel.showAdminPanel(ctx);
  });

  // Foydalanuvchi tafsilotlari
  bot.action(/^admin_user_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = parseInt(ctx.match[1]);
    await adminPanel.showUserDetails(ctx, userId);
  });

  // Balans qo'shish (summa so'rash)
  bot.action(/^admin_add_balance_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = parseInt(ctx.match[1]);
    
    await ctx.reply(
      `💰 <b>Balans qo'shish</b>\n\n` +
      `User ID: <code>${userId}</code>\n\n` +
      `Quyidagi tugmalardan birini tanlang:`,
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('5,000 so\'m', `admin_balance_${userId}_5000`)],
          [Markup.button.callback('10,000 so\'m', `admin_balance_${userId}_10000`)],
          [Markup.button.callback('25,000 so\'m', `admin_balance_${userId}_25000`)],
          [Markup.button.callback('50,000 so\'m', `admin_balance_${userId}_50000`)],
          [Markup.button.callback('100,000 so\'m', `admin_balance_${userId}_100000`)],
          [Markup.button.callback('🔙 Orqaga', `admin_user_${userId}`)],
        ]).reply_markup,
      }
    );
  });

  // Balans qo'shish (tasdiqlash)
  bot.action(/^admin_balance_(\d+)_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery('Balans qo\'shilmoqda...'); } catch {}
    const userId = parseInt(ctx.match[1]);
    const amount = parseInt(ctx.match[2]);
    
    await adminPanel.addBalanceToUser(ctx, userId, amount);
    await adminPanel.showUserDetails(ctx, userId);
  });

  // Bepul rasmlar berish
  bot.action(/^admin_add_free_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const userId = parseInt(ctx.match[1]);
    
    await ctx.reply(
      `🎁 <b>Bepul rasmlar berish</b>\n\n` +
      `User ID: <code>${userId}</code>\n\n` +
      `Quyidagi tugmalardan birini tanlang:`,
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('2 ta rasm', `admin_free_${userId}_2`)],
          [Markup.button.callback('5 ta rasm', `admin_free_${userId}_5`)],
          [Markup.button.callback('10 ta rasm', `admin_free_${userId}_10`)],
          [Markup.button.callback('20 ta rasm', `admin_free_${userId}_20`)],
          [Markup.button.callback('50 ta rasm', `admin_free_${userId}_50`)],
          [Markup.button.callback('🔙 Orqaga', `admin_user_${userId}`)],
        ]).reply_markup,
      }
    );
  });

  // Bepul rasmlar berish (tasdiqlash)
  bot.action(/^admin_free_(\d+)_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery('Bepul rasmlar berilmoqda...'); } catch {}
    const userId = parseInt(ctx.match[1]);
    const count = parseInt(ctx.match[2]);
    
    await adminPanel.addFreeImagesToUser(ctx, userId, count);
    await adminPanel.showUserDetails(ctx, userId);
  });

  // Chat ID bo'yicha qidirish
  bot.action('admin_search_by_id', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    
    await ctx.reply(
      `🔍 <b>Chat ID bo'yicha qidirish</b>\n\n` +
      `Foydalanuvchining Chat ID sini yuboring.\n\n` +
      `Misol: <code>123456789</code>`,
      { parse_mode: 'HTML' }
    );
    
    // Keyingi xabarni kutish
    ctx.session = ctx.session || {};
    ctx.session.waitingForUserId = true;
  });

  // Hisob to'ldirish (Chat ID so'rash)
  bot.action('admin_add_credit', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    
    await ctx.reply(
      `💰 <b>Hisob to'ldirish</b>\n\n` +
      `Foydalanuvchining Chat ID sini yuboring.\n\n` +
      `Misol: <code>123456789</code>`,
      { parse_mode: 'HTML' }
    );
    
    // Keyingi xabarni kutish
    ctx.session = ctx.session || {};
    ctx.session.waitingForCreditUserId = true;
  });

  // Rasm limiti qo'shish (tasdiqlash)
  bot.action(/^admin_credit_(\d+)_(\d+)$/, async (ctx) => {
    try { await ctx.answerCbQuery('Rasm limiti qo\'shilmoqda...'); } catch {}
    const userId = parseInt(ctx.match[1]);
    const count = parseInt(ctx.match[2]);
    
    await adminPanel.addFreeImagesToUser(ctx, userId, count);
    
    await ctx.reply(
      `✅ <b>Rasm limiti qo'shildi!</b>\n\n` +
      `👤 User ID: ${userId}\n` +
      `🎁 Qo'shildi: ${count} ta rasm\n\n` +
      `Foydalanuvchi endi ${count} ta rasm qo'shimcha qila oladi!`,
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('👤 Foydalanuvchi tafsilotlari', `admin_user_${userId}`)],
          [Markup.button.callback('🏠 Admin panel', 'admin_home')],
        ]).reply_markup,
      }
    );
  });

  // 💰 Balans ko'rsatish
  bot.action('show_balance', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch {}
    const stats = userManager.getUserStats(ctx.from.id);
    await ctx.reply(
      `💰 <b>Balans</b>\n\n` +
      `💳 Joriy balans: <b>${stats.balance.toLocaleString('uz-UZ')} so'm</b>\n` +
      `📊 Ishlangan rasmlar: ${stats.processedImages}\n` +
      `🎁 Bepul rasmlar qoldi: ${stats.remainingFree}\n\n` +
      `📱 To'lov uchun:\n` +
      `💳 Karta: <code>8600 1234 5678 9012</code>\n` +
      `👤 Ism: ROOTDEV\n\n` +
      `To'lovdan keyin screenshot yuboring.\n\n` +
      `❓ Savollar: @RootDev07\n\n` +
      `Yoki quyidagi tugmalardan birini tanlang:`,
      {
        parse_mode: 'HTML',
        ...getKeyboard('add_balance'),
      }
    );
  });

  // 📦 ZIP yuklab olish
  bot.action('download_zip', async (ctx) => {
    try { await ctx.answerCbQuery('ZIP tayyorlanmoqda...'); } catch {}
    const userId = ctx.from.id;
    const session = sessionManager.getSession(userId);

    if (!session?.outputFiles?.length) {
      return ctx.reply(MESSAGES.NO_OUTPUT);
    }

    await sendZipArchive(ctx, session);
  });

  // ════════════════════════════════════════
  // RASM QABUL QILISH
  // ════════════════════════════════════════

  // Telefon raqamini qabul qilish
  bot.on('contact', async (ctx) => {
    const userId = ctx.from.id;
    const contact = ctx.message.contact;

    if (contact.user_id !== userId) {
      return ctx.reply('❌ Iltimos, o\'z telefon raqamingizni ulashing.');
    }

    // Avval bu raqam bilan foydalanuvchi borligini tekshirish
    const existingUser = userManager.findUserByPhone(contact.phone_number);
    
    if (existingUser && existingUser.userId !== userId) {
      // Bu raqam boshqa foydalanuvchida mavjud
      const stats = userManager.getUserStats(existingUser.userId);
      
      // Eski foydalanuvchi ma'lumotlarini yangi ID ga ko'chirish
      userManager.updateUser(userId, {
        phoneNumber: contact.phone_number,
        processedImages: existingUser.processedImages,
        balance: existingUser.balance,
      });
      
      await ctx.reply(
        `✅ <b>Xush kelibsiz!</b>\n\n` +
        `📱 Telefon: <code>${contact.phone_number}</code>\n\n` +
        `📊 Sizning statistikangiz:\n` +
        `📸 Ishlangan rasmlar: ${stats.processedImages}\n` +
        `🎁 Bepul rasmlar qoldi: ${stats.remainingFree}\n` +
        `💰 Balans: ${stats.balance.toLocaleString('uz-UZ')} so'm\n\n` +
        `${stats.remainingFree > 0 ? '🎉 Sizda hali bepul rasmlar bor!' : '💎 PRO tarifdan foydalaning!'}`,
        {
          parse_mode: 'HTML',
          reply_markup: { remove_keyboard: true },
        }
      );
    } else {
      // Yangi foydalanuvchi
      userManager.savePhoneNumber(userId, contact.phone_number);
      
      await ctx.reply(MESSAGES.PHONE_RECEIVED(contact.phone_number), {
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      });
    }

    await showMainMenu(ctx);
  });

  // To'lov screenshot qabul qilish
  bot.on('photo', async (ctx) => {
    if (!(await checkRateLimit(ctx))) return;
    
    // Agar caption da "to'lov" yoki "payment" bo'lsa, to'lov screenshot deb qabul qilamiz
    const caption = ctx.message.caption?.toLowerCase() || '';
    const session = sessionManager.getSession(ctx.from.id);
    
    if (!session && (caption.includes('to\'lov') || caption.includes('payment') || caption.includes('скриншот'))) {
      // To'lov screenshot
      await ctx.reply(
        `✅ <b>To'lov screenshot qabul qilindi!</b>\n\n` +
        `⏳ Tekshirilmoqda...\n\n` +
        `Admin tez orada tekshiradi va balansingiz to'ldiriladi.\n\n` +
        `❓ Savollar: @RootDev07`,
        { parse_mode: 'HTML' }
      );
      
      // Adminlarga xabar yuborish (keyinchalik admin ID larini .env ga qo'shish)
      const adminId = process.env.ADMIN_ID || '123456789'; // O'zingizning Telegram ID
      try {
        await ctx.telegram.sendPhoto(adminId, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
          caption: 
            `💳 <b>Yangi to'lov screenshot</b>\n\n` +
            `👤 User: ${ctx.from.first_name} ${ctx.from.last_name || ''}\n` +
            `🆔 ID: <code>${ctx.from.id}</code>\n` +
            `📱 Username: @${ctx.from.username || 'yo\'q'}\n\n` +
            `Tasdiqlash uchun: /approve_${ctx.from.id}_SUMMA`,
          parse_mode: 'HTML',
        });
      } catch (err) {
        logger.error('Adminlarga xabar yuborib bo\'lmadi:', err);
      }
      return;
    }
    
    await handleIncomingPhoto(ctx, ctx.message.photo[ctx.message.photo.length - 1].file_id);
  });

  // Fayl sifatida yuborilgan rasmlar
  bot.on('document', async (ctx) => {
    if (!(await checkRateLimit(ctx))) return;
    const doc = ctx.message.document;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(doc.mime_type)) {
      return ctx.reply(MESSAGES.UNSUPPORTED_FORMAT);
    }
    const maxBytes = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;
    if (doc.file_size > maxBytes) {
      return ctx.reply(MESSAGES.FILE_TOO_LARGE(process.env.MAX_FILE_SIZE_MB || 10));
    }
    await handleIncomingPhoto(ctx, doc.file_id);
  });

  // Text xabarlar (Admin uchun Chat ID qabul qilish)
  bot.on('text', async (ctx) => {
    // Admin session tekshiruvi
    if (adminPanel.isAdmin(ctx.from.id) && ctx.session) {
      const text = ctx.message.text.trim();
      
      // Chat ID bo'yicha qidirish
      if (ctx.session.waitingForUserId) {
        ctx.session.waitingForUserId = false;
        
        const userId = parseInt(text);
        if (isNaN(userId)) {
          return ctx.reply('❌ Noto\'g\'ri format. Faqat raqam kiriting.');
        }
        
        const user = userManager.getUserById(userId);
        if (!user) {
          return ctx.reply(`❌ Foydalanuvchi topilmadi: ${userId}`);
        }
        
        await adminPanel.showUserDetails(ctx, userId);
        return;
      }
      
      // Hisob to'ldirish
      if (ctx.session.waitingForCreditUserId) {
        ctx.session.waitingForCreditUserId = false;
        
        const userId = parseInt(text);
        if (isNaN(userId)) {
          return ctx.reply('❌ Noto\'g\'ri format. Faqat raqam kiriting.');
        }
        
        const user = userManager.getUserById(userId);
        if (!user) {
          return ctx.reply(`❌ Foydalanuvchi topilmadi: ${userId}`);
        }
        
        // Rasm limiti qo'shish variantlari
        await ctx.reply(
          `💰 <b>Hisob to'ldirish</b>\n\n` +
          `👤 Foydalanuvchi: ${user.firstName || 'Noma\'lum'}\n` +
          `🆔 Chat ID: <code>${userId}</code>\n\n` +
          `Qancha rasm limiti qo'shasiz?`,
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('2 ta rasm', `admin_credit_${userId}_2`)],
              [Markup.button.callback('5 ta rasm', `admin_credit_${userId}_5`)],
              [Markup.button.callback('10 ta rasm', `admin_credit_${userId}_10`)],
              [Markup.button.callback('20 ta rasm', `admin_credit_${userId}_20`)],
              [Markup.button.callback('50 ta rasm', `admin_credit_${userId}_50`)],
              [Markup.button.callback('100 ta rasm', `admin_credit_${userId}_100`)],
              [Markup.button.callback('🏠 Admin panel', 'admin_home')],
            ]).reply_markup,
          }
        );
        return;
      }
    }
  });

  // Xato handler
  bot.catch((err, ctx) => {
    logger.error(`Bot xatosi (user ${ctx?.from?.id}):`, err);
    ctx?.reply(MESSAGES.ERROR).catch(() => {});
  });
}

// ════════════════════════════════════════
// RASM KELGANDA QAYTA ISHLASH LOGIKASI
// ════════════════════════════════════════

async function handleIncomingPhoto(ctx, fileId) {
  const userId = ctx.from.id;
  let session = sessionManager.getSession(userId);

  // Sessiya yo'q — bosh menyuga
  if (!session) {
    return ctx.reply('Iltimos, avval amal tanlang:', getKeyboard('main'));
  }

  const { state, mode } = session;

  // ── Fon rasmi kutilmoqda (add_bg yoki remove_add_bg) ──
  if (state === 'waiting_background') {
    try {
      const filePath = await downloadFile(ctx, fileId, userId, 'background');
      session.backgroundPath = filePath;

      if (mode === 'add_bg') {
        session.state = 'uploading_photos';
        sessionManager.updateSession(userId, session);
        await ctx.reply(MESSAGES.ADD_BG_WAIT_PHOTOS, {
          parse_mode: 'HTML',
          ...getKeyboard('cancel'),
        });
      } else if (mode === 'remove_add_bg') {
        session.state = 'uploading_photos';
        sessionManager.updateSession(userId, session);
        await ctx.reply(MESSAGES.REMOVE_ADD_BG_WAIT_PHOTOS, {
          parse_mode: 'HTML',
          ...getKeyboard('cancel'),
        });
      }
    } catch (err) {
      logger.error('Fon rasmini yuklab bo\'lmadi:', err);
      await ctx.reply(MESSAGES.DOWNLOAD_ERROR);
    }
    return;
  }

  // ── Rasmlar yuklanmoqda ──
  if (state === 'uploading_photos') {
    const maxImages = parseInt(process.env.MAX_IMAGES_PER_SESSION) || 20;
    if (session.images.length >= maxImages) {
      return ctx.reply(MESSAGES.MAX_IMAGES_REACHED(maxImages));
    }

    try {
      const filePath = await downloadFile(ctx, fileId, userId, 'subject');
      session.images.push({ fileId, localPath: filePath });
      sessionManager.updateSession(userId, session);

      const count = session.images.length;
      await ctx.reply(MESSAGES.PHOTO_RECEIVED(count), {
        parse_mode: 'HTML',
        ...getKeyboard('uploading', count),
      });
    } catch (err) {
      logger.error('Rasmni yuklab bo\'lmadi:', err);
      await ctx.reply(MESSAGES.DOWNLOAD_ERROR);
    }
    return;
  }

  // Boshqa holat
  await ctx.reply('Iltimos, avval amal tanlang:', getKeyboard('main'));
}

// ════════════════════════════════════════
// ISHLOV BERISH BOSHLASH
// ════════════════════════════════════════

async function startProcessing(ctx, userId, session) {
  session.state = 'processing';
  sessionManager.updateSession(userId, session);

  const freshSession = sessionManager.getSession(userId);
  const bgPath = freshSession?.backgroundPath || session.backgroundPath || null;

  logger.info(`startProcessing | mode=${session.mode} | backgroundPath=${bgPath} | images=${session.images.length}`);

  const processingMsg = await ctx.reply(
    MESSAGES.PROCESSING_START(session.images.length),
    { parse_mode: 'HTML' }
  );

  await addToQueue({
    userId,
    sessionId: session.id,
    images: session.images,
    backgroundPath: bgPath,
    mode: session.mode,
    options: session.options || {},
    chatId: ctx.chat.id,
    messageId: processingMsg.message_id,
  });
}

async function startProcessingWithPayment(ctx, userId, session) {
  // To'lov amalga oshirildi, rasmlarni ishlash
  await startProcessing(ctx, userId, session);
}

// ════════════════════════════════════════
// ZIP ARXIV YUBORISH
// ════════════════════════════════════════

async function sendZipArchive(ctx, session) {
  const archiver = require('archiver');
  const fs = require('fs');
  const path = require('path');
  const { v4: uuidv4 } = require('uuid');

  const zipPath = path.join(
    process.env.TEMP_PATH || './storage/temp',
    `result_${uuidv4()}.zip`
  );

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);

  for (const file of session.outputFiles) {
    if (fs.existsSync(file)) {
      archive.file(file, { name: path.basename(file) });
    }
  }

  await archive.finalize();
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  await ctx.replyWithDocument(
    { source: zipPath, filename: 'natijalar.zip' },
    { caption: MESSAGES.ZIP_READY(session.outputFiles.length) }
  );

  fs.unlink(zipPath, () => {});
}

module.exports = { setupHandlers };
