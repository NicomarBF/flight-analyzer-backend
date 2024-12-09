const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.WEATHER_DATA_API_KEY;
const WEATHER_DATA_URL = process.env.WEATHER_DATA_URL;

exports.getWeatherData = async (lat, lon, dt) => {
    try {
        const url = WEATHER_DATA_URL;
        const response = await axios.get(url, {
            params: {
                lat: lat,
                lon: lon,
                dt: dt,
                appid: API_KEY,
                units: 'metric'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao obter dados de clima:', error.response?.data || error.message);
        throw new Error('Falha ao buscar dados de clima.');
    }
}