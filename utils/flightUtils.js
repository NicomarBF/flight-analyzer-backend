const { getAirportsData, getFlightsData } = require('../loaders/dataLoaders');
const moment = require('moment');
const Holidays = require('date-holidays');

exports.getLatLonByICAO = (icaoCode) => {
    const airportsData = getAirportsData();
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
};

exports.getDateDetails = (unixDate) => {
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

exports.getFlightTime = (originCode, destinationCode) => {
    const flightsData = getFlightsData();
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

exports.generateInputForAirCompanyRecomendationModel = (query, originData, destinationData, weatherDataOrigin, weatherDataDestination, dateDatails, estimedFlightTime) => {
    const input = {
        'Sigla ICAO Aeroporto Origem': query.origin,
        'Sigla ICAO Aeroporto Destino': query.destination,
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
}