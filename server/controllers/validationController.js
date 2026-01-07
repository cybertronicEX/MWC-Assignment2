const { db } = require('../config/firebase');
const auditService = require('../services/auditService');

const CONTENT_COLLECTION = 'knowledgeContent';
const FEEDBACK_COLLECTION = 'feedback';

// @desc    Validate content (Approve or Reject)
// @route   POST /api/validation/:contentId/validate
// @access  Private (Knowledge Champion)
const validateContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const { status, notes } = req.body; // status: 'Approved' | 'NeedsRevision'
        const { uid } = req.user;

        // TODO: Verify user is a Knowledge Champion (RBAC)
        // For now, we assume anyone with a token can hit this if they know the ID, 
        // but in production, we'd check req.user.role

        if (!['Approved', 'NeedsRevision', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const docRef = db.collection(CONTENT_COLLECTION).doc(contentId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Content not found' });
        }

        await docRef.update({
            status,
            lastValidatedBy: uid,
            lastValidatedAt: new Date().toISOString()
        });

        // If notes provided or rejected, create feedback
        if (notes || status === 'NeedsRevision' || status === 'Rejected') {
            await db.collection(FEEDBACK_COLLECTION).add({
                contentId,
                reviewerId: uid,
                status,
                notes,
                createdAt: new Date().toISOString()
            });
        }

        res.status(200).json({ message: `Content marked as ${status}`, contentId });

        // Audit Log
        await auditService.logAudit(uid, 'VALIDATE_CONTENT', contentId, { status, notes }, req.ip);

    } catch (error) {
        console.error('Error validating content:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get feedback for content
// @route   GET /api/validation/:contentId/feedback
// @access  Private
const getFeedback = async (req, res) => {
    try {
        const { contentId } = req.params;
        const snapshot = await db.collection(FEEDBACK_COLLECTION)
            .where('contentId', '==', contentId)
            .orderBy('createdAt', 'desc')
            .get();

        const feedback = [];
        snapshot.forEach(doc => feedback.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(feedback);
    } catch (error) {
        console.error('Error getting feedback:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    validateContent,
    getFeedback
};
