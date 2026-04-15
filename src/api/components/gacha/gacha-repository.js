const { GachaLogs } = require('../../../models');

async function countUserGachaToday(userId, today) {
  return GachaLogs.countDocuments({ userId, gachaDate: today });
}

async function countPrizeWinners(prize) {
  return GachaLogs.countDocuments({ prize });
}

async function saveGachaLog(userId, userName, prize, gachaDate) {
  const log = new GachaLogs({ userId, userName, prize, gachaDate });
  return log.save();
}

async function getUserGachaHistory(userId) {
  return GachaLogs.find({ userId }).sort({ createdAt: -1 });
}

async function getAllWinners() {
  return GachaLogs.find({ prize: { $ne: null } }).sort({ createdAt: 1 });
}

module.exports = {
  countUserGachaToday,
  countPrizeWinners,
  saveGachaLog,
  getUserGachaHistory,
  getAllWinners,
};