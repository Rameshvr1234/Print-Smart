import React, { useState, useEffect, useCallback } from 'react';
import { ReportData } from '../types';
import * as db from '../services/database';

const ReportsScreen: React.FC = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(todayStr);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = useCallback(() => {
        setLoading(true);
        try {
            const data = db.getReportData(startDate, endDate);
            setReportData(data);
        } catch (error) {
            console.error("Failed to generate report:", error);
            alert("Failed to generate report.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        handleGenerateReport();
    }, [handleGenerateReport]);
    
    const exportToCSV = () => {
        if (!reportData || reportData.rows.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ['Date', 'Client', 'Job Ref', 'Material', 'Designing Charges', 'SS Qty', 'F&B Qty', 'Finishing', 'Waste'];
        
        const csvRows = [
            headers.join(','),
            ...reportData.rows.map(row => {
              return [
                row.date,
                `"${row.client_name}"`,
                `"${row.job_reference}"`,
                `"${row.material_name}"`,
                row.designing_charges,
                row.ss_qty,
                row.fb_qty,
                row.finishing, 
                row.waste,
              ].join(',')
            })
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${startDate}_to_${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-end gap-6">
                <div>
                    <label className="block text-lg font-medium text-gray-700">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-md text-lg" />
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-md text-lg" />
                </div>
                <div>
                  <button onClick={handleGenerateReport} className="w-full md:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90">
                    {loading ? 'Loading...' : 'Generate Report'}
                  </button>
                </div>
                <div className="md:ml-auto">
                    <button onClick={exportToCSV} className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50">Download CSV</button>
                </div>
            </div>

            {reportData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-500">Total Production Value</h3>
                            <p className="text-4xl font-bold text-gray-800">{reportData.totalProductionValue.toLocaleString()}</p>
                        </div>
                         <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-500">Total Impressions</h3>
                            <p className="text-4xl font-bold text-brand-orange">{reportData.totalImpressions.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-500">Total Waste</h3>
                            <p className="text-4xl font-bold text-red-600">{reportData.totalWaste.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-500">Top Clients (by Jobs)</h3>
                            {reportData.topClients.length > 0 ? (
                                <ul className="mt-2 space-y-1">
                                    {reportData.topClients.map(c => (
                                        <li key={c.client_name} className="flex justify-between text-lg">
                                            <span className="font-medium text-gray-700">{c.client_name}</span>
                                            <span className="font-bold text-gray-800">{c.job_count}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-lg text-gray-500 mt-2">No client data.</p>)}
                        </div>
                    </div>

                    {/* Full Data Table */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <h2 className="p-4 text-2xl font-bold text-gray-800 border-b">All Entries</h2>
                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full text-lg whitespace-nowrap">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Client</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Job Ref</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Material</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">SS Qty</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">F&B Qty</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Design Charges</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Finishing</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Waste</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {reportData.rows.map(row => (
                                        <tr key={row.id} className="align-middle">
                                            <td className="p-3 text-gray-600">{row.date}</td>
                                            <td className="p-3 font-medium text-gray-900">{row.client_name}</td>
                                            <td className="p-3 text-gray-600">{row.job_reference}</td>
                                            <td className="p-3 text-gray-600">{row.material_name}</td>
                                            <td className="p-3 text-right text-gray-700 font-mono">{row.ss_qty.toLocaleString()}</td>
                                            <td className="p-3 text-right text-gray-700 font-mono">{row.fb_qty.toLocaleString()}</td>
                                            <td className="p-3 text-right text-gray-700 font-mono">{row.designing_charges.toLocaleString()}</td>
                                            <td className="p-3 text-right text-gray-700 font-mono">{row.finishing.toLocaleString()}</td>
                                            <td className="p-3 text-right text-red-600 font-mono">{row.waste.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reportData.rows.length === 0 && <p className="p-6 text-center text-gray-500 text-lg">No data found for the selected date range.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsScreen;