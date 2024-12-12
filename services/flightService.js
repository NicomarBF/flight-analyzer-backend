const { getLatLonByICAO, getDateDetails, getFlightTime, generateInputForAirCompanyRecomendationModel } = require('../utils/flightUtils');
const { getWeatherData } = require('../services/weatherDataService');
const {  getAirCompanyRecomendation, getFlightAnalysis } = require('../services/aiService');
const moment = require('moment');
require('dotenv').config();

exports.getFlightAnalysis = async (query) => {
  try {
    const { origin, destination, datetime } = query;

    const originData = getLatLonByICAO(origin);
    const destinationData = getLatLonByICAO(destination);

    if (!originData || !destinationData) {
      throw new Error('Origin or destination airport not found.');
    }

    const dt = moment(query.datetime, 'DD/MM/YYYY HH:mm:ss').unix();

    if (!dt) {
        return res.status(400).json({
            success: false,
            message: 'Invalid datetime format. Please use "DD/MM/YYYY HH:mm:ss".'
        });
    }

    const [weatherDataOrigin, weatherDataDestination] = await Promise.all([
      getWeatherData(originData.latitude, originData.longitude, dt, process.env.WEATHER_DATA_API_KEY),
      getWeatherData(destinationData.latitude, destinationData.longitude, dt, process.env.WEATHER_DATA_API_KEY),
    ]);

    const dateDetails = getDateDetails(dt);

    const estimatedFlightTime = await getFlightTime(origin, destination);

    const inputAirCompanyRecomendation = generateInputForAirCompanyRecomendationModel(
      query,
      originData,
      destinationData,
      weatherDataOrigin,
      weatherDataDestination,
      dateDetails,
      estimatedFlightTime
    );

    const airCompanyRecomendation = await getAirCompanyRecomendation(inputAirCompanyRecomendation);

    const inputFlightAnalysis = {
      ...inputAirCompanyRecomendation,
      'Empresa Aérea': airCompanyRecomendation.air_company,
    };
    const flightAnalysis = await getFlightAnalysis(inputFlightAnalysis);

    return {
      ...flightAnalysis,
      air_company: airCompanyRecomendation.air_company,
      normal_flight_time: estimatedFlightTime,
    };
  } catch (error) {
    console.error('Error in getFlightAnalysis service:', error);
    throw error;
  }
};