import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DailyRow, UserRole } from '../types';
import * as db from '../services/database';

type JobRow = DailyRow & { client_name: string; date: string; material_name: string; };

const AccountsScreen: React.FC<{ loggedInUserRole: UserRole }> = ({ loggedInUserRole }) => {
    const [jobs, setJobs] = useState<JobRow[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'billed' | 'unbilled'>('unbilled');
    const [editingState, setEditingState] = useState<{ [key: number]: { is_billed: boolean; bill_no: string | null } }>({});

    const fetchData = useCallback(() => {
        const finalizedJobs = db.getFinalizedJobs();
        setJobs(finalizedJobs);
        // Initialize editing state
        const initialState: { [key: number]: { is_billed: boolean; bill_no: string | null } } = {};
        finalizedJobs.forEach(job => {
            initialState[job.id] = { is_billed: job.is_billed, bill_no: job.bill_no };
        });
        setEditingState(initialState);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFieldChange = (rowId: number, field: 'is_billed' | 'bill_no', value: boolean | string | null) => {
        setEditingState(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [field]: value,
                // If a bill number is added, automatically check 'billed'
                ...(field === 'bill_no' && value && { is_billed: true })
            }
        }));
    };

    const handleSaveChanges = (rowId: number) => {
        const { is_billed, bill_no } = editingState[rowId];
        const trimmedBillNo = bill_no?.trim() || null;
        db.updateBillingInfo(rowId, is_billed, trimmedBillNo);
        // Update main jobs state to reflect saved data
        setJobs(prevJobs => prevJobs.map(job =>
            job.id === rowId ? { ...job, is_billed, bill_no: trimmedBillNo } : job
        ));
        alert(`Job #${rowId} updated successfully.`);
    };


    const sortedAndFilteredJobs = useMemo(() => {
        return jobs
            .filter(job => {
                const matchesSearch = job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.job_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (job.bill_no && job.bill_no.toLowerCase().includes(searchTerm.toLowerCase()));

                if (!matchesSearch) return false;

                switch (filter) {
                    case 'billed': return job.is_billed;
                    case 'unbilled': return !job.is_billed;
                    case 'all':
                    default:
                        return true;
                }
            })
            .sort((a, b) => {
                // Primary sort: unbilled jobs first
                if (a.is_billed !== b.is_billed) {
                    return a.is_billed ? 1 : -1;
                }
                // Secondary sort: by date descending
                return b.date.localeCompare(a.date);
            });
    }, [jobs, searchTerm, filter]);

    const generateJobNumber = (date: string, serialNo: number) => {
        const d = new Date(date + 'T00:00:00');
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const sequence = String(serialNo).padStart(2, '0');
        return `${day}-${month}-${sequence}`;
    };
    
    const exportToCSV = () => {
        const headers = ['Date', 'Job No', 'Client Name', 'Job Reference', 'Billed', 'Bill No.'];
        const csvRows = [
            headers.join(','),
            ...sortedAndFilteredJobs.map(job => [
                job.date,
                generateJobNumber(job.date, job.serial_no),
                `"${job.client_name}"`,
                `"${job.job_reference}"`,
                job.is_billed ? 'Yes' : 'No',
                `"${job.bill_no || ''}"`
            ].join(','))
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'accounts_jobs.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-lg">
                <input
                    type="text"
                    placeholder="Search client, job ref, bill no..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-lg"
                />
                <div className="flex items-center gap-4">
                    <select value={filter} onChange={e => setFilter(e.target.value as any)} className="px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg">
                        <option value="unbilled">Unbilled</option>
                        <option value="billed">Billed</option>
                        <option value="all">All Jobs</option>
                    </select>
                    <button onClick={exportToCSV} className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">Download CSV</button>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-lg whitespace-nowrap">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Job No.</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Client Name</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Job Reference</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Billed</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Bill No.</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedAndFilteredJobs.map(job => {
                                const isLocked = loggedInUserRole === 'Accounts' && !!job.bill_no;
                                const currentEdit = editingState[job.id] || { is_billed: job.is_billed, bill_no: job.bill_no };
                                
                                return (
                                    <tr key={job.id} className={`align-middle transition-colors duration-300 ${job.bill_no ? 'bg-green-50' : ''}`}>
                                        <td className="p-2">{job.date}</td>
                                        <td className="p-2 font-mono">{generateJobNumber(job.date, job.serial_no)}</td>
                                        <td className="p-2 font-medium">{job.client_name}</td>
                                        <td className="p-2 text-gray-700">{job.job_reference}</td>
                                        <td className="p-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={currentEdit.is_billed}
                                                onChange={(e) => handleFieldChange(job.id, 'is_billed', e.target.checked)}
                                                className="h-6 w-6 rounded border-gray-300 text-brand-orange focus:ring-brand-orange disabled:opacity-50"
                                                disabled={isLocked}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={currentEdit.bill_no || ''}
                                                onChange={(e) => handleFieldChange(job.id, 'bill_no', e.target.value)}
                                                placeholder="Enter Bill No."
                                                className="w-full px-2 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                disabled={isLocked}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <button 
                                                onClick={() => handleSaveChanges(job.id)}
                                                disabled={isLocked}
                                                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-md shadow-sm hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                             {sortedAndFilteredJobs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center p-8 text-gray-500">No jobs found for the current filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccountsScreen;