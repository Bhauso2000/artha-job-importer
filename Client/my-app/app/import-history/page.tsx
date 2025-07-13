'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

type ImportLog = {
    _id: string;
    timestamp: string;
    sourceUrl: string;
    totalFetched: number;
    newJobs: number;
    updatedJobs: number;
    failedJobs: any[];
};

export default function ImportHistory() {
    const [logs, setLogs] = useState<ImportLog[]>([]);

    useEffect(() => {
        api.get('/api/history').then((res) => {

            setLogs(res.data);
        });

    }, []);
    useEffect(() => {
        const socket = getSocket();

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('import_status', (update: any) => {
            console.log('📡 Received import_status:', update);

            const entry: ImportLog = {
                _id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                sourceUrl: update.sourceUrl,
                totalFetched: update.totalFetched,
                newJobs: update.newJobs,
                updatedJobs: update.updatedJobs,
                failedJobs:  update.failedJobs.length,
            };
            setLogs(prev => [entry, ...prev]);
        });

        return () => {
            socket.off('import_status');
        };
    }, []);

    return (
        <main className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Import History</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm uppercase">
                            <th className="p-3">Date</th>
                            <th className="p-3">Source</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">New</th>
                            <th className="p-3">Updated</th>
                            <th className="p-3">Failed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs?.map(log => (
                            <tr key={log._id} className="border-t">
                                <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-3 break-words">{log.sourceUrl}</td>
                                <td className="p-3">{log.totalFetched}</td>
                                <td className="p-3 text-green-600">{log.newJobs}</td>
                                <td className="p-3 text-yellow-600">{log?.updatedJobs}</td>
                                <td className="p-3 text-red-600">{log.failedJobs?.length || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
