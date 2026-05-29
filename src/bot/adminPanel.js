const { Markup } = require('telegraf');
const userManager = require('../utils/userManager');
const logger = require('../utils/logger');

const ADMIN_ID = process.env.ADMIN_ID || '';

/**
 * Admin tekshiruvi
 */
function isAdmin(userId) {
  return userId.toString() === ADMIN_ID;
}

/**
 * Admin panel asosiy menyu
 */
async function showAdminPanel(ctx) {
  if (!isAdmin(ctx.from.id)) {
    return ctx.reply('❌ Sizda admin huquqi yo\'q.');
  }

  const userCount = userManager.getUserCount();
  const allUsers = userManager.getAllUsers();
  
  const totalProcessed = allUsers.reduce((sum, u) => sum + u.processedImages, 0);
  const totalBalance = allUsers.reduce((sum, u) => sum + u.balance, 0);
  const usersWithPhone = allUsers.filter(u => u.phoneNumber).length;

  await ctx.reply(
    `👨‍💼 <b>Admin Panel</b>\n\n` +
    `📊 <b>Statistika:</b>\n` +
    `👥 Jami foydalanuvchilar: ${userCount}\n` +
    `📱 Telefon raqam berganlar: ${usersWithPhone}\n` +
    `📸 Jami ishlangan rasmlar: ${totalProcessed}\n` +
    `💰 Jami balans: ${totalBalance.toLocaleString('uz-UZ')} so'm\n\n` +
    `Quyidagi amallardan birini tanlang:`,
    {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('👥 Barcha foydalanuvchilar', 'admin_users_list')],
        [Markup.button.callback('🔍 Chat ID bo\'yicha qidirish', 'admin_search_by_id')],
        [Markup.button.callback('💰 Hisob to\'ldirish', 'admin_add_credit')],
        [Markup.button.callback('📊 Statistika', 'admin_stats')],
        [Markup.button.callback('🔄 Yangilash', 'admin_refresh')],
      ]).reply_markup,
    }
  );
}

/**
 * Foydalanuvchilar ro'yxati (sahifalash bilan)
 */
async function showUsersList(ctx, page = 0) {
  if (!isAdmin(ctx.from.id)) return;

  const allUsers = userManager.getAllUsers();
  const pageSize = 10;
  const totalPages = Math.ceil(allUsers.length / pageSize);
  const start = page * pageSize;
  const end = start + pageSize;
  const pageUsers = allUsers.slice(start, end);

  if (pageUsers.length === 0) {
    return ctx.reply('📭 Foydalanuvchilar yo\'q.');
  }

  let message = `👥 <b>Foydalanuvchilar ro'yxati</b>\n`;
  message += `📄 Sahifa ${page + 1}/${totalPages}\n\n`;
  message += `📊 <b>Legend:</b>\n`;
  message += `📸 Ishlangan | 🎁 Bepul | 🎉 Bonus | 💰 Balans\n\n`;

  pageUsers.forEach((user, index) => {
    const num = start + index + 1;
    const name = user.firstName || 'Noma\'lum';
    const phone = user.phoneNumber || 'Yo\'q';
    const processed = user.processedImages;
    const balance = user.balance.toLocaleString('uz-UZ');
    const free = user.remainingFree;
    const bonus = user.bonusImages || 0;

    message += `${num}. <b>${name}</b>\n`;
    message += `   📱 ${phone}\n`;
    message += `   🆔 <code>${user.userId}</code>\n`;
    message += `   📸 ${processed} | 🎁 ${free} | 🎉 ${bonus} | 💰 ${balance}\n\n`;
  });

  const buttons = [];
  const navButtons = [];

  if (page > 0) {
    navButtons.push(Markup.button.callback('⬅️ Oldingi', `admin_users_page_${page - 1}`));
  }
  if (page < totalPages - 1) {
    navButtons.push(Markup.button.callback('Keyingi ➡️', `admin_users_page_${page + 1}`));
  }

  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  buttons.push([Markup.button.callback('🏠 Admin panel', 'admin_home')]);

  await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
  });
}

/**
 * Foydalanuvchi tafsilotlari
 */
async function showUserDetails(ctx, userId) {
  if (!isAdmin(ctx.from.id)) return;

  const user = userManager.getUserById(userId);
  if (!user) {
    return ctx.reply('❌ Foydalanuvchi topilmadi.');
  }

  const stats = userManager.getUserStats(userId);

  await ctx.reply(
    `👤 <b>Foydalanuvchi tafsilotlari</b>\n\n` +
    `🆔 ID: <code>${user.userId}</code>\n` +
    `👤 Ism: ${user.firstName || 'Noma\'lum'} ${user.lastName || ''}\n` +
    `📱 Telefon: ${user.phoneNumber || 'Yo\'q'}\n` +
    `🔗 Username: ${user.username ? '@' + user.username : 'Yo\'q'}\n\n` +
    `📊 <b>Statistika:</b>\n` +
    `📸 Ishlangan rasmlar: ${stats.processedImages}\n` +
    `🎁 Bepul rasmlar qoldi: ${stats.remainingFree}\n` +
    `🎉 Bonus rasmlar: ${stats.bonusImages}\n` +
    `💰 Balans: ${stats.balance.toLocaleString('uz-UZ')} so'm\n\n` +
    `📅 Ro'yxatdan o'tgan: ${new Date(user.createdAt).toLocaleString('uz-UZ')}\n` +
    `🔄 Oxirgi faollik: ${new Date(user.updatedAt).toLocaleString('uz-UZ')}`,
    {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('💰 Balans qo\'shish', `admin_add_balance_${userId}`)],
        [Markup.button.callback('🎁 Bepul rasmlar berish', `admin_add_free_${userId}`)],
        [Markup.button.callback('📊 Statistikani tozalash', `admin_reset_stats_${userId}`)],
        [Markup.button.callback('🔙 Orqaga', 'admin_users_list')],
        [Markup.button.callback('🏠 Admin panel', 'admin_home')],
      ]).reply_markup,
    }
  );
}

/**
 * Balans qo'shish
 */
async function addBalanceToUser(ctx, userId, amount) {
  if (!isAdmin(ctx.from.id)) return;

  userManager.addBalance(userId, amount);
  const stats = userManager.getUserStats(userId);

  await ctx.reply(
    `✅ <b>Balans qo'shildi!</b>\n\n` +
    `👤 User ID: ${userId}\n` +
    `💰 Qo'shildi: +${amount.toLocaleString('uz-UZ')} so'm\n` +
    `💳 Yangi balans: ${stats.balance.toLocaleString('uz-UZ')} so'm`,
    { parse_mode: 'HTML' }
  );

  // Foydalanuvchiga xabar
  try {
    await ctx.telegram.sendMessage(
      userId,
      `🎉 <b>Sizga balans qo'shildi!</b>\n\n` +
      `💰 +${amount.toLocaleString('uz-UZ')} so'm\n` +
      `💳 Yangi balans: ${stats.balance.toLocaleString('uz-UZ')} so'm\n\n` +
      `Endi rasmlarni ishlashingiz mumkin!\n\n` +
      `❓ Savollar: @RootDev07`,
      { parse_mode: 'HTML' }
    );
  } catch (err) {
    logger.error('Foydalanuvchiga xabar yuborib bo\'lmadi:', err);
  }
}

/**
 * Bepul rasmlar berish (bonus rasm qo'shish)
 */
