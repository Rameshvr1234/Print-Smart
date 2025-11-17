import { Client, Item, DailyHeader, DailyRow, DailyRowInput, ReportData } from '../types';

// --- Helper Functions ---
const get = <T,>(key: string, defaultValue: T): T => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
};

const set = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getNextId = (key: string): number => {
    const nextId = get<number>(key, 1);
    set(key, nextId + 1);
    return nextId;
}

// --- Initialization ---
const initDatabase = () => {
  if (!localStorage.getItem('clients')) {
    set<Client[]>('clients', [
      { id: getNextId('client_id_counter'), name: 'Prime Graphics', phone: '123-456-7890', billing_name: 'Prime Graphics Inc.', is_active: true },
      { id: getNextId('client_id_counter'), name: 'Creative Solutions', phone: '098-765-4321', billing_name: 'Creative Solutions LLC', is_active: true },
    ]);
  }
  if (!localStorage.getItem('items')) {
    set<Item[]>('items', [
        { sku: 'PAP-001', name: 'A4 Paper 80gsm', uom: 'sheets', stock_qty: 5000, reorder_level: 1000, price: 2 },
        { sku: 'BRD-001', name: 'Art Board 300gsm', uom: 'sheets', stock_qty: 2000, reorder_level: 500, price: 10 },
        { sku: 'STK-001', name: 'Glossy Sticker A4', uom: 'sheets', stock_qty: 1500, reorder_level: 300, price: 15 },
        { sku: 'PVC-001', name: 'PVC Sticker', uom: 'sheets', stock_qty: 1000, reorder_level: 200, price: 25 },
    ]);
  }
  if (!localStorage.getItem('daily_headers')) {
    set<DailyHeader[]>('daily_headers', []);
  }
  if (!localStorage.getItem('daily_rows')) {
    set<DailyRow[]>('daily_rows', []);
  }
};

initDatabase();


// --- API Simulation ---

// GET /clients
export const getClients = (): Client[] => get<Client[]>('clients', []);

// POST /clients
export const addClient = (client: Omit<Client, 'id' | 'is_active'>): Client => {
    const clients = getClients();
    const newClient: Client = { ...client, id: getNextId('client_id_counter'), is_active: true };
    set('clients', [...clients, newClient]);
    return newClient;
};

// PATCH /clients/:id
export const updateClient = (updatedClient: Client): Client => {
    const clients = getClients();
    const index = clients.findIndex(c => c.id === updatedClient.id);
    if (index !== -1) {
        clients[index] = updatedClient;
        set('clients', clients);
        return updatedClient;
    }
    throw new Error('Client not found');
};


// GET /items
export const getItems = (): Item[] => get<Item[]>('items', []);

// POST /items
export const addItem = (item: Omit<Item, 'stock_qty'>): Item => {
    const items = getItems();
    if (items.some(i => i.sku === item.sku)) {
        throw new Error('SKU already exists');
    }
    const newItem: Item = { ...item, stock_qty: 0 };
    set('items', [...items, newItem]);
    return newItem;
};

// PATCH /items/:sku
export const updateItem = (updatedItem: Item): Item => {
    const items = getItems();
    const index = items.findIndex(i => i.sku === updatedItem.sku);
    if (index !== -1) {
        items[index] = updatedItem;
        set('items', items);
        return updatedItem;
    }
    throw new Error('Item not found');
};

// POST /daily
export const saveDailyEntry = (headerData: Omit<DailyHeader, 'id'>, rowsData: DailyRowInput[]) => {
    const headers = get<DailyHeader[]>('daily_headers', []);
    const allRows = get<DailyRow[]>('daily_rows', []);
    const items = getItems();

    const existingHeaderIndex = headers.findIndex(h => h.date === headerData.date);
    let headerId: number;

    // Create a mutable copy of items to work with, and a map for easy lookup
    const itemsToUpdate = JSON.parse(JSON.stringify(items)) as Item[];
    const itemMap = new Map(itemsToUpdate.map(i => [i.sku, i]));

    if (existingHeaderIndex > -1) {
        // --- UPDATE EXISTING ENTRY ---
        headerId = headers[existingHeaderIndex].id;
        headers[existingHeaderIndex] = { ...headers[existingHeaderIndex], ...headerData };
        
        const oldRows = allRows.filter(r => r.header_id === headerId);

        // 1. Revert old stock usage by adding it back to inventory
        oldRows.forEach(row => {
            const item = itemMap.get(row.material_sku);
            if (item) {
                const totalUsed = row.ss_qty + row.fb_qty + row.waste;
                item.stock_qty += totalUsed;
            }
        });

        // 2. Apply new stock usage by deducting it from inventory
        rowsData.forEach(row => {
            const item = itemMap.get(row.material_sku);
            if(item) {
                const totalUsed = row.ss_qty + row.fb_qty + row.waste;
                item.stock_qty -= totalUsed;
            }
        });

    } else {
        // --- CREATE NEW ENTRY ---
        headerId = getNextId('daily_header_id_counter');
        const newHeader: DailyHeader = { ...headerData, id: headerId };
        headers.push(newHeader);
        
        // Deduct stock for the new entry
        rowsData.forEach(row => {
            const item = itemMap.get(row.material_sku);
            if(item) {
                const totalUsed = row.ss_qty + row.fb_qty + row.waste;
                item.stock_qty -= totalUsed;
            }
        });
    }

    // Save the updated stock quantities
    set('items', itemsToUpdate);

    // --- REPLACE ROWS FOR THE DAY & SAVE ---
    const otherDaysRows = allRows.filter(r => r.header_id !== headerId);
    const newRowsForDay: DailyRow[] = rowsData.map((rowData, index) => ({
        ...rowData,
        id: getNextId('daily_row_id_counter'),
        header_id: headerId,
        serial_no: index + 1,
        is_billed: false,
        bill_no: null,
    }));

    set('daily_headers', headers);
    set('daily_rows', [...otherDaysRows, ...newRowsForDay]);
};


