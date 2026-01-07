import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                setToken(idToken);
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const response = await axios.get(`${apiUrl}/users/me`, {
                        headers: { Authorization: `Bearer ${idToken}` }
                    });

                    const profile = response.data;
                    const userData = { ...currentUser, role: profile.role || 'consultant' };
                    setUser(userData);
                } catch (error) {
                    console.error("Error fetching user profile from API:", error);
                    setUser({ ...currentUser, role: 'consultant' });
                }
            } else {
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const value = {
        user,
        token,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
