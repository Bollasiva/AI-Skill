const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Trend = require('../models/Trend');

router.get('/', auth, async (req, res) => {
  try {
    const trends = await Trend.findById('skill_trends_advanced');
    if (!trends) {
      return res.status(404).json({ msg: 'Trend data not found.' });
    }
    res.json(trends.skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;