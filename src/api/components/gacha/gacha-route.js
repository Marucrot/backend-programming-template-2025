const express = require('express');
const gachaController = require('./gacha-controller');

console.log("GACHA ROUTE LOADED");

module.exports = (app) => {
  const router = express.Router();

  router.post('/', gachaController.performGacha);
  router.get('/prizes', gachaController.getPrizesInfo);
  router.get('/winners', gachaController.getWinnersList);
  router.get('/history/:userId', gachaController.getUserGachaHistory);

  app.use('/gacha', router);
};