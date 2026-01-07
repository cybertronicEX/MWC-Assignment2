import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [navItems, setNavItems] = useState([]);

    useEffect(() => {
        const baseItems = [
            { name: 'Dashboard', path: '/', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { name: 'Repository', path: '/repository', icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' },
        ];

        if (user) {
            // Consultant specific (or everyone)
            baseItems.push({ name: 'Upload Content', path: '/upload', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' });

            // Champion / Admin / Governance
            if (['champion', 'admin', 'governance'].includes(user.role)) {
                baseItems.push({ name: 'Validation Queue', path: '/validation', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' });
            }

            // Governance / Admin
            if (['governance', 'admin'].includes(user.role)) {
                baseItems.push({ name: 'Governance', path: '/audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' });
            }

            // Admin Only
            if (user.role === 'admin') {
                baseItems.push({ name: 'User Management', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' });
            }
        }

        setNavItems(baseItems);
    }, [user]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-surface border-r border-slate-200 z-20 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && onClose()}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-primary/10 text-primary-dark font-medium shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.name}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
