const { db } = require('../config/firebase');

// @desc    Get content recommendations for user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.uid;

        // 1. Get User Profile for preferences
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const userData = userDoc.data();
        const userExpertise = userData.expertise ? userData.expertise.toLowerCase().split(',').map(e => e.trim()) : [];
        const userRegion = userData.region; // Potential future filter

        // 2. Fetch all approved content (Optimize this with Algolia or similar in production)
        // For now, fetching all and filtering in memory as dataset is expected to be small for this assignment
        const contentRef = db.collection('knowledgeContent');
        const snapshot = await contentRef.where('status', '==', 'Approved').get();

        let allContent = [];
        snapshot.forEach(doc => {
            allContent.push({ id: doc.id, ...doc.data() });
        });

        // 3. Scoring Algorithm
        const scoredContent = allContent.map(item => {
            let score = 0;

            // Tag Matching
            if (item.tags && Array.isArray(item.tags)) {
                // Check if any tag matches user expertise
                const matches = item.tags.filter(tag =>
                    userExpertise.some(exp => tag.toLowerCase().includes(exp) || exp.includes(tag.toLowerCase()))
                );
                score += matches.length * 5; // 5 points per matched tag
            }

            // Recency Boost
            const daysSinceCreation = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceCreation < 7) score += 3; // Boost new content

            // Popularity (Review Count/Rating - if available)
            // if (item.averageRating) score += item.averageRating * 2;

            return { ...item, score };
        });

        // 4. Sort and Limit
        // Filter out content with 0 score unless we want to show generic "New" items
        // Let's return top 5 scored, falling back to 'Newest' if no scores
        scoredContent.sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt));

        const recommendations = scoredContent.slice(0, 5);

        res.status(200).json(recommendations);

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getRecommendations
};
