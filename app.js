const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const flightRoutes = require('./routes/flightRoutes'); // Rotas específicas
const airportsRoutes = require('./routes/airportsRoutes'); // Rotas específicas
require('dotenv').config(); // Carrega variáveis de ambiente
const { initializeData, airportsData, flightsData } = require('./loaders/dataLoaders');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(flightRoutes);
app.use(airportsRoutes);

const dataReady = initializeData();

app.use(async (req, res, next) => {
  try {
    await dataReady; // Aguarde até que os dados sejam carregados
    next();
  } catch (error) {
    console.error('Data initialization failed:', error);
    res.status(500).send('Server failed to initialize.');
  }
});

module.exports = app;