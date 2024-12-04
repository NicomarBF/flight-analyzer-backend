const request = require('supertest');
const { app, initializeData } = require('../app');
const path = require('path');

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

beforeAll(async () => {
    await initializeData();
});

jest.mock('../app', () => ({
    ...jest.requireActual('../app'),
    // getLatLonByICAO: jest.fn().mockReturnValue({ latitude: -23.435556, longitude: -46.473056 }),
    getWeatherData: jest.fn().mockResolvedValue({ temp: 25, pressure: 1013, humidity: 70, clouds: 20 }),
    // getFlightTime: jest.fn().mockResolvedValue(60)
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
            datetime: '05/12/2024 00:00:00'
        });
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
    });
});

afterAll(() => {
    jest.clearAllTimers();
});