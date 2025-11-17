import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DailyRow, Item } from '../types';
import * as db from '../services/database';
import { CLICK_CHARGE } from '../constants';

type JobRow = DailyRow & { client_name: string; date: string; material_name: string; };

type ProcessedJob = JobRow & {
    total_sheets: number;
    material_cost: number;
    print_clicks: number;
    click_cost: number;
    total_cost: number;
};

const DashboardScreen: React.FC = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(todayStr);
    const [jobs, setJobs] = useState<JobRow[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        setLoading(true);
        setJobs(db.getFinalizedJobs());
        setItems(db.getItems());
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const itemPriceMap = useMemo(() => {
        return new Map(items.map(i => [i.sku, i.price]));
    }, [items]);

    const processedData = useMemo((): ProcessedJob[] => {
        return jobs
            .filter(job => job.date >= startDate && job.date <= endDate)
            .map(job => {
                const total_sheets = job.ss_qty + job.fb_qty + job.waste;
                const material_cost = total_sheets * (itemPriceMap.get(job.material_sku) || 0);
                const print_clicks = job.ss_qty + (job.fb_qty * 2) + job.waste;
                const click_cost = print_clicks * CLICK_CHARGE;
                const total_cost = material_cost + click_cost;

                return { ...job, total_sheets, material_cost, print_clicks, click_cost, total_cost };
            })
            .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    }, [jobs, startDate, endDate, itemPriceMap]);

    const summary = useMemo(() => {
        return processedData.reduce((acc, job) => {
            acc.totalMaterialCost += job.material_cost;
            acc.totalClickCost += job.click_cost;
            acc.totalCost += job.total_cost;
            acc.totalClicks += job.print_clicks;
            return acc;
        }, { totalMaterialCost: 0, totalClickCost: 0, totalCost: 0, totalClicks: 0 });
    }, [processedData]);
    
    const formatCurrency = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    
    const generateJobNumber = (date: string, serialNo: number) => {
        const d = new Date(date + 'T00:00:00');
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const sequence = String(serialNo).padStart(2, '0');
        return `${day}-${month}-${sequence}`;
    };

    const exportToCSV = () => {
        if (processedData.length === 0) return alert('No data to export.');
        
        const headers = ['Date', 'Job No', 'Client Name', 'Job Ref', 'Material', 'Total Sheets', 'Material Cost', 'Print Clicks', 'Click Cost', 'Total Cost'];
        const csvRows = [
            headers.join(','),
            ...processedData.map(job => [
                job.date,
                generateJobNumber(job.date, job.serial_no),
                `"${job.client_name}"`,
                `"${job.job_reference}"`,
                `"${job.material_name}"`,
                job.total_sheets,
                job.material_cost.toFixed(2),
                job.print_clicks,
                job.click_cost.toFixed(2),
                job.total_cost.toFixed(2)
            ].join(','))
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cost_dashboard_${startDate}_to_${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full mt-1 px-4 py-3 border border-gray-700 rounded-md text-lg bg-gray-800 text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full mt-1 px-4 py-3 border border-gray-700 rounded-md text-lg bg-gray-800 text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                </div>
                <div>
                    <button onClick={exportToCSV} className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50">Download CSV</button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-500">Total Material Cost</h3>
                            <p className="text-4xl font-bold text-gray-800">{formatCurrency(summary.totalMaterialCost)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-500">Total Click Cost</h3>
                            <p className="text-4xl font-bold text-gray-800">{formatCurrency(summary.totalClickCost)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-500">Overall Manufacturing Cost</h3>
                            <p className="text-4xl font-bold text-brand-orange">{formatCurrency(summary.totalCost)}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <h2 className="p-4 text-2xl font-bold text-gray-800 border-b">Cost Breakdown</h2>
                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full text-lg whitespace-nowrap">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left font-semibold text-gray-600">Job Details</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Material Cost</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Click Cost</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {processedData.map(job => (
                                        <tr key={job.id}>
                                            <td className="p-3">
                                                <p className="font-bold text-gray-900">{job.client_name}</p>
                                                <p className="text-sm text-gray-600">{generateJobNumber(job.date, job.serial_no)} | {job.job_reference}</p>
                                                <p className="text-sm text-gray-500">{job.material_name} ({job.total_sheets} sheets)</p>
                                            </td>
                                            <td className="p-3 text-right font-mono">{formatCurrency(job.material_cost)}</td>
                                            <td className="p-3 text-right font-mono">{formatCurrency(job.click_cost)} ({job.print_clicks} clicks)</td>
                                            <td className="p-3 text-right font-mono font-bold text-brand-blue">{formatCurrency(job.total_cost)}</td>
                                        </tr>
                                    ))}
                                    {processedData.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-gray-500">No data for the selected date range.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardScreen;