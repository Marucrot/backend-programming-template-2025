console.log("GACHA ROUTE LOADED");
const gachaService = require('./gacha-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

async function performGacha(request, response, next) {
  try {
    const { user_id: userId, user_name: userName } = request.body;
    if (!userId)
      throw errorResponder(errorTypes.VALIDATION, 'user_id is required');
    if (!userName)
      throw errorResponder(errorTypes.VALIDATION, 'user_name is required');

    const result = await gachaService.performGacha(userId, userName);

    if (!result.success && result.error === 'QUOTA_EXCEEDED') {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Batas maksimal gacha (5 kali) sudah tercapai hari ini. Coba lagi besok.'
      );
    }

    return response.status(200).json({
      message: result.prize
        ? `Selamat! Anda memenangkan: ${result.prize}`
        : 'Maaf, Anda tidak memenangkan hadiah apapun kali ini.',
      prize: result.prize,
      attemptsUsedToday: result.attemptsUsedToday,
      attemptsRemainingToday: result.attemptsRemainingToday,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserGachaHistory(request, response, next) {
  try {
    const { userId } = request.params;
    const history = await gachaService.getUserGachaHistory(userId);
    return response.status(200).json({
      userId,
      totalAttempts: history.length,
      history,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPrizesInfo(request, response, next) {
  try {
    const prizes = await gachaService.getPrizesInfo();
    return response.status(200).json({ prizes });
  } catch (error) {
    return next(error);
  }
}

async function getWinnersList(request, response, next) {
  try {
    const winners = await gachaService.getWinnersList();
    return response.status(200).json({ winners });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  performGacha,
  getUserGachaHistory,
  getPrizesInfo,
  getWinnersList,
};
