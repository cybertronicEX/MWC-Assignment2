import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UploadContent from './pages/UploadContent';
import Repository from './pages/Repository';
import ValidationQueue from './pages/ValidationQueue';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/upload" element={
                            <ProtectedRoute>
                                <UploadContent />
                            </ProtectedRoute>
                        } />
                        <Route path="/repository" element={
                            <ProtectedRoute>
                                <Repository />
                            </ProtectedRoute>
                        } />
                        <Route path="/validation" element={
                            <ProtectedRoute>
                                <ValidationQueue />
                            </ProtectedRoute>
                        } />
                        <Route path="/audit" element={
                            <ProtectedRoute>
                                <AuditLogs />
                            </ProtectedRoute>
                        } />
                        <Route path="/users" element={
                            <ProtectedRoute>
                                <UserManagement />
                            </ProtectedRoute>
                        } />
                        {/* Add more routes here */}
                    </Routes>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
