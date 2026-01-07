const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/recommendationController');

router.use(verifyToken);

router.get('/',
    /* 
        #swagger.tags = ['Recommendations']
        #swagger.summary = 'Get Content Recommendations'
    */
    getRecommendations
);

module.exports = router;
