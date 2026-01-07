import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ValidationQueue = () => {
    const { user, token } = useAuth();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'primary',
        confirmText: 'Confirm'
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (token && user) fetchQueue(currentPage);
    }, [token, user, currentPage]);

    const fetchQueue = async (page = 1) => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const params = {
                status: 'Pending',
                page,
                limit: 5 // Items per page
            };

            // If Consultant, filter by own ID
            if (user.role === 'consultant') {
                params.authorId = user.uid;
            }

            const response = await axios.get(`${apiUrl}/content`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setQueue(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            setError('Failed to load validation queue.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const executeValidation = async (id, status, notes = '') => {
        setProcessingId(id);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(
                `${apiUrl}/validation/${id}/validate`,
                { status, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Remove from local list
            setQueue(queue.filter(item => item.id !== id));
        } catch (err) {
            alert('Validation failed');
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleApprove = (id) => {
        setModalConfig({
            title: 'Approve Content',
            message: 'Are you sure you want to approve this content? It will become visible to all users.',
            confirmText: 'Approve',
            variant: 'primary', // Green color usually handled by class in modal, or we rely on primary
            onConfirm: () => executeValidation(id, 'Approved')
        });
        setModalOpen(true);
    };

    const handleReject = (id) => {
        const notes = prompt('Reason for rejection/revision?');
        if (notes !== null) {
            executeValidation(id, 'NeedsRevision', notes);
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Validation Queue</h1>
                <Button onClick={fetchQueue} variant="outline" className="text-sm">Refresh</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : queue.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-slate-800">All caught up!</h3>
                    <p className="text-slate-500">No content pending validation.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {queue.map((item) => (
                        <Card key={item.id} className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="warning">Pending Review</Badge>
                                        <span className="text-xs text-slate-500">Submitted {new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                                    <p className="text-slate-600 mb-4">{item.description}</p>

                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Metadata & Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {item.tags?.map((tag, idx) => (
                                                <span key={idx} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">#{tag}</span>
                                            ))}
                                            {(!item.tags || item.tags.length === 0) && <span className="text-xs text-slate-400 italic">No tags provided</span>}
                                        </div>
                                    </div>

                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Review Document
                                    </a>
                                </div>

                                {/* Actions - Only for non-consultants */}
                                {user.role !== 'consultant' && (
                                    <div className="flex md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                        <Button
                                            variant="primary"
                                            className="bg-green-600 hover:bg-green-700 w-full"
                                            onClick={() => handleApprove(item.id)}
                                            disabled={processingId === item.id}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                                            onClick={() => handleReject(item.id)}
                                            disabled={processingId === item.id}
                                        >
                                            Request Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                {...modalConfig}
            />
        </Layout>
    );
};

export default ValidationQueue;
