const express = require('express');
const airportsController = require('../controllers/airportsController');

const router = express.Router();

router.get('/api/airports', airportsController.getAirports);

module.exports = router;