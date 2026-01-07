const { db } = require('../config/firebase');
const auditService = require('../services/auditService');

const CONTENT_AUDIT_COLLECTION = 'contentAudits';

// @desc    Get all audit logs (System)
// @route   GET /api/audit
// @access  Admin/Governance
const getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await auditService.getAuditLogs(limit, page);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};

// @desc    Perform Content Audit (Manual Review)
// @route   POST /api/audit/content
// @access  Admin/Governance/Champion
const performContentAudit = async (req, res) => {
    try {
        const { contentId, status, issues, recommendations } = req.body;
        const { uid } = req.user;

        if (!contentId || !status) {
            return res.status(400).json({ message: 'Content ID and Status are required' });
        }

        const auditRecord = {
            contentId,
            auditorId: uid,
            status, // 'Compliant', 'Non-Compliant', 'Flagged'
            issues: issues || '',
            recommendations: recommendations || '',
            timestamp: new Date().toISOString()
        };

        await db.collection(CONTENT_AUDIT_COLLECTION).add(auditRecord);

        // Optional: Update content metadata to reflect last audited date
        await db.collection('knowledgeContent').doc(contentId).update({
            lastAuditedAt: new Date().toISOString(),
            auditStatus: status
        });

        res.status(201).json({ message: 'Audit recorded successfully', auditRecord });
    } catch (error) {
        console.error('Error performing content audit:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Audit History for specific content
// @route   GET /api/audit/content/:contentId
// @access  Private
const getContentAuditHistory = async (req, res) => {
    try {
        const { contentId } = req.params;

        const snapshot = await db.collection(CONTENT_AUDIT_COLLECTION)
            .where('contentId', '==', contentId)
            .orderBy('timestamp', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching audit history:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getLogs,
    performContentAudit,
    getContentAuditHistory
};
