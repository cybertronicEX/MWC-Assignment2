import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const ReviewModal = ({ contentId, isOpen, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setRating(5);
            setComment('');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(
                `${apiUrl}/content/${contentId}/reviews`,
                { rating: parseInt(rating), comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Review failed:', err);
            setError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Add Review</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            placeholder="Share your feedback..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
