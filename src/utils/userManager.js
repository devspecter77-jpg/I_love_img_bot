const logger = require('./logger');
const fs = require('fs');
const path = require('path');

// Ma'lumotlarni saqlash fayli
const DATA_FILE = path.join(process.cwd(), 'storage', 'users.json');

// In-memory user store (replace with database for production)
const users = new Map();

const FREE_IMAGES_COUNT = 2; // Birinchi 2 ta rasm bepul
const PRICE_PER_IMAGE = 5000; // Har bir rasm 5000 so'm

/**
 * Ma'lumotlarni fayldan yuklash
 */
function loadUsersFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const usersArray = JSON.parse(data);
      
      usersArray.forEach(user => {
        users.set(user.userId.toString(), user);
      });
      
      logger.info(`${users.size} ta foydalanuvchi yuklandi`);
    } else {
      logger.info('Foydalanuvchilar fayli topilmadi, yangi yaratiladi');
    }
  } catch (err) {
    logger.error('Foydalanuvchilarni yuklashda xato:', err);
  }
}

/**
 * Ma'lumotlarni faylga saqlash
 */
function saveUsersToFile() {
  try {
    const usersArray = Array.from(users.values());
    const dir = path.dirname(DATA_FILE);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(usersArray, null, 2), 'utf8');
    logger.debug(`${usersArray.length} ta foydalanuvchi saqlandi`);
  } catch (err) {
    logger.error('Foydalanuvchilarni saqlashda xato:', err);
  }
}

// Bot ishga tushganda ma'lumotlarni yuklash
loadUsersFromFile();

/**
 * Foydalanuvchini ro'yxatdan o'tkazish yoki olish
 */
