const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    createContent,
    getContent,
    getContentById,
    updateContent
} = require('../controllers/contentController');

// Mount Review Routes
// Matches /api/content/:id/reviews
router.use('/:id/reviews', require('./reviewRoutes'));

router.use(verifyToken);
router.post('/',
    upload.single('file'),
    /* 
        #swagger.tags = ['Content']
        #swagger.summary = 'Create New Content'
        #swagger.consumes = ['multipart/form-data']
        #swagger.parameters['file'] = {
            in: 'formData',
            type: 'file',
            required: 'true',
            description: 'PDF file to upload'
        }
        #swagger.parameters['title'] = { in: 'formData', type: 'string' }
        #swagger.parameters['description'] = { in: 'formData', type: 'string' }
        #swagger.parameters['tags'] = { in: 'formData', type: 'string' }
    */
    createContent
);
router.get('/',
    /* 
        #swagger.tags = ['Content']
        #swagger.summary = 'Get All Content'
    */
    getContent
);
router.get('/:id',
    /* 
        #swagger.tags = ['Content']
        #swagger.summary = 'Get Content by ID'
    */
    getContentById
);
router.put('/:id',
    /* 
        #swagger.tags = ['Content']
        #swagger.summary = 'Update Content'
    */
    updateContent
);

module.exports = router;
