const { db, bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid'); // You might need to install uuid or just use Date.now
const auditService = require('../services/auditService');

const COLLECTION_NAME = 'knowledgeContent';

// @desc    Create new knowledge content
// @route   POST /api/content
// @access  Private (Consultant)
const createContent = async (req, res) => {
    try {
        // req.user is populated by verifyToken middleware
        const { uid } = req.user;
        const { title, description, tags } = req.body;

        let fileUrl = req.body.fileUrl; // Fallback for manual URL if no file uploaded

        if (req.file) {
            // Upload to Firebase Storage
            const filename = `content/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(filename);

            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype },
                public: true, // Make public
            });

            // Get public URL
            // Option 1: Signed URL (expires)
            // Option 2: Public URL (persistent if made public)
            // We used public: true above, so we can construct the URL
            // Format: https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
            fileUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

            // Alternatively, for Firebase Client SDK compatibility, u might want the download token format, 
            // but for backend admin upload, the public link is standard for public assets.
        }

        if (!req.file || !title || !description) {
            return res.status(400).json({ message: 'File, title, and description are required' });
        }

        // Check for duplicates (by title)
        const duplicateCheck = await db.collection('knowledgeContent')
            .where('title', '==', title)
            .where('status', 'in', ['Approved', 'Pending']) // Check against active content
            .get();

        if (!duplicateCheck.empty) {
            return res.status(409).json({ message: 'Content with this title already exists.' });
        }

        const newContent = {
            title,
            description,
            fileUrl,
            authorId: uid,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            status: 'Pending',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            aiMetadata: null, // Will be populated by AI service
        };

        const docRef = await db.collection(COLLECTION_NAME).add(newContent);
        const savedContent = await docRef.get();

        res.status(201).json({ id: docRef.id, ...savedContent.data() });

        // Audit Log
        await auditService.logAudit(uid, 'CREATE_CONTENT', docRef.id, { title, status: 'Pending' }, req.ip);

    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all content (with filters)
// @route   GET /api/content
// @access  Private
const getContent = async (req, res) => {
    try {
        const { status, authorId, auditStatus } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let query = db.collection(COLLECTION_NAME);

        if (status) query = query.where('status', '==', status);
        if (authorId) query = query.where('authorId', '==', authorId);
        if (auditStatus) query = query.where('auditStatus', '==', auditStatus);

        // Default sort by newest
        query = query.orderBy('createdAt', 'desc');

        // Get total count for pagination (requires a separate count query with same filters)
        // Note: Firestore count() is efficient.
        const countSnapshot = await query.count().get();
        const total = countSnapshot.data().count;

        // Apply pagination
        // Note: In Firestore, using offset with large collections can be expensive, 
        // but for this assignment it's standard practice.
        const snapshot = await query.offset(offset).limit(limit).get();

        if (snapshot.empty) {
            return res.status(200).json({
                data: [],
                pagination: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0
                }
            });
        }

        const contentList = [];
        snapshot.forEach(doc => {
            contentList.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({
            data: contentList,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single content by ID
// @route   GET /api/content/:id
// @access  Private
const getContentById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching content by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private (Author only)
const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const updates = req.body;

        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Content not found' });
        }

        const contentData = doc.data();

        // Check ownership
        // Note: In real app, Admin/Champion might also be allowed to update specific fields
        if (contentData.authorId !== uid) {
            return res.status(403).json({ message: 'Not authorized to update this content' });
        }

        // Increment version if significant changes (simplified logic)
        const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString(),
            version: contentData.version + 1,
            status: 'Pending' // Reset to pending on update for re-validation
        };

        await docRef.update(updatedData);

        res.status(200).json({ id, ...contentData, ...updatedData });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createContent,
    getContent,
    getContentById,
    updateContent
};
