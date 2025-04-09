'use client';
import React, { useState } from 'react';

const WorkforceQuery: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sendPrompt = async () => {
        if (!prompt.trim()) return;

        setOutput((prev) => [...prev, { sender: 'user', content: prompt }]);
        setPrompt('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (data.response) {
                setOutput((prev) => [...prev, { sender: 'ai', content: data.response }]);
            }
            if (data.query) {
                setOutput((prev) => [...prev, { sender: 'ai', content: data.query }]);
            }
            if (data.columns && data.result) {
                setOutput((prev) => [...prev, { sender: 'ai', content: createTable(data.columns, data.result) }]);
            }
            if (data.error) {
                setOutput((prev) => [...prev, { sender: 'ai', content: data.error }]);
            }
        } catch (error: any) {
            setOutput((prev) => [...prev, { sender: 'ai', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const createTable = (columns: string[], rows: string[][]) => {
        return (
            <div className="overflow-auto">
                <table className="min-w-full table-auto border border-gray-900 my-4">
                    <thead className="bg-gray-900">
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className="px-4 py-2 border border-gray-900 text-left">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-2 border border-gray-900">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-between px-4 py-6">
            <h2 className="text-center text-2xl font-bold mb-4">Soft_Wizz: Workforce Query</h2>

            <div className="flex-1 overflow-y-auto bg-sky rounded-xl shadow-lg p-4 space-y-3 mb-6 max-h-[75vh]">
                {output.map((message, index) => (
                    <div
                        key={index}
                        className={`rounded-lg px-3 py-2 ${message.sender === 'user' ? 'bg-blue-900 text-right' : 'bg-gray-900 text-left'}`}
                    >
                        {typeof message.content === 'string' ? message.content : message.content}
                    </div>
                ))}
                {isLoading && <div className="text-gray-500">Loading...</div>}
            </div>

            <div className="w-full max-w-4xl mx-auto flex items-center">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Ask something like 'Show all employees in HR' or 'Update status of employee 2'"
                    rows={2}
                />
                <button
                    onClick={sendPrompt}
                    className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default WorkforceQuery;