async function addFreeImagesToUser(ctx, userId, count) {
  if (!isAdmin(ctx.from.id)) return;

  const user = userManager.getUserById(userId);
  if (!user) {
    return ctx.reply('❌ Foydalanuvchi topilmadi.');
  }

  // Bonus rasm qo'shish
  userManager.addBonusImages(userId, count);

  const stats = userManager.getUserStats(userId);

  await ctx.reply(
    `✅ <b>Bonus rasm qo'shildi!</b>\n\n` +
    `👤 User ID: ${userId}\n` +
    `🎁 Qo'shildi: ${count} ta rasm\n` +
    `📸 Jami bonus: ${stats.bonusImages} ta\n\n` +
    `Foydalanuvchi ${stats.bonusImages} ta rasm bepul qila oladi!`,
    { parse_mode: 'HTML' }
  );

  // Foydalanuvchiga xabar
  try {
    await ctx.telegram.sendMessage(
      userId,
      `🎉 <b>Sizga bonus rasmlar berildi!</b>\n\n` +
      `🎁 ${count} ta rasm bepul!\n` +
      `📸 Jami bonus rasmlar: ${stats.bonusImages} ta\n\n` +
      `Bu rasmlarni ishlatib bo'lgandan keyin, pullik tarifga o'tasiz.\n\n` +
      `Endi rasmlarni ishlashingiz mumkin!\n\n` +
      `❓ Savollar: @RootDev07`,
      { parse_mode: 'HTML' }
    );
  } catch (err) {
    logger.error('Foydalanuvchiga xabar yuborib bo\'lmadi:', err);
  }
}

/**
 * Umumiy statistika
 */
async function showAdminStats(ctx) {
  if (!isAdmin(ctx.from.id)) return;

  const allUsers = userManager.getAllUsers();
  const userCount = allUsers.length;
  
  const usersWithPhone = allUsers.filter(u => u.phoneNumber).length;
  const usersWithoutPhone = userCount - usersWithPhone;
  
  const totalProcessed = allUsers.reduce((sum, u) => sum + u.processedImages, 0);
  const totalBalance = allUsers.reduce((sum, u) => sum + u.balance, 0);
  const totalBonus = allUsers.reduce((sum, u) => sum + (u.bonusImages || 0), 0);
  
  const freeUsers = allUsers.filter(u => u.processedImages < 2).length;
  const proUsers = allUsers.filter(u => u.processedImages >= 2).length;
  
  const avgProcessed = userCount > 0 ? (totalProcessed / userCount).toFixed(1) : 0;
  const avgBalance = userCount > 0 ? (totalBalance / userCount).toFixed(0) : 0;
  const avgBonus = userCount > 0 ? (totalBonus / userCount).toFixed(1) : 0;

  await ctx.reply(
    `📊 <b>Umumiy statistika</b>\n\n` +
    `👥 <b>Foydalanuvchilar:</b>\n` +
    `├ Jami: ${userCount}\n` +
    `├ Telefon raqam bergan: ${usersWithPhone}\n` +
    `├ Telefon raqam bermagan: ${usersWithoutPhone}\n` +
    `├ FREE foydalanuvchilar: ${freeUsers}\n` +
    `└ PRO foydalanuvchilar: ${proUsers}\n\n` +
    `📸 <b>Rasmlar:</b>\n` +
    `├ Jami ishlangan: ${totalProcessed}\n` +
    `└ O'rtacha: ${avgProcessed} ta/user\n\n` +
    `🎉 <b>Bonus rasmlar:</b>\n` +
    `├ Jami: ${totalBonus} ta\n` +
    `└ O'rtacha: ${avgBonus} ta/user\n\n` +
    `💰 <b>Balans:</b>\n` +
    `├ Jami: ${totalBalance.toLocaleString('uz-UZ')} so'm\n` +
    `└ O'rtacha: ${parseInt(avgBalance).toLocaleString('uz-UZ')} so'm/user`,
    {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Yangilash', 'admin_stats')],
        [Markup.button.callback('🏠 Admin panel', 'admin_home')],
      ]).reply_markup,
    }
  );
}

module.exports = {
  isAdmin,
  showAdminPanel,
  showUsersList,
  showUserDetails,
  addBalanceToUser,
  addFreeImagesToUser,
  showAdminStats,
};
