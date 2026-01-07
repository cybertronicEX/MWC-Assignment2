import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

import AuditFormModal from '../components/common/AuditFormModal';
import ReviewModal from '../components/common/ReviewModal';

const Repository = () => {
    const { token, user } = useAuth(); // Get user
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Audit Modal State
    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedContentId, setSelectedContentId] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            // Fetch only approved content for general repository view
            // In a real scenario, we might want to flag to show 'all' based on role
            const response = await axios.get(`${apiUrl}/content`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'Approved', limit: 100 }
            });
            setContent(response.data.data);
        } catch (err) {
            setError('Failed to load content.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuditClick = (contentId) => {
        setSelectedContentId(contentId);
        setAuditModalOpen(true);
    };

    const handleReviewClick = (contentId) => {
        setSelectedContentId(contentId);
        setReviewModalOpen(true);
    };

    const filteredContent = content.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const isPrivileged = ['admin', 'governance', 'champion'].includes(user?.role);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Knowledge Repository</h1>
                <Button onClick={fetchContent} variant="outline" className="text-sm">Refresh</Button>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Search by title or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loading size="large" />
                </div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.map((item) => (
                        <Card key={item.id} className="flex flex-col h-full">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate" title={item.title}>{item.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {item.tags?.map((tag, idx) => (
                                        <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">#{tag}</span>
                                    ))}
                                </div>
                                {item.auditStatus && (
                                    <div className="mt-3 pt-2 border-t border-slate-100">
                                        <span className={`text-xs font-semibold ${item.auditStatus === 'Compliant' ? 'text-green-600' :
                                            item.auditStatus === 'Non-Compliant' ? 'text-red-600' : 'text-amber-600'
                                            }`}>
                                            Audit Status: {item.auditStatus}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                                <span className="text-xs text-slate-500">v{item.version || 1}</span>
                                <div className="flex gap-3">
                                    {isPrivileged && (
                                        <>
                                            <button
                                                onClick={() => handleAuditClick(item.id)}
                                                className="text-sm text-slate-500 hover:text-primary font-medium"
                                            >
                                                Audit
                                            </button>
                                            <button
                                                onClick={() => handleReviewClick(item.id)}
                                                className="text-sm text-slate-500 hover:text-primary font-medium"
                                            >
                                                Review
                                            </button>
                                        </>
                                    )}
                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium hover:underline">
                                        View Resource &rarr;
                                    </a>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredContent.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No content found matching your search.
                        </div>
                    )}
                </div>
            )}

            <AuditFormModal
                isOpen={auditModalOpen}
                onClose={() => setAuditModalOpen(false)}
                contentId={selectedContentId}
                onSuccess={() => {
                    fetchContent(); // Refresh to show new audit status
                    // Could also show a toast here
                }}
            />

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                contentId={selectedContentId}
                onSuccess={() => {
                    // Optional: Toast message
                    console.log('Review submitted');
                }}
            />
        </Layout>
    );
};

export default Repository;
