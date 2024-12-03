const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');
const { DefaultDeserializer } = require('v8');
const path = require('path');
const csvtojson = require('csvtojson');
const moment = require('moment');
const { get } = require('http');
const axios = require('axios');
const Holidays = require('date-holidays');


const app = express();
const PORT = 3001;

const API_KEY = "edf80af23f8f44c9ddaaf02d46c42e88"

app.use(cors());
app.use(bodyParser.json());

let airportsData = [];
let flightsData = [];

const loadAirportsData = async () => {
    const csvFilePath = path.join(__dirname, 'aerodromos.csv');
    airportsData = await csvtojson().fromFile(csvFilePath);
};

const loadFlightsData = async () => {
    const csvFilePath = path.join(__dirname, 'registros_temp_voos.csv');
    flightsData = await csvtojson().fromFile(csvFilePath);
};

// Função para obter latitude e longitude pelo código ICAO
const getLatLonByICAO = (icaoCode) => {
    if (!airportsData || airportsData.length === 0) {
        console.error("Airports data is not loaded yet.");
        return null;
    }

    const airport = airportsData.find(
        (airport) => airport['SIGLA ICAO AERÓDROMO'] === icaoCode
    );

    if (airport) {
        const latitude = airport['LATITUDE']
        ? parseFloat(airport['LATITUDE'].replace(',', '.'))
        : null;
        const longitude = airport['LONGITUDE']
        ? parseFloat(airport['LONGITUDE'].replace(',', '.'))
        : null;

        if (latitude !== null && longitude !== null) {
        return { latitude, longitude };
        } else {
        console.error(`Latitude or longitude missing for ICAO code: ${icaoCode}`);
        }
    } else {
        console.error(`ICAO code not found: ${icaoCode}`);
    }
}

app.get('/api/analysis', async (req, res) => {
    try {
        if (!req.query.origin || !req.query.destination || !req.query.datetime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: origin, destination, datetime.'
            });
        }

        const originData = await getLatLonByICAO(req.query.origin);
        const destinationData = await getLatLonByICAO(req.query.destination);

        if (!originData || !destinationData) {
            return res.status(404).json({
                success: false,
                message: 'Origin or destination airport not found.'
            });
        }

        const dt = moment(req.query.datetime, 'DD/MM/YYYY HH:mm:ss').unix();

        if (!dt) {
            return res.status(400).json({
                success: false,
                message: 'Invalid datetime format. Please use "DD/MM/YYYY HH:mm:ss".'
            });
        }

        const [weatherDataOrigin, weatherDataDestination] = await Promise.all([
            getWeatherData(originData.latitude, originData.longitude, dt, API_KEY),
            getWeatherData(destinationData.latitude, destinationData.longitude, dt, API_KEY)
        ]);

        if (!weatherDataOrigin || !weatherDataDestination) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch weather data for one or both airports.'
            });
        }

        const dateDetails = getDateDetails(dt);

        const estimedFlightTime = await getFlightTime(req.query.origin, req.query.destination);

        if (!estimedFlightTime) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch estimated flight time.'
            });
        }

        const inputAirCompanyRecomendation = generateInputForAirCompanyRecomendationModel(
            req,
            originData,
            destinationData,
            weatherDataOrigin,
            weatherDataDestination,
            dateDetails,
            estimedFlightTime
        );

        const airCompanyRecomendation = await getAirCompanyRecomendation(inputAirCompanyRecomendation);

        if (!airCompanyRecomendation || !airCompanyRecomendation.air_company) {
            return res.status(500).json({
                success: false,
                message: 'Failed to recommend an airline.'
            });
        }

        const inputFlightAnalysis = {
            ...inputAirCompanyRecomendation,
            'Empresa Aérea': airCompanyRecomendation.air_company
        };

        const flightAnalysis = await getFlightAnalysis(inputFlightAnalysis);

        if (!flightAnalysis) {
            return res.status(500).json({
                success: false,
                message: 'Failed to perform flight analysis.'
            });
        }

        const returnAnalysis = {
            ...flightAnalysis,
            'air_company': airCompanyRecomendation.air_company,
            'normal_flight_time': estimedFlightTime
        };

        return res.json({
            success: true,
            message: "Flight analysis completed successfully.",
            data: returnAnalysis
        });

    } catch (error) {
        console.error("Error during flight analysis:", error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred during the flight analysis.'
        });
    }
});