function getOrCreateUser(userId, userData = {}) {
  const userIdStr = userId.toString();
  
  if (users.has(userIdStr)) {
    return users.get(userIdStr);
  }

  const user = {
    userId,
    phoneNumber: userData.phoneNumber || null,
    firstName: userData.firstName || null,
    lastName: userData.lastName || null,
    username: userData.username || null,
    processedImages: 0, // Jami ishlangan rasmlar soni
    balance: 0, // Balans (so'm)
    bonusImages: 0, // Bonus rasm limiti (admin beradi)
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  users.set(userIdStr, user);
  saveUsersToFile(); // Faylga saqlash
  logger.info(`Yangi foydalanuvchi: ${userId} (${user.firstName})`);
  return user;
}

/**
 * Foydalanuvchi ma'lumotlarini yangilash
 */
function updateUser(userId, data) {
  const userIdStr = userId.toString();
  const existing = users.get(userIdStr);
  
  if (!existing) {
    return getOrCreateUser(userId, data);
  }

  const updated = { ...existing, ...data, updatedAt: Date.now() };
  users.set(userIdStr, updated);
  saveUsersToFile(); // Faylga saqlash
  return updated;
}

/**
 * Telefon raqamini saqlash
 */
function savePhoneNumber(userId, phoneNumber) {
  return updateUser(userId, { phoneNumber });
}

/**
 * Telefon raqam bo'yicha foydalanuvchini topish
 */
function findUserByPhone(phoneNumber) {
  // Telefon raqamni tozalash (+ va bo'shliqlarni olib tashlash)
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

/**
 * Foydalanuvchi bepul rasmlardan foydalana oladimi?
 */
function canUseFreeImages(userId) {
  // Admin uchun cheksiz bepul
  const ADMIN_ID = process.env.ADMIN_ID || '';
  if (userId.toString() === ADMIN_ID) {
    return true;
  }

  const user = users.get(userId.toString());
  if (!user) return true; // Yangi foydalanuvchi
  
  // Bepul yoki bonus rasmlar bormi?
  const remainingFree = getRemainingFreeImages(userId);
  const bonusImages = user.bonusImages || 0;
  
  return remainingFree > 0 || bonusImages > 0;
}

/**
 * Qancha bepul rasm qolgan?
 */
function getRemainingFreeImages(userId) {
  const user = users.get(userId.toString());
  if (!user) return FREE_IMAGES_COUNT;
  const remaining = FREE_IMAGES_COUNT - user.processedImages;
  return Math.max(0, remaining);
}

/**
 * Rasmlar uchun to'lov kerakmi va qancha?
 */
function calculatePayment(userId, imageCount) {
  // Admin uchun cheksiz bepul
  const ADMIN_ID = process.env.ADMIN_ID || '';
  if (userId.toString() === ADMIN_ID) {
    return { 
      needsPayment: false, 
      amount: 0, 
      freeCount: imageCount, 
      bonusCount: 0, 
      paidCount: 0,
      isAdmin: true 
    };
  }

  const user = users.get(userId.toString());
  
  if (!user) {
    // Yangi foydalanuvchi
    if (imageCount <= FREE_IMAGES_COUNT) {
      return { needsPayment: false, amount: 0, freeCount: imageCount, bonusCount: 0, paidCount: 0 };
    }
    const paidCount = imageCount - FREE_IMAGES_COUNT;
    return {
      needsPayment: true,
      amount: paidCount * PRICE_PER_IMAGE,
      freeCount: FREE_IMAGES_COUNT,
      bonusCount: 0,
      paidCount,
    };
  }

  const remainingFree = getRemainingFreeImages(userId);
  const bonusImages = user.bonusImages || 0;
  
  let freeCount = 0;
  let bonusCount = 0;
  let paidCount = 0;
  
  // 1. Avval bepul rasmlardan foydalanish
  if (remainingFree > 0) {
    freeCount = Math.min(imageCount, remainingFree);
  }
  
  let remaining = imageCount - freeCount;
  
  // 2. Keyin bonus rasmlardan foydalanish
  if (remaining > 0 && bonusImages > 0) {
    bonusCount = Math.min(remaining, bonusImages);
    remaining -= bonusCount;
  }
  
  // 3. Qolganini pullik qilish
  if (remaining > 0) {
    paidCount = remaining;
  }
  
  const needsPayment = paidCount > 0;
  const amount = paidCount * PRICE_PER_IMAGE;
  
  return {
    needsPayment,
    amount,
    freeCount,
    bonusCount,
    paidCount,
  };
}

/**
 * Rasmlar ishlanganini belgilash
 */
function recordProcessedImages(userId, count) {
  const user = users.get(userId.toString());
  if (!user) return;
  
  // Admin uchun bonus rasmlarni kamaytirmaslik
  const ADMIN_ID = process.env.ADMIN_ID || '';
  if (userId.toString() !== ADMIN_ID) {
    const payment = calculatePayment(userId, count);
    
    // Bonus rasmlarni kamaytirish
    if (payment.bonusCount > 0) {
      user.bonusImages = Math.max(0, (user.bonusImages || 0) - payment.bonusCount);
    }
  }
  
  user.processedImages += count;
  user.updatedAt = Date.now();
  users.set(userId.toString(), user);
  saveUsersToFile(); // Faylga saqlash
  
  logger.info(`User ${userId}: ${count} ta rasm ishlandi (jami: ${user.processedImages}, bonus qoldi: ${user.bonusImages || 0})`);
}

/**
 * Balansni to'ldirish
 */
function addBalance(userId, amount) {
  const user = users.get(userId.toString());
  if (!user) return;
  
  user.balance += amount;
  user.updatedAt = Date.now();
  users.set(userId.toString(), user);
  saveUsersToFile(); // Faylga saqlash
  
  logger.info(`User ${userId}: balans to'ldirildi +${amount} so'm (jami: ${user.balance})`);
}

/**
 * Balansdan yechish
 */
function deductBalance(userId, amount) {
  const user = users.get(userId.toString());
  if (!user) return false;
  
  if (user.balance < amount) {
    return false; // Yetarli balans yo'q
  }
  
  user.balance -= amount;
  user.updatedAt = Date.now();
  users.set(userId.toString(), user);
  saveUsersToFile(); // Faylga saqlash
  
  logger.info(`User ${userId}: balans yechildi -${amount} so'm (qoldi: ${user.balance})`);
  return true;
}

/**
 * Foydalanuvchi statistikasi
 */
function getUserStats(userId) {
  const user = users.get(userId.toString());
  if (!user) {
    return {
      processedImages: 0,
      remainingFree: FREE_IMAGES_COUNT,
      balance: 0,
      bonusImages: 0,
    };
  }
  
  return {
    processedImages: user.processedImages,
    remainingFree: getRemainingFreeImages(userId),
    balance: user.balance,
    bonusImages: user.bonusImages || 0,
  };
}

/**
 * Bonus rasm qo'shish
 */
function addBonusImages(userId, count) {
  const user = users.get(userId.toString());
  if (!user) return;
  
  user.bonusImages = (user.bonusImages || 0) + count;
  user.updatedAt = Date.now();
  users.set(userId.toString(), user);
  saveUsersToFile();
  
  logger.info(`User ${userId}: bonus rasm qo'shildi +${count} (jami: ${user.bonusImages})`);
}

/**
 * Bonus rasmdan foydalanish
 */
function useBonusImage(userId) {
  const user = users.get(userId.toString());
  if (!user || !user.bonusImages || user.bonusImages <= 0) {
    return false;
  }
  
  user.bonusImages -= 1;
  user.updatedAt = Date.now();
  users.set(userId.toString(), user);
  saveUsersToFile();
  
  logger.info(`User ${userId}: bonus rasm ishlatildi (qoldi: ${user.bonusImages})`);
  return true;
}

/**
 * Barcha foydalanuvchilarni olish
 */
function getAllUsers() {
  return Array.from(users.values()).map(user => ({
    ...user,
    remainingFree: getRemainingFreeImages(user.userId),
  }));
}

/**
 * Foydalanuvchilar sonini olish
 */
function getUserCount() {
  return users.size;
}

/**
 * Foydalanuvchini ID bo'yicha olish
 */
function getUserById(userId) {
  return users.get(userId.toString());
}

module.exports = {
  getOrCreateUser,
  updateUser,
  savePhoneNumber,
  findUserByPhone,
  canUseFreeImages,
  getRemainingFreeImages,
  calculatePayment,
  recordProcessedImages,
  addBalance,
  deductBalance,
  addBonusImages,
  useBonusImage,
  getUserStats,
  getAllUsers,
  getUserCount,
  getUserById,
  FREE_IMAGES_COUNT,
  PRICE_PER_IMAGE,
};
