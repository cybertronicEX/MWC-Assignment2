const { db } = require('../config/firebase');

const COLLECTION_NAME = 'auditLogs';

/**
 * Log an action to the audit trail
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action name (e.g., 'LOGIN', 'CREATE_CONTENT', 'APPROVE_CONTENT')
 * @param {string} resourceId - ID of the affected resource (optional)
 * @param {object} details - Additional metadata (optional)
 * @param {string} ipAddress - IP address of the user (optional)
 */
const logAudit = async (userId, action, resourceId = null, details = {}, ipAddress = null) => {
    try {
        await db.collection(COLLECTION_NAME).add({
            userId,
            action,
            resourceId,
            details,
            ipAddress,
            timestamp: new Date().toISOString()
        });
        console.log(`[Audit] ${action} by ${userId}`);
    } catch (error) {
        console.error('Failed to log audit event:', error);
        // We generally don't want to crash the request if auditing fails, so we just log the error.
    }
};

/**
 * Get audit logs with pagination and filtering
 */
const getAuditLogs = async (limit = 50, page = 1) => {
    try {
        const offset = (page - 1) * limit;
        const snapshot = await db.collection(COLLECTION_NAME)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .offset(offset)
            .get();

        const logs = [];
        snapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });

        // Get total count (for pagination)
        const countSnapshot = await db.collection(COLLECTION_NAME).count().get();
        const total = countSnapshot.data().count;

        return {
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
    }
};

module.exports = {
    logAudit,
    getAuditLogs
};