async function getAirCompanyRecomendation(input) {

    input = JSON.stringify(input);

    const python = spawn('python', ['air_company_recomendation.py', input]);

    return new Promise((resolve, reject) => {
        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            console.log(`Processo Python finalizado com código: ${code}`);
            if (code !== 0) {
                console.error("Erro ao executar o script Python:", errorOutput);
                reject(new Error("Erro ao executar o script Python"));
            }

            try {
                const result = JSON.parse(output);
                resolve(result);
            } catch (error) {
                console.error("Erro ao processar a resposta do modelo:", error);
                reject(new Error("Erro ao processar a resposta do modelo"));
            }
        });
    });
}

async function getFlightAnalysis(input) {

    input = JSON.stringify(input);

    const python = spawn('python', ['flight_analysis.py', input]);

    return new Promise((resolve, reject) => {
        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            console.log(`Processo Python finalizado com código: ${code}`);
            if (code !== 0) {
                console.error("Erro ao executar o script Python:", errorOutput);
                reject(new Error("Erro ao executar o script Python"));
            }

            try {
                const result = JSON.parse(output);
                resolve(result);
            } catch (error) {
                console.error("Erro ao processar a resposta do modelo:", error);
                reject(new Error("Erro ao processar a resposta do modelo"));
            }
        });
    });
}

app.get('/api/airports', async (req, res) => {
    try {
        if (!airportsData || airportsData.length === 0) {
            return res.status(500).send('Os aeródromos não foram carregados ainda.');
        }
        res.json(airportsData);
    } catch (error) {
        res.status(500).send('Erro ao carregar os aeródromos');
    }
});

async function getWeatherData(lat, lon, dt, apiKey) {
    try {
        const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine`;
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

function getDateDetails(unixDate) {
    const date = moment.unix(unixDate).toDate();
    const hd = new Holidays('BR');

    const holiday = hd.isHoliday(date);
    const isHoliday = holiday ? 1 : 0;

    const isWeekend = (date.getDay() === 0 || date.getDay() === 6) ? 1 : 0;

    const dayOfWeek = moment(date).format('dddd');

    return {
        'Final de Semana': isWeekend,
        'Feriado': isHoliday,
        'Dia da Semana': dayOfWeek,
    };
}

async function getFlightTime(originCode, destinationCode) {

    try {
        const flight = flightsData.find(flight =>
            flight['Cód Origem'] === originCode && flight['Cód Destino'] === destinationCode
        );

        if (flight) {
            return parseInt(flight['Tempo esperado de voo'], 10);
        } else {
            throw new Error('Voo não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao obter o tempo esperado de voo:', error);
        throw error;
    }
}

const generateInputForAirCompanyRecomendationModel = (req, originData, destinationData, weatherDataOrigin, weatherDataDestination, dateDatails, estimedFlightTime) => {
    
    const input = {
        'Sigla ICAO Aeroporto Origem': req.query.origin,
        'Sigla ICAO Aeroporto Destino': req.query.destination,
        'Dia da Semana': dateDatails['Dia da Semana'],
        'LATITUDE_ORIGEM': originData.latitude,
        'LONGITUDE_ORIGEM': originData.longitude,
        'LATITUDE_DESTINO': destinationData.latitude,
        'LONGITUDE_DESTINO': destinationData.longitude,
        'temp_origem': weatherDataOrigin.data[0].temp,
        'temp_destino': weatherDataDestination.data[0].temp,
        'pressure_origem': weatherDataOrigin.data[0].pressure,
        'pressure_destino': weatherDataDestination.data[0].pressure,
        'humidity_origem': weatherDataOrigin.data[0].humidity,
        'humidity_destino': weatherDataDestination.data[0].humidity,
        'clouds_origem': weatherDataOrigin.data[0].clouds,
        'clouds_destino': weatherDataDestination.data[0].clouds,
        'Tempo esperado de voo': estimedFlightTime,
        'Final de Semana': dateDatails['Final de Semana'],
        'Feriado': dateDatails['Feriado'],
    };

    return input;
};

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

(async () => {
    await loadAirportsData();
    console.log("Airports data loaded!");
    await loadFlightsData();
    console.log("Flights data loaded!");
})();