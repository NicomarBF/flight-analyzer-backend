const path = require('path');
const csvtojson = require('csvtojson');

let airportsData = [];
let flightsData = [];

const loadAirportsData = async () => {
  const csvFilePath = path.join(__dirname, '../data/aerodromos.csv');
  try {
    airportsData = await csvtojson().fromFile(csvFilePath);
    console.log('Airports data loaded successfully!');
  } catch (error) {
    console.error('Error loading airports data:', error);
    throw error;
  }
};

const loadFlightsData = async () => {
  const csvFilePath = path.join(__dirname, '../data/registros_temp_voos.csv');
  try {
    flightsData = await csvtojson().fromFile(csvFilePath);
    console.log('Flights data loaded successfully!');
  } catch (error) {
    console.error('Error loading flights data:', error);
    throw error;
  }
};

const getAirportsData = () => airportsData;
const getFlightsData = () => flightsData;

const initializeData = async () => {
  try {
    await loadAirportsData();
    await loadFlightsData();
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
};

module.exports = {
  initializeData,
  getAirportsData,
  getFlightsData,
};
