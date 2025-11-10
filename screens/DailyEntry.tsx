import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Client, DailyRowInput, Item, UserRole } from '../types';
import * as db from '../services/database';
import { DAILY_ROW_COLUMNS, DAILY_ROW_NUMERIC_FIELDS } from '../constants';
import Modal from '../components/Modal';

// This form is specific to this screen for quick adds, so it's defined here.
const QuickClientForm: React.FC<{onSave: (client: Client) => void, onCancel: () => void}> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            const newClient = db.addClient({ name });
            onSave(newClient);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-lg font-medium text-gray-700">New Client Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg text-black"/>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90">Add Client</button>
            </div>
        </form>
    );
};

const DailyRowFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (row: DailyRowInput) => void;
    onDelete: () => void;
    rowData: DailyRowInput | null;
    rowIndex: number | null;
    clients: Client[];
    items: Item[];
    userRole: UserRole;
}> = ({ isOpen, onClose, onSave, onDelete, rowData, rowIndex, clients, items, userRole }) => {
    
    const [formState, setFormState] = useState<DailyRowInput>({
        client_id: 0, job_reference: '', designing_charges: 0, material_sku: '',
        ss_qty: 0, fb_qty: 0, finishing: 0, waste: 0,
    });

    useEffect(() => {
        const initialData = rowData || {
            client_id: clients[0]?.id || 0,
            job_reference: '', // This will be set on save for new items
            designing_charges: 0,
            material_sku: items[0]?.sku || '',
            ss_qty: 0,
            fb_qty: 0,
            finishing: 0,
            waste: 0,
        };
        setFormState(initialData);
    }, [isOpen, rowData, clients, items]);

    const handleChange = <K extends keyof DailyRowInput>(field: K, value: DailyRowInput[K]) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            onDelete();
        }
    };

    const title = rowData ? `Edit Job #${(rowIndex ?? 0) + 1}` : 'Add New Job';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSave} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-600">Client Name</label>
                    <select value={formState.client_id} onChange={e => handleChange('client_id', Number(e.target.value))} className="w-full mt-1 px-2 py-3 border border-gray-300 rounded-md text-lg text-black bg-white">
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-600">Material</label>
                    <select value={formState.material_sku} onChange={e => handleChange('material_sku', e.target.value)} className="w-full mt-1 px-2 py-3 border border-gray-300 rounded-md text-lg text-black bg-white">
                        {items.map(i => <option key={i.sku} value={i.sku}>{i.name}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    {DAILY_ROW_COLUMNS.map(c => (
                        <div key={c.key}>
                            <label className="block text-sm font-medium text-gray-600">{c.label}</label>
                            <input type="number" min="0" value={formState[c.key as keyof DailyRowInput]} onChange={e => handleChange(c.key as keyof DailyRowInput, Number(e.target.value))} className="w-full mt-1 px-2 py-3 border border-gray-300 rounded-md text-lg text-black bg-white" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4">
                    <div>
                        {rowData && userRole === 'Admin' && (
                             <button type="button" onClick={handleDelete} className="px-6 py-3 text-lg font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200">Delete</button>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-orange hover:bg-opacity-90">Save</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};


const DailyEntryScreen: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [day, setDay] = useState('');
    const [rows, setRows] = useState<DailyRowInput[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [machineStartReading, setMachineStartReading] = useState(0);
    const [machineEndReading, setMachineEndReading] = useState(0);

    // State for the new mobile row form modal
    const [isRowModalOpen, setIsRowModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<{ row: DailyRowInput; index: number } | null>(null);


    const fetchClientsAndItems = useCallback(() => {
        setClients(db.getClients().filter(c => c.is_active));
        setItems(db.getItems());
    }, []);

    const generateJobReference = (currentDate: string, rowIndex: number) => {
        const d = new Date(currentDate + 'T00:00:00');
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const sequence = String(rowIndex + 1).padStart(2, '0');
        return `${day}-${month}-${sequence}`;
    }

    useEffect(() => {
        const d = new Date(date + 'T00:00:00');
        setDay(d.toLocaleDateString('en-US', { weekday: 'long' }));
        
        const entry = db.getDailyEntry(date);
        if (entry.header) {
            const loadedRows = entry.rows.map(({id, header_id, serial_no, ...rest}) => rest);
            setRows(loadedRows);
            setMachineStartReading(entry.header.machine_start_reading || 0);
            setMachineEndReading(entry.header.machine_end_reading || 0);
        } else {
            setRows([]);
            setMachineStartReading(0);
            setMachineEndReading(0);
        }
    }, [date]);

    useEffect(() => {
        fetchClientsAndItems();
    }, [fetchClientsAndItems]);

    // Used for Desktop "Add Row" button
    const addRow = () => {
        const newRow: DailyRowInput = {
            client_id: clients[0]?.id || 0,
            job_reference: generateJobReference(date, rows.length),
            designing_charges: 0,
            material_sku: items[0]?.sku || '',
            ss_qty: 0,
            fb_qty: 0,
            finishing: 0, 
            waste: 0, 
        };
        setRows([...rows, newRow]);
    };
    
    const removeRow = (index: number) => {
        const updatedRows = rows.filter((_, i) => i !== index)
            .map((row, i) => ({
                ...row,
                job_reference: generateJobReference(date, i)
            }));
        setRows(updatedRows);
    };

    const handleRowChange = <K extends keyof DailyRowInput,>(index: number, field: K, value: DailyRowInput[K]) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    const handleOpenAddModal = () => {
        setEditingRow(null);
        setIsRowModalOpen(true);
    };
    
    const handleOpenEditModal = (index: number) => {
        setEditingRow({ row: rows[index], index });
        setIsRowModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsRowModalOpen(false);
        setEditingRow(null);
    };

    const handleSaveRow = (newRowData: DailyRowInput) => {
        let updatedRows;
        if (editingRow !== null) { // Editing existing row
            updatedRows = [...rows];
            updatedRows[editingRow.index] = newRowData;
        } else { // Adding new row
            const jobRef = generateJobReference(date, rows.length);
            updatedRows = [...rows, { ...newRowData, job_reference: jobRef }];
        }
        setRows(updatedRows);
        handleCloseModal();
    };

    const handleDeleteRowFromModal = () => {
        if (editingRow !== null) {
            removeRow(editingRow.index);
            handleCloseModal();
        }
    };


    const totalImpressions = useMemo(() => {
        return rows.reduce((total, row) => {
            return total + (row.ss_qty || 0) + ((row.fb_qty || 0) * 2) + (row.waste || 0);
        }, 0);
    }, [rows]);
    
    const machineProduction = useMemo(() => {
        return Math.max(0, machineEndReading - machineStartReading);
    }, [machineStartReading, machineEndReading]);

    const impressionsMatch = useMemo(() => {
        return machineProduction === totalImpressions;
    }, [machineProduction, totalImpressions]);

    const matchStatus = useMemo(() => {
        if (totalImpressions > 0 || machineProduction > 0) {
            return impressionsMatch ? 'match' : 'mismatch';
        }
        return 'idle';
    }, [impressionsMatch, totalImpressions, machineProduction]);


    const columnTotals = useMemo(() => {
        const totals: { [key: string]: number } = {};
        DAILY_ROW_NUMERIC_FIELDS.forEach(key => {
            totals[key] = rows.reduce((sum, row) => sum + (Number((row as any)[key]) || 0), 0);
        })
        return totals;
    }, [rows]);

    const handleSave = () => {
        if (!date) {
            alert('Date cannot be empty.');
            return;
        }
        if (rows.some(r => !r.client_id || !r.material_sku)) {
            alert('Client Name and Material cannot be empty for any row.');
            return;
        }

        if (totalImpressions > 0 && machineEndReading <= machineStartReading) {
            alert('Machine end reading must be greater than start reading when there is production.');
            return;
        }
        
        if (!impressionsMatch) {
            alert(`Impressions count does not match machine reading.\nMachine Production: ${machineProduction}\nTotal Impressions from jobs: ${totalImpressions}`);
            return;
        }

        const headerData = { date, day_name: day, total_impressions: totalImpressions, machine_start_reading: machineStartReading, machine_end_reading: machineEndReading };
        db.saveDailyEntry(headerData, rows);
        alert('Day saved successfully!');
    };
    
    const handleQuickClientAdd = (newClient: Client) => {
        fetchClientsAndItems();
        setIsClientModalOpen(false);
        const newRow: DailyRowInput = {
            client_id: newClient.id,
            job_reference: generateJobReference(date, rows.length),
            designing_charges: 0, material_sku: items[0]?.sku || '', ss_qty: 0, fb_qty: 0,
            finishing: 0, waste: 0,
        };
        setRows([...rows, newRow]);
    };

    const handleExport = (format: 'csv' | 'pdf') => {
        if (format === 'csv') {
            exportToCSV();
        } else {
            exportToPDF();
        }
    };

    const exportToCSV = () => {
        const clientMap = new Map(clients.map(c => [c.id, c.name]));
        const itemMap = new Map(items.map(i => [i.sku, i.name]));

        const headers = ['No.', 'Client Name', 'Job Reference', 'Material', ...DAILY_ROW_COLUMNS.map(c => c.label)];
        
        const csvRows = [
            headers.join(','),
            ...rows.map((row, index) => [
                index + 1,
                `"${clientMap.get(row.client_id) || ''}"`,
                `"${row.job_reference}"`,
                `"${itemMap.get(row.material_sku) || ''}"`,
                row.designing_charges,
                row.ss_qty,
                row.fb_qty,
                row.finishing,
                row.waste
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily_entry_${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        // @ts-ignore
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({orientation: 'landscape'});
        const clientMap = new Map(clients.map(c => [c.id, c.name]));
        const itemMap = new Map(items.map(i => [i.sku, i.name]));

        doc.setFontSize(18);
        doc.text(`Daily Production - ${date} (${day})`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Total Impressions: ${totalImpressions}`, 14, 30);
        doc.text(`Machine Readings: ${machineStartReading} - ${machineEndReading}`, 14, 36);

        const tableColumn = ['#', 'Client', 'Job Ref', 'Material', 'Design Charges', 'SS Qty', 'F&B Qty', 'Finishing', 'Waste'];
        const tableRows = rows.map((row, index) => [
            index + 1,
            clientMap.get(row.client_id) || '',
            row.job_reference,
            itemMap.get(row.material_sku) || '',
            row.designing_charges,
            row.ss_qty,
            row.fb_qty,
            row.finishing,
            row.waste
        ]);
        
        const totalsRow = [
          'Total', '', '', '',
          columnTotals['designing_charges'],
          columnTotals['ss_qty'],
          columnTotals['fb_qty'],
          columnTotals['finishing'],
          columnTotals['waste'],
        ];
        tableRows.push(totalsRow);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 42,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [243, 111, 33] },
        });

        doc.save(`daily_entry_${date}.pdf`);
    };
    
    const getBorderStyle = () => {
        switch (matchStatus) {
            case 'match': return 'border-green-500';
            case 'mismatch': return 'border-red-500';
            default: return 'border-gray-300';
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-40 md:pb-8">
            <h1 className="text-4xl font-bold text-brand-blue hidden md:block">Daily Entry</h1>
            
            {/* Header Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
                <div>
                    <label className="block text-md font-semibold text-gray-700 mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg text-black bg-white" />
                </div>
                <div>
                    <label className="block text-md font-semibold text-gray-700 mb-1">Day</label>
                    <input type="text" value={day} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-lg text-black" />
                </div>
                <div>
                    <label className="block text-md font-semibold text-gray-700 mb-1">Start Reading</label>
                    <input type="number" value={machineStartReading} onChange={e => setMachineStartReading(Number(e.target.value))} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg text-black bg-white" />
                </div>
                <div>
                    <label className="block text-md font-semibold text-gray-700 mb-1">End Reading</label>
                    <input type="number" value={machineEndReading} onChange={e => setMachineEndReading(Number(e.target.value))} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg text-black bg-white" />
                </div>
                 <div className="relative">
                    <label className="block text-md font-semibold text-gray-700 mb-1">Machine Production</label>
                    <input type="number" value={machineProduction} readOnly className={`w-full px-4 py-3 border-2 rounded-md bg-gray-100 text-lg font-bold text-black ${getBorderStyle()}`} />
                </div>
                <div className="relative">
                    <label className="block text-md font-semibold text-gray-700 mb-1">Total Impressions</label>
                    <input type="number" value={totalImpressions} readOnly className={`w-full px-4 py-3 border-2 rounded-md bg-gray-100 text-lg font-bold text-black ${getBorderStyle()}`} />
                    {matchStatus === 'match' && <div className="absolute -bottom-5 left-0 text-sm text-green-600 font-semibold">✓ Counts Match</div>}
                    {matchStatus === 'mismatch' && <div className="absolute -bottom-5 left-0 text-sm text-red-600 font-semibold">✗ Mismatch!</div>}
                </div>
            </div>

            {/* Line Items Table for Desktop */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-lg whitespace-nowrap">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="p-3 text-left font-semibold text-gray-600">No.</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Client Name</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Job Reference</th>
                                <th className="p-3 text-left font-semibold text-gray-600">Material</th>
                                {DAILY_ROW_COLUMNS.map(c => <th key={c.key} className="p-3 text-left font-semibold text-gray-600">{c.label}</th>)}
                                {userRole === 'Admin' && <th className="p-3 text-left font-semibold text-gray-600">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {rows.map((row, index) => (
                               <tr key={index} className="align-middle">
                                   <td className="p-2">{index + 1}</td>
                                   <td className="p-2 min-w-[250px]">
                                       <div className="flex items-center gap-2">
                                           <select value={row.client_id} onChange={e => handleRowChange(index, 'client_id', Number(e.target.value))} className="w-full px-2 py-3 border border-gray-300 rounded-md text-lg text-black bg-white">
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                           </select>
                                           <button onClick={() => setIsClientModalOpen(true)} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 text-lg font-bold text-black">+</button>
                                       </div>
                                   </td>
                                   <td className="p-2"><input type="text" value={row.job_reference} readOnly className="w-full px-2 py-3 border border-gray-300 rounded-md text-lg bg-gray-100 text-black" /></td>
                                   <td className="p-2 min-w-[250px]">
                                       <select value={row.material_sku} onChange={e => handleRowChange(index, 'material_sku', e.target.value)} className="w-full px-2 py-3 border border-gray-300 rounded-md text-lg text-black bg-white">
                                            {items.map(i => <option key={i.sku} value={i.sku}>{i.name}</option>)}
                                       </select>
                                   </td>
                                   {DAILY_ROW_COLUMNS.map(c => (
                                       <td key={c.key} className="p-2">
                                           <input type="number" min="0" value={row[c.key as keyof DailyRowInput]} onChange={e => handleRowChange(index, c.key as keyof DailyRowInput, Number(e.target.value))} className="w-32 px-2 py-3 border border-gray-300 rounded-md text-lg text-black bg-white" />
                                       </td>
                                   ))}
                                   {userRole === 'Admin' && 
                                   <td className="p-2">
                                       <button onClick={() => removeRow(index)} className="text-red-500 hover:text-red-700 p-2">
                                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                       </button>
                                   </td>
                                   }
                               </tr>
                           ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold sticky bottom-0">
                            <tr>
                                <td className="p-3 text-gray-900" colSpan={4}>Total</td>
                                {DAILY_ROW_COLUMNS.map(c => (
                                    <td key={c.key} className="p-3 text-gray-900">{columnTotals[c.key as keyof DailyRowInput] ?? 0}</td>
                                ))}
                                {userRole === 'Admin' && <td className="p-3"></td>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* NEW Compact List for Mobile */}
            <div className="block md:hidden space-y-3">
                {rows.map((row, index) => (
                    <div key={index} onClick={() => handleOpenEditModal(index)} className="bg-white p-3 rounded-lg shadow flex justify-between items-center cursor-pointer active:bg-gray-100">
                        <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-gray-800 truncate">#{index + 1} - {clients.find(c => c.id === row.client_id)?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{row.job_reference}</p>
                        </div>
                        <div className="text-right ml-2">
                           <p className="font-semibold text-gray-700">SS: {row.ss_qty}, F&B: {row.fb_qty}</p>
                           <p className="text-sm text-gray-500">Waste: {row.waste}</p>
                        </div>
                    </div>
                ))}
                {rows.length === 0 && <p className="text-center text-gray-500 py-8">No jobs added for this day.</p>}
            </div>


            {/* Actions */}
             <div className="mt-6">
                {/* Desktop Actions */}
                <div className="hidden md:flex bg-white p-4 rounded-lg shadow-lg justify-between items-center gap-4">
                    <button onClick={addRow} className="px-6 py-3 text-lg font-medium text-brand-orange border-2 border-brand-orange rounded-md hover:bg-orange-50">
                        + Add Row
                    </button>
                    <div className="flex gap-4">
                        <button onClick={() => handleExport('pdf')} className="px-6 py-3 text-lg font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Export as PDF</button>
                        <button onClick={() => handleExport('csv')} className="px-6 py-3 text-lg font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Export as CSV</button>
                        <button onClick={handleSave} className="px-10 py-3 text-lg font-bold text-white bg-brand-orange rounded-md hover:bg-opacity-90 shadow-lg">
                            Save Day
                        </button>
                    </div>
                </div>

                {/* Mobile Sticky Footer Actions */}
                <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white p-2 border-t border-gray-200 shadow-lg grid grid-cols-2 gap-2 z-20">
                    <button onClick={() => handleExport('pdf')} className="w-full px-4 py-3 text-md font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Export PDF</button>
                    <button onClick={() => handleExport('csv')} className="w-full px-4 py-3 text-md font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Export CSV</button>
                    <button onClick={handleSave} className="col-span-2 w-full px-10 py-3 text-lg font-bold text-white bg-brand-orange rounded-md hover:bg-opacity-90 shadow-lg">
                        Save Day
                    </button>
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            <button
                onClick={handleOpenAddModal}
                className="md:hidden fixed bottom-36 right-4 bg-brand-orange text-white rounded-full p-0 w-16 h-16 shadow-lg z-30 flex items-center justify-center text-4xl font-light"
                aria-label="Add New Job"
            >
                +
            </button>
            
            <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Quick Add Client">
                <QuickClientForm onSave={handleQuickClientAdd} onCancel={() => setIsClientModalOpen(false)} />
            </Modal>

            <DailyRowFormModal
                isOpen={isRowModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveRow}
                onDelete={handleDeleteRowFromModal}
                rowData={editingRow?.row || null}
                rowIndex={editingRow?.index ?? null}
                clients={clients}
                items={items}
                userRole={userRole}
            />

        </div>
    );
};

export default DailyEntryScreen;