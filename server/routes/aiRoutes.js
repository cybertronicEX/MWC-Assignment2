const express = require('express');
const router = express.Router();
const { generateMetadata } = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/generate-metadata',
    /* 
        #swagger.tags = ['AI']
        #swagger.summary = 'Generate Metadata (Tags & Summary)'
    */
    verifyToken,
    generateMetadata
);

module.exports = router;
