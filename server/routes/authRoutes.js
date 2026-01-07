const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login',
    /* 
        #swagger.tags = ['Auth'] 
        #swagger.summary = 'User Login'
    */
    login
);

module.exports = router;
