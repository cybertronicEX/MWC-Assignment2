import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const AuditFormModal = ({ contentId, isOpen, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [status, setStatus] = useState('Compliant');
    const [issues, setIssues] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(
                `${apiUrl}/audit/content`,
                { contentId, status, issues, recommendations },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Audit failed:', err);
            setError('Failed to submit audit record.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Audit Content</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Audit Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="Compliant">Compliant</option>
                            <option value="Non-Compliant">Non-Compliant</option>
                            <option value="Flagged">Flagged for Review</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Issues Identified</label>
                        <textarea
                            value={issues}
                            onChange={(e) => setIssues(e.target.value)}
                            rows="3"
                            placeholder="Describe any compliance or quality issues..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Recommendations</label>
                        <textarea
                            value={recommendations}
                            onChange={(e) => setRecommendations(e.target.value)}
                            rows="3"
                            placeholder="Suggest improvements..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Audit'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuditFormModal;
