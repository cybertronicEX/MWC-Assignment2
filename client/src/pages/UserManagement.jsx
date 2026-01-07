import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';

const UserManagement = () => {
    const { user, token } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'consultant', name: '', region: 'APAC', expertise: '' });
    const [createLoading, setCreateLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5;

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        if (token) fetchUsers(currentPage);
    }, [token, currentPage]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit: itemsPerPage }
            });
            setUsers(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Failed to load users. Ensure you have Admin privileges.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.put(
                `${apiUrl}/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(users.map(u =>
                u.id === userId || u.uid === userId ? { ...u, role: newRole } : u
            ));
            showToast('User role updated successfully', 'success');
        } catch (err) {
            console.error("Failed to update role", err);
            showToast("Failed to update user role", 'error');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(
                `${apiUrl}/users`,
                newUser,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showToast('User created successfully!', 'success');
            setIsCreateModalOpen(false);
            setNewUser({ email: '', password: '', role: 'consultant' });
            fetchUsers(currentPage); // Refresh list
        } catch (err) {
            console.error("Failed to create user", err);
            showToast(err.response?.data?.message || "Failed to create user.", 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) return <Layout><Loading fullScreen /></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>

                    <div className="flex items-center gap-4">
                        <Badge variant="primary">{users.length} Users</Badge>
                        <Button onClick={() => setIsCreateModalOpen(true)}>+ Create User</Button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.id || u.uid} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {u.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900">{u.email}</span>
                                                    <span className="text-xs text-slate-500">ID: {(u.id || u.uid).substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                u.role === 'admin' ? 'error' :
                                                    u.role === 'champion' ? 'warning' : 'info'
                                            }>
                                                {u.role || 'consultant'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="text-sm border-slate-200 rounded-md p-1 bg-white focus:ring-primary focus:border-primary"
                                                value={u.role || 'consultant'}
                                                onChange={(e) => handleRoleChange(u.id || u.uid, e.target.value)}
                                                disabled={user.uid === (u.id || u.uid)}
                                            >
                                                <option value="consultant">Consultant</option>
                                                <option value="champion">Champion</option>
                                                <option value="governance">Governance</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 px-2">
                        <div className="text-sm text-slate-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm"
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === i + 1
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="John Doe"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Region</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white"
                                        value={newUser.region}
                                        onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
                                    >
                                        <option value="APAC">APAC</option>
                                        <option value="EMEA">EMEA</option>
                                        <option value="NA">NA</option>
                                        <option value="LATAM">LATAM</option>
                                    </select>
                                </div>
                                <Input
                                    label="Expertise"
                                    value={newUser.expertise}
                                    onChange={(e) => setNewUser({ ...newUser, expertise: e.target.value })}
                                    placeholder="e.g. Legal, Tech"
                                />
                            </div>

                            <Input
                                label="Email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                                minLength={6}
                            />
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="consultant">Consultant</option>
                                    <option value="champion">Champion</option>
                                    <option value="governance">Governance</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createLoading}>
                                    {createLoading ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </Layout>
    );
};

export default UserManagement;
