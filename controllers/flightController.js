const flightService = require('../services/flightService');

exports.analyzeFlight = async (req, res) => {
  try {
    if (!req.query.origin || !req.query.destination || !req.query.datetime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: origin, destination, datetime.',
      });
    }

    const analysisResult = await flightService.getFlightAnalysis(req.query);

    res.status(200).json({
      success: true,
      message: 'Flight analysis completed successfully.',
      data: analysisResult,
    });
  } catch (error) {
    if(error == "Error: Origin or destination airport not found."){
      res.status(404).json({
        success: false,
        message: 'Origin or destination airport not found.',
      });
    }else{
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during the flight analysis.',
      });
    }
  }
};