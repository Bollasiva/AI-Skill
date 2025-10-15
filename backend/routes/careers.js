const express = require('express');
const router = express.Router();
const careerPaths = require('../data/careerPaths');

router.get('/', (req, res) => {
  try {
    const careerNames = Object.keys(careerPaths);
    res.json(careerNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;