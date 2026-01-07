import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const AuditLogs = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('system'); // 'system' | 'compliance'

    // System Logs State
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotalPages, setLogsTotalPages] = useState(1);

    // Compliance Queue State
    const [flaggedContent, setFlaggedContent] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);

    useEffect(() => {
        if (token) {
            if (activeTab === 'system') fetchLogs(logsPage);
            if (activeTab === 'compliance') fetchFlaggedContent();
        }
    }, [token, activeTab, logsPage]);

    const fetchLogs = async (page) => {
        try {
            setLogsLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/audit?page=${page}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data.data);
            setLogsTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchFlaggedContent = async () => {
        try {
            setContentLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            // Fetch content with auditStatus 'Flagged' or 'Non-Compliant'
            const [flaggedRes, nonCompliantRes] = await Promise.all([
                axios.get(`${apiUrl}/content`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { auditStatus: 'Flagged', limit: 50 }
                }),
                axios.get(`${apiUrl}/content`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { auditStatus: 'Non-Compliant', limit: 50 }
                })
            ]);

            setFlaggedContent([...flaggedRes.data.data, ...nonCompliantRes.data.data]);
        } catch (err) {
            console.error('Failed to fetch compliance content', err);
        } finally {
            setContentLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Governance Dashboard</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setActiveTab('system')}
                        variant={activeTab === 'system' ? 'primary' : 'outline'}
                        size="sm"
                    >
                        System Logs
                    </Button>
                    <Button
                        onClick={() => setActiveTab('compliance')}
                        variant={activeTab === 'compliance' ? 'primary' : 'outline'}
                        size="sm"
                    >
                        Compliance Queue
                    </Button>
                </div>
            </div>

            {activeTab === 'system' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {logsLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No system logs found. Try performing some actions (Login, Upload) to generate logs.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${log.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                                                            log.action === 'CREATE_CONTENT' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                                    {log.userId?.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                                    {JSON.stringify(log.details)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
                                <button onClick={() => setLogsPage(p => Math.max(1, p - 1))} disabled={logsPage === 1} className="text-sm text-primary disabled:text-slate-300">Previous</button>
                                <span className="text-sm text-slate-500">Page {logsPage} of {logsTotalPages}</span>
                                <button onClick={() => setLogsPage(p => Math.min(logsTotalPages, p + 1))} disabled={logsPage === logsTotalPages} className="text-sm text-primary disabled:text-slate-300">Next</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contentLoading ? (
                        <div className="col-span-full text-center py-12 text-slate-500">Loading flagged content...</div>
                    ) : flaggedContent.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-lg shadow">
                            No content currently flagged for review.
                        </div>
                    ) : (
                        flaggedContent.map((item) => (
                            <Card key={item.id}>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="error">{item.auditStatus}</Badge>
                                        <span className="text-xs text-slate-400">{new Date(item.lastAuditedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">{item.title}</h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <a href={item.fileUrl} target="_blank" className="text-sm text-primary hover:underline">View</a>
                                        <span className="text-xs text-slate-500">ID: {item.id.substring(0, 8)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </Layout>
    );
};

export default AuditLogs;
