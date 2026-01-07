import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/common/Card';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                if (!token) return;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/recommendations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecommendations(response.data);
            } catch (error) {
                console.error('Failed to fetch recommendations', error);
            } finally {
                setRecLoading(false);
            }
        };

        fetchRecommendations();
    }, [token]);

    const [stats, setStats] = useState([
        { label: 'Pending Validations', value: '0', color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'My Contributions', value: '0', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Approved Content', value: '0', color: 'text-green-600', bg: 'bg-green-50' },
    ]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                // Parallel requests for stats
                const [pendingRes, myRes, approvedRes, recentRes] = await Promise.all([
                    axios.get(`${apiUrl}/content?status=Pending&limit=1`, config),
                    axios.get(`${apiUrl}/content?authorId=${user.uid}&limit=1`, config),
                    axios.get(`${apiUrl}/content?status=Approved&limit=1`, config),
                    axios.get(`${apiUrl}/content?limit=3`, config)
                ]);

                setStats([
                    { label: 'Pending Validations', value: pendingRes.data.pagination.total, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'My Contributions', value: myRes.data.pagination.total, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Approved Content', value: approvedRes.data.pagination.total, color: 'text-green-600', bg: 'bg-green-50' },
                ]);

                setRecentActivity(recentRes.data.data);

            } catch (err) {
                console.error("Error fetching dashboard data", err);
            }
        };
        fetchDashboardData();
    }, [token, user.uid]);

    // Combined useEffect for cleaner code? Recommendation one is separate. That's fine.

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Welcome back,</h1>
                <p className="text-slate-600">{user?.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recommendations Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Recommended for You</h2>
                {recLoading ? (
                    <div className="animate-pulse flex gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-slate-200 rounded-xl flex-1"></div>
                        ))}
                    </div>
                ) : recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map((item) => (
                            <Card key={item.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer border border-slate-100 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600">
                                        {item.status || 'Content'}
                                    </span>
                                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2 truncate" title={item.title}>{item.title}</h3>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{item.description}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {item.tags?.slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{tag}</span>
                                    ))}
                                </div>
                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium hover:underline mt-auto">
                                    View Resource &rarr;
                                </a>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-6 text-center text-slate-500 bg-slate-50 border-dashed">
                        <p>No specific recommendations yet. Explore the repository to find content!</p>
                        <Link to="/repository" className="text-primary hover:underline mt-2 inline-block">Browse Repository</Link>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                        <Link to="/repository" className="text-sm text-primary hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                                    <div>
                                        <p className="font-medium text-slate-800">{item.title}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(item.createdAt).toLocaleString()} • {item.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm">No recent activity.</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/upload">
                            <div className="p-4 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-center group">
                                <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-slate-700">Upload Content</h3>
                            </div>
                        </Link>

                        <Link to="/repository">
                            <div className="p-4 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-center group">
                                <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-slate-700">Search Knowledge</h3>
                            </div>
                        </Link>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Dashboard;
