import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const UploadContent = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file: null,
        tags: ''
    });
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('tags', formData.tags); // Send as string, backend handles parsing if needed or we split here

            if (formData.file) {
                data.append('file', formData.file);
            }

            // Use configured API URL from .env, fallback to localhost
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            await axios.post(
                `${apiUrl}/content`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setMessage({ type: 'success', text: 'Content uploaded successfully! It is now Pending approval.' });
            setFormData({ title: '', description: '', file: null, tags: '' });
            // Reset file input manually if needed (ref)
            document.getElementById('file-upload').value = '';
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload content.' });
        } finally {
            setLoading(false);
        }
    };


    const handleAiAutoTag = async () => {
        if (!formData.title || !formData.description) {
            alert('Please fill in Title and Description first.');
            return;
        }

        try {
            setAiLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(
                `${apiUrl}/ai/generate-metadata`,
                { title: formData.title, description: formData.description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { tags, summary } = response.data;

            // Append tags
            const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
            const newTags = [...new Set([...currentTags, ...tags])]; // Unique

            setFormData({
                ...formData,
                tags: newTags.join(', ')
            });

            // Optionally update description if empty or appending summary? 
            // For now, let's just alert the summary or maybe log it.
            // alert(`AI Suggestion: ${summary}`);

        } catch (error) {
            console.error("AI Error", error);
            alert('Failed to generate tags. Check API Key.');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Knowledge Asset</h1>

                <Card className="p-6">
                    {message && (
                        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="e.g. Mobile UX Guidelines v2"
                        />

                        <div className="mb-4">
                            <label className="mb-2 text-sm font-semibold text-slate-700 block">Description</label>
                            <textarea
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Brief summary of the content..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 text-sm font-semibold text-slate-700 block">Document (PDF)</label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary/10 file:text-primary
                              hover:file:bg-primary/20
                            "
                                required
                            />
                        </div>

                        <Input
                            label="Tags (comma separated)"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="mobile, design, guidelines"
                        />
                        <div className="flex justify-end mb-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="text-xs py-1"
                                onClick={handleAiAutoTag}
                                disabled={aiLoading}
                            >
                                {aiLoading ? 'Analyzing...' : '✨ Auto-Tag with AI'}
                            </Button>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" type="button">Cancel</Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Uploading...' : 'Submit Content'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </Layout>
    );
};

export default UploadContent;
