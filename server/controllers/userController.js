const { db, auth } = require('../config/firebase');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const usersRef = db.collection('users');
        const snapshot = await usersRef.offset(offset).limit(limit).get();
        const totalSnapshot = await usersRef.count().get();
        const total = totalSnapshot.data().count;

        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        const validRoles = ['admin', 'consultant', 'champion', 'governance'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Update Firestore
        await db.collection('users').doc(id).update({ role });

        // Optional: Set Custom User Claims if using that for security rules
        // await auth.setCustomUserClaims(id, { role });

        res.status(200).json({ message: `User role updated to ${role}` });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Failed to update user role' });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const { uid } = req.user;
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            // Auto-create if missing (sync issue)
            const newProfile = {
                email: req.user.email,
                role: 'consultant',
                createdAt: new Date().toISOString()
            };
            await db.collection('users').doc(uid).set(newProfile);
            return res.status(200).json({ id: uid, ...newProfile });
        }

        res.status(200).json({ id: uid, ...userDoc.data() });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
};

// @desc Sync user on login (create if not exists)
const syncUser = async (userRecord) => {
    const userRef = db.collection('users').doc(userRecord.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
        await userRef.set({
            email: userRecord.email,
            role: 'consultant', // Default role
            createdAt: new Date().toISOString()
        });
    }
};

// @desc    Create new user (Auth + Firestore)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
    try {
        const { email, password, role, name, region, expertise } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Email, password, and role are required' });
        }

        const validRoles = ['admin', 'consultant', 'champion', 'governance'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // 1. Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: name || '',
        });

        // 2. Create user document in Firestore with Role and new fields
        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            role: role,
            name: name || '',
            region: region || '',
            expertise: expertise || '',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            message: 'User created successfully',
            user: { uid: userRecord.uid, email: userRecord.email, role, name, region, expertise }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: error.message || 'Failed to create user' });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    syncUser,
    createUser,
    getUserProfile
};
