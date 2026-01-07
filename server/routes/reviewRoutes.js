const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to params from parent route
const verifyToken = require('../middleware/authMiddleware');
const { addReview, getReviews } = require('../controllers/reviewController');
const { db } = require('../config/firebase');

// RBAC Middleware
const isPrivileged = async (req, res, next) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists) return res.status(403).json({ message: 'User not found' });

        const role = userDoc.data().role;
        if (['admin', 'governance', 'champion'].includes(role)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Privileged roles only.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying privileges' });
    }
};

router.use(verifyToken);

router.post('/',
    /* 
        #swagger.tags = ['Reviews']
        #swagger.summary = 'Add a Review (Admin/Governance/Champion)'
    */
    isPrivileged,
    addReview
);

router.get('/',
    /* 
        #swagger.tags = ['Reviews']
        #swagger.summary = 'Get Reviews for Content'
    */
    getReviews
);

module.exports = router;
