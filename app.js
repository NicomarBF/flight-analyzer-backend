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
    console.log(req.query);
    const originData = getLatLonByICAO(req.query.origin);
    const destinationData = getLatLonByICAO(req.query.destination);
    const dt = moment(req.query.datetime, 'DD/MM/YYYY HH:mm:ss').unix();

    const [weatherDataOrigin, weatherDataDestination] = await Promise.all([
        getWeatherData(originData.latitude, originData.longitude, dt, API_KEY),
        getWeatherData(destinationData.latitude, destinationData.longitude, dt, API_KEY),
    ]);

    const dateDatails = getDateDetails(dt);

    const estimedFlightTime = getFlightTime(req.query.origin, req.query.destination);

    console.log(flightsData)

    console.log("Origem:", originData);
    console.log("Destino:", destinationData);
    console.log("Data e Hora:", dt);
    // console.log(weatherDataOrigin)
    // console.log(weatherDataDestination)
    console.log(dateDatails)
    console.log(estimedFlightTime)

    res.json({
        "company": "Voeazul"
    })
})

// Rota principal para predição
app.post('/predict', (req, res) => {
    console.log("Dados recebidos:", req.body);

    // Converter os dados do request para uma string JSON
    const input = JSON.stringify(req.body);

    // Executar o script Python com `spawn`
    const python = spawn('python', ['predict_models.py', input]);

    let output = '';
    let errorOutput = '';

    // Coletar saída do script Python
    python.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Coletar erros do script Python
    python.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Quando o processo Python termina
    python.on('close', (code) => {
        console.log(`Processo Python finalizado com código: ${code}`);
        if (code !== 0) {
            console.error("Erro ao executar o script Python:", errorOutput);
            res.status(500).send("Erro ao processar a predição.");
            return;
        }

        try {
            const result = JSON.parse(output);
            console.log("Resultados do modelo:", result);
            res.json(result);
        } catch (error) {
            console.error("Erro ao processar a resposta do modelo:", error);
            res.status(500).send("Erro ao processar a resposta do modelo.");
        }
    });
});

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
    const date = moment.unix(unixDate).toDate(); // Converter para formato de data
    const hd = new Holidays('BR'); // Configura para o Brasil (substitua conforme necessário)

    const holiday = hd.isHoliday(date);
    const isHoliday = holiday ? 1 : 0;

    const isWeekend = (date.getDay() === 0 || date.getDay() === 6) ? 1 : 0;

    const dayOfWeek = moment(date).format('dddd'); // Ex.: 'Monday'

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
            return parseInt(flight['Tempo esperado de voo'], 10); // Retornar o tempo esperado de voo
        } else {
            throw new Error('Voo não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao obter o tempo esperado de voo:', error);
        throw error;
    }
}

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

(async () => {
    await loadAirportsData();
    console.log("Airports data loaded!");
    await loadFlightsData();
    console.log("Flights data loaded!");
})();