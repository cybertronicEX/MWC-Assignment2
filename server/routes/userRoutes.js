const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getAllUsers, updateUserRole, createUser, getUserProfile } = require('../controllers/userController');

// Middleware to check if user is admin (Basic implementation, relies on client sending role or checking Firestore)
// Ideally, we'd check the requester's role in Firestore here.
const isAdmin = async (req, res, next) => {
    // req.user is set by verifyToken
    // We need to fetch the user's role from Firestore to be secure
    const { db } = require('../config/firebase');

    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verifying admin privileges' });
    }
};

router.use(verifyToken);
router.get('/me',
    /* 
        #swagger.tags = ['Users']
        #swagger.summary = 'Get Current User Profile'
    */
    getUserProfile
);
router.get('/',
    /* 
        #swagger.tags = ['Users']
        #swagger.summary = 'Get All Users (Admin)'
    */
    isAdmin,
    getAllUsers
);
router.post('/',
    /* 
        #swagger.tags = ['Users']
        #swagger.summary = 'Create New User (Admin)'
    */
    isAdmin,
    createUser
);
router.put('/:id/role',
    /* 
        #swagger.tags = ['Users']
        #swagger.summary = 'Update User Role (Admin)'
    */
    isAdmin,
    updateUserRole
);

module.exports = router;
