const { getAirportsData } = require('../loaders/dataLoaders');

exports.getAirports = async (req, res) => {
    const airportsData = getAirportsData();
    try {
        if (!airportsData || airportsData.length === 0) {
            return res.status(500).send('Os aeródromos não foram carregados ainda.');
        }
        res.json(airportsData);
    } catch (error) {
        res.status(500).send('Erro ao carregar os aeródromos');
    }
};