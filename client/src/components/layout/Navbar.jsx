import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="bg-surface/80 backdrop-blur-md border-b border-slate-200/60 h-16 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-6 transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <Link to="/" className="text-xl font-bold text-primary-dark tracking-tight">
                    Velion<span className="text-slate-800">DKN</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-semibold text-slate-700 leading-none">{user.email?.split('@')[0]}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role || 'User'}</span>
                        </div>
                        <Button variant="ghost" onClick={handleLogout} className="text-sm px-3 py-1 text-slate-500 hover:text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </Button>
                    </div>
                ) : (
                    <Link to="/login">
                        <Button variant="primary" className="text-sm">Login</Button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
