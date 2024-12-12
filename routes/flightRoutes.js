const express = require('express');
const flightController = require('../controllers/flightController');

const router = express.Router();

router.get('/api/analysis', flightController.analyzeFlight);

module.exports = router;