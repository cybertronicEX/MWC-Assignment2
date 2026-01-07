const axios = require('axios');
const { db } = require('../config/firebase');
const auditService = require('../services/auditService');

// @desc    Login user (Backend Auth)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 1. Authenticate with Firebase REST API (Exchange password for Token)
        // Note: Needs FIREBASE_WEB_API_KEY in .env
        const apiKey = process.env.FIREBASE_WEB_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
        }

        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

        const response = await axios.post(authUrl, {
            email,
            password,
            returnSecureToken: true
        });

        const { idToken, localId, email: userEmail } = response.data;

        // 2. Fetch User Role from Firestore
        const userDoc = await db.collection('users').doc(localId).get();
        let role = 'consultant'; // Default

        if (userDoc.exists) {
            role = userDoc.data().role || 'consultant';
        } else {
            // Optional: Create profile if missing (Sync)
            await db.collection('users').doc(localId).set({
                email: userEmail,
                role: 'consultant',
                createdAt: new Date().toISOString()
            });
        }

        // 3. Return Token and User Data
        res.status(200).json({
            token: idToken,
            user: {
                uid: localId,
                email: userEmail,
                role
            }
        });

        // Audit Log
        await auditService.logAudit(localId, 'LOGIN', null, { email: userEmail, role }, req.ip);

    } catch (error) {
        console.error('Login Error:', error.response?.data?.error?.message || error.message);

        let message = 'Invalid credentials';
        if (error.response?.data?.error?.message === 'EMAIL_NOT_FOUND') message = 'User not found';
        if (error.response?.data?.error?.message === 'INVALID_PASSWORD') message = 'Invalid password';
        if (error.response?.data?.error?.message === 'USER_DISABLED') message = 'User account is disabled';

        res.status(401).json({ message });
    }
};

module.exports = { login };
