const gachaRepository = require('./gacha-repository');

const PRIZES = [
  { name: 'Emas 10 gram', quota: 1, probability: 0.005 },
  { name: 'Smartphone X', quota: 5, probability: 0.02 },
  { name: 'Smartwatch Y', quota: 10, probability: 0.04 },
  { name: 'Voucher Rp100.000', quota: 100, probability: 0.15 },
  { name: 'Pulsa Rp50.000', quota: 500, probability: 0.3 },
];

const MAX_GACHA_PER_DAY = 5;

function getTodayDate() {
  const now = new Date();
  const jakartaOffset = 7 * 60;
  const jakartaTime = new Date(now.getTime() + jakartaOffset * 60 * 1000);
  return jakartaTime.toISOString().split('T')[0];
}

async function rollGacha() {
  const roll = Math.random();
  let cumulative = 0;
  for (const prize of PRIZES) {
    cumulative += prize.probability;
    if (roll <= cumulative) {
      const winnersCount = await gachaRepository.countPrizeWinners(prize.name);
      if (winnersCount < prize.quota) {
        return prize.name;
      }
    }
  }
  return null;
}

async function performGacha(userId, userName) {
  const today = getTodayDate();
  const todayCount = await gachaRepository.countUserGachaToday(userId, today);
  if (todayCount >= MAX_GACHA_PER_DAY) {
    return { success: false, error: 'QUOTA_EXCEEDED', todayCount };
  }
  const prize = await rollGacha();
  await gachaRepository.saveGachaLog(userId, userName, prize, today);
  return {
    success: true,
    prize,
    attemptsUsedToday: todayCount + 1,
    attemptsRemainingToday: MAX_GACHA_PER_DAY - (todayCount + 1),
  };
}

async function getUserGachaHistory(userId) {
  const logs = await gachaRepository.getUserGachaHistory(userId);
  return logs.map((log) => ({
    id: log._id,
    gachaDate: log.gachaDate,
    prize: log.prize || 'Tidak memenangkan hadiah',
    timestamp: log.createdAt,
  }));
}

async function getPrizesInfo() {
  return Promise.all(
    PRIZES.map(async (prize) => {
      const winnersCount = await gachaRepository.countPrizeWinners(prize.name);
      return {
        prize: prize.name,
        totalQuota: prize.quota,
        winnersCount,
        remainingQuota: prize.quota - winnersCount,
      };
    })
  );
}

function maskName(name) {
  return name
    .split(' ')
    .map((word) => {
      if (word.length <= 1) return word;
      const chars = word.split('');
      for (let i = 1; i < chars.length - 1; i++) {
        if (Math.random() > 0.5) chars[i] = '*';
      }
      if (Math.random() > 0.6) chars[0] = '*';
      if (Math.random() > 0.6) chars[chars.length - 1] = '*';
      return chars.join('');
    })
    .join(' ');
}

async function getWinnersList() {
  const allWinners = await gachaRepository.getAllWinners();
  const grouped = {};
  for (const prize of PRIZES) grouped[prize.name] = [];
  for (const log of allWinners) {
    if (log.prize && grouped[log.prize] !== undefined) {
      grouped[log.prize].push({
        maskedName: maskName(log.userName),
        date: log.gachaDate,
      });
    }
  }
  return Object.entries(grouped).map(([prize, winners]) => ({ prize, winners }));
}

module.exports = {
  performGacha,
  getUserGachaHistory,
  getPrizesInfo,
  getWinnersList,
};