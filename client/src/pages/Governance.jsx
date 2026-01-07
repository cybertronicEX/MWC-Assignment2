import React from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';

const Governance = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Governance Audit Log</h1>
                <Card>
                    <div className="text-center py-12">
                        <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Audit Log</h3>
                        <p className="text-slate-500 mt-2">Governance features coming soon.</p>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Governance;
