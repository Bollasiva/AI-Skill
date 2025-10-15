const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Trend = require('../models/Trend');
const Forecast = require('../models/Forecast');

router.get('/trends', auth, async (req, res) => {
  try {
    const [trendsData, forecastsData] = await Promise.all([
      Trend.findById('skill_historical_trends'),
      Forecast.findById('skill_forecasts')
    ]);
    
    if (!trendsData || !forecastsData) {
      return res.status(404).json({ msg: 'Dashboard data not found.' });
    }

    const combinedData = trendsData.trends.map(trend => {
      const forecast = forecastsData.forecasts.find(f => f.skill === trend.skill);
      return {
        skill: trend.skill,
        history: trend.history,
        forecast: forecast ? forecast.forecast : []
      };
    });

    res.json(combinedData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;