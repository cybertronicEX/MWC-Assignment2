const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getLogs, performContentAudit, getContentAuditHistory } = require('../controllers/auditController');
const { db } = require('../config/firebase');

// RBAC Middleware for Governance/Admin
const isGovernanceOrAdmin = async (req, res, next) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists) return res.status(403).json({ message: 'User not found' });

        const role = userDoc.data().role;
        if (role === 'admin' || role === 'governance') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Governance or Admin only.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying privileges' });
    }
};

router.use(verifyToken);

router.get('/',
    /* 
        #swagger.tags = ['Audit']
        #swagger.summary = 'Get Audit Logs (Admin/Governance)'
    */
    isGovernanceOrAdmin,
    getLogs
);

// RBAC Middleware for Privileged Roles (Admin, Governance, Champion)
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

router.get('/',
    /* 
        #swagger.tags = ['Audit']
        #swagger.summary = 'Get System Audit Logs (Admin/Governance)'
    */
    isGovernanceOrAdmin,
    getLogs
);

router.post('/content',
    /* 
        #swagger.tags = ['Audit']
        #swagger.summary = 'Perform Content Audit (Manual Review)'
    */
    isPrivileged,
    performContentAudit
);

router.get('/content/:contentId',
    /* 
        #swagger.tags = ['Audit']
        #swagger.summary = 'Get Content Audit History'
    */
    verifyToken, // Maybe unrestricted read? Keeping it authenticated for now.
    getContentAuditHistory
);

module.exports = router;
