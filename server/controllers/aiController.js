const { generateMetadata } = require('../services/aiService');

// @desc    Generate AI metadata (tags, summary)
// @route   POST /api/ai/generate-metadata
// @access  Private
const generateMetadataHandler = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description required' });
        }

        const metadata = await generateMetadata(title, description);
        res.status(200).json(metadata);
    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({ message: 'Error generating metadata' });
    }
};

module.exports = {
    generateMetadata: generateMetadataHandler
};
