const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const flightRoutes = require('./routes/flightRoutes');
const airportsRoutes = require('./routes/airportsRoutes');
require('dotenv').config();
const { initializeData, airportsData, flightsData } = require('./loaders/dataLoaders');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(flightRoutes);
app.use(airportsRoutes);

const dataReady = initializeData();

app.use(async (req, res, next) => {
  try {
    await dataReady;
    next();
  } catch (error) {
    console.error('Data initialization failed:', error);
    res.status(500).send('Server failed to initialize.');
  }
});

module.exports = app;