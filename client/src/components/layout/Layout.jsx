import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="pt-20 lg:pl-64 p-6 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
