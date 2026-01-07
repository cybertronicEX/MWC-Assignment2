const { db } = require('../config/firebase');
const auditService = require('../services/auditService');

const CONTENT_COLLECTION = 'knowledgeContent';
const REVIEWS_COLLECTION = 'reviews';

// @desc    Add a review to content
// @route   POST /api/content/:id/reviews
// @access  Privileged (Admin, Governance, Champion)
const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const { uid } = req.user;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const contentRef = db.collection(CONTENT_COLLECTION).doc(id);
        const contentDoc = await contentRef.get();

        if (!contentDoc.exists) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Create review in sub-collection or separate collection linked by ID
        // Using root collection linked by contentId for easier querying across content if needed
        const reviewData = {
            contentId: id,
            reviewerId: uid,
            rating,
            comment: comment || '',
            createdAt: new Date().toISOString()
        };

        await db.collection(REVIEWS_COLLECTION).add(reviewData);

        // Optional: Update average rating on content doc
        // For simplicity, not recalculating average on every write here, but could be done.

        res.status(201).json({ message: 'Review added successfully', review: reviewData });

        // Audit this action
        await auditService.logAudit(uid, 'ADD_REVIEW', id, { rating }, req.ip);

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews for content
// @route   GET /api/content/:id/reviews
// @access  Public/Private
const getReviews = async (req, res) => {
    try {
        const { id } = req.params;

        const snapshot = await db.collection(REVIEWS_COLLECTION)
            .where('contentId', '==', id)
            .orderBy('createdAt', 'desc')
            .get();

        const reviews = [];
        snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addReview,
    getReviews
};
