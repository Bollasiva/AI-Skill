const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMarketRecommendations, getCollaborativeRecommendations } = require('../controllers/recommendationController');

router.post('/market', auth, getMarketRecommendations);
router.get('/collaborative', auth, getCollaborativeRecommendations);

module.exports = router;