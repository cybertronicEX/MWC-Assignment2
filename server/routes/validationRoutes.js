const express = require('express');
const router = express.Router();
const { validateContent, getFeedback } = require('../controllers/validationController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/:contentId/validate',
    /* 
        #swagger.tags = ['Validation']
        #swagger.summary = 'Validate Content'
    */
    validateContent
);
router.get('/:contentId/feedback',
    /* 
        #swagger.tags = ['Validation']
        #swagger.summary = 'Get Validation Feedback'
    */
    getFeedback
);

module.exports = router;
