const request = require('supertest');
const app = require('../app');
const { initializeData } = require('../loaders/dataLoaders');
const { getWeatherData } = require('../services/weatherDataService');
const { getFlightTime, getLatLonByICAO, getDateDetails } = require('../utils/flightUtils');

jest.spyOn(console, 'error').mockImplementation(() => {});

jest.spyOn(console, 'log').mockImplementation((message) => {
    process.stdout.write(message + '\n');
});

beforeAll(async () => {
    await initializeData();
});

jest.mock('../services/weatherDataService', () => ({
    ...jest.requireActual('../services/weatherDataService'),
    getWeatherData: jest.fn().mockResolvedValue({ data: [{ temp: 25, pressure: 1013, humidity: 70, clouds: 20 }]}),
}));

describe('GET /api/analysis', () => {
    it('deve retornar erro 400 se parâmetros obrigatórios estiverem ausentes', async () => {
        const res = await request(app).get('/api/analysis');
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            success: false,
            message: 'Missing required parameters: origin, destination, datetime.'
        });
    });

    it('deve retornar erro 404 se o aeroporto não for encontrado', async () => {
        const res = await request(app).get('/api/analysis').query({
            origin: 'XXXX',
            destination: 'YYYY',
            datetime: '05/12/2024 00:00:00'
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            success: false,
            message: 'Origin or destination airport not found.'
        });
    });

    it('deve retornar sucesso com dados válidos', async () => {
        const res = await request(app).get('/api/analysis').query({
            origin: 'SBGR',
            destination: 'SBGL',
            datetime: '05/12/2024 12:00:00'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('flight_delay');
        expect(res.body.data).toHaveProperty('probability_of_outcome');
        expect(res.body.data).toHaveProperty('estimated_flight_time');
        expect(res.body.data).toHaveProperty('air_company');
        expect(res.body.data).toHaveProperty('normal_flight_time');
    });
});

afterAll(() => {
    jest.clearAllTimers();
});
