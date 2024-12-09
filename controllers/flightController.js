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
    console.error('Error in analyzeFlight controller:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during the flight analysis.',
    });
  }
};