// GET /daily?date=YYYY-MM-DD
export const getDailyEntry = (date: string): { header: DailyHeader | null, rows: DailyRow[] } => {
    const header = get<DailyHeader[]>('daily_headers', []).find(h => h.date === date) || null;
    if (!header) {
        return { header: null, rows: [] };
    }
    const rows = get<DailyRow[]>('daily_rows', []).filter(r => r.header_id === header.id);
    return { header, rows };
};

export const getLatestHeaderBefore = (date: string): DailyHeader | null => {
    const headers = get<DailyHeader[]>('daily_headers', []);
    const previousHeaders = headers
        .filter(h => h.date < date)
        .sort((a, b) => b.date.localeCompare(a.date)); // Sort descending by date
    
    return previousHeaders.length > 0 ? previousHeaders[0] : null;
}


// GET /report?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getReportData = (startDate: string, endDate: string): ReportData => {
    const headers = get<DailyHeader[]>('daily_headers', []);
    const allRows = get<DailyRow[]>('daily_rows', []);
    const allClients = getClients();
    const allItems = getItems();

    const clientMap = new Map(allClients.map(c => [c.id, c.name]));
    const itemMap = new Map(allItems.map(i => [i.sku, i.name]));

    const filteredHeaders = headers.filter(h => h.date >= startDate && h.date <= endDate);
    const headerMap = new Map(filteredHeaders.map(h => [h.id, h]));
    const filteredHeaderIds = new Set(filteredHeaders.map(h => h.id));
    
    const rows = allRows
        .filter(r => filteredHeaderIds.has(r.header_id))
        .map(r => ({ 
            ...r, 
            client_name: clientMap.get(r.client_id) || 'Unknown Client',
            material_name: itemMap.get(r.material_sku) || 'Unknown Material',
            date: headerMap.get(r.header_id)?.date || 'Unknown Date',
        }));

    let totalProductionValue = 0;
    let totalImpressions = 0;
    let totalWaste = 0;
    const clientJobCounts: { [key: number]: number } = {};

    rows.forEach(row => {
        totalWaste += row.waste;
        totalProductionValue += row.designing_charges + row.finishing;
        totalImpressions += row.ss_qty + (row.fb_qty * 2) + row.waste;
        clientJobCounts[row.client_id] = (clientJobCounts[row.client_id] || 0) + 1;
    });

    const topClients = Object.entries(clientJobCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([clientId, job_count]) => ({
            client_name: clientMap.get(Number(clientId)) || 'Unknown Client',
            job_count
        }));
    
    return { rows, totalProductionValue, totalImpressions, totalWaste, topClients };
};

// GET /accounts/jobs
export const getFinalizedJobs = (): (DailyRow & { client_name: string; date: string; material_name: string; })[] => {
    const headers = get<DailyHeader[]>('daily_headers', []);
    const allRows = get<DailyRow[]>('daily_rows', []);
    const allClients = getClients();
    const allItems = getItems();

    const clientMap = new Map(allClients.map(c => [c.id, c.name]));
    const itemMap = new Map(allItems.map(i => [i.sku, i.name]));
    const headerMap = new Map(headers.map(h => [h.id, h.date]));
    
    const jobs = allRows.map(row => ({
        ...row,
        client_name: clientMap.get(row.client_id) || 'Unknown Client',
        material_name: itemMap.get(row.material_sku) || 'Unknown Material',
        date: headerMap.get(row.header_id) || 'Unknown Date',
    }));

    // Only return jobs that have a valid, finalized header
    return jobs.filter(job => job.date !== 'Unknown Date');
};

// PATCH /accounts/jobs/:id
export const updateBillingInfo = (rowId: number, isBilled: boolean, billNo: string | null): void => {
    const allRows = get<DailyRow[]>('daily_rows', []);
    const rowIndex = allRows.findIndex(r => r.id === rowId);

    if (rowIndex > -1) {
        allRows[rowIndex].is_billed = isBilled;
        allRows[rowIndex].bill_no = billNo?.trim() ? billNo.trim() : null;
        set('daily_rows', allRows);
    } else {
        console.error('Daily row not found for billing update:', rowId);
    }
};