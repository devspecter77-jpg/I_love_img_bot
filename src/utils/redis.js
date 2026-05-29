// Redis o'rnatilmagan — in-memory ishlatiladi
module.exports = {
  createClient: () => ({ quit: () => {} }),
  getClient: () => null,
};
