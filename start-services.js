const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AI service...');

// AI service ni background da ishga tushirish
const aiService = spawn('python', ['main.py'], {
  cwd: path.join(__dirname, 'ai-service'),
  env: { ...process.env, MAX_SIZE: '384' },
  stdio: 'inherit'
});

aiService.on('error', (err) => {
  console.error('❌ AI service xato:', err);
});

// AI service tayyor bo'lishini kutish
setTimeout(() => {
  console.log('✅ AI service tayyor');
  console.log('🤖 Starting bot...');
  
  // Bot ni ishga tushirish
  require('./src/index.js');
}, 5000);

// Cleanup
process.on('SIGINT', () => {
  console.log('🛑 Stopping services...');
  aiService.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Stopping services...');
  aiService.kill();
  process.exit(0);
});
