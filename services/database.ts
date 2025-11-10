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
        { sku: 'PAP-001', name: 'A4 Paper 80gsm', uom: 'sheets', stock_qty: 5000, reorder_level: 1000 },
        { sku: 'BRD-001', name: 'Art Board 300gsm', uom: 'sheets', stock_qty: 2000, reorder_level: 500 },
        { sku: 'STK-001', name: 'Glossy Sticker A4', uom: 'sheets', stock_qty: 1500, reorder_level: 300 },
        { sku: 'PVC-001', name: 'PVC Sticker', uom: 'sheets', stock_qty: 1000, reorder_level: 200 },
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
    const rows = get<DailyRow[]>('daily_rows', []);

    // Check if a header for this date already exists and remove its old rows
    const existingHeaderIndex = headers.findIndex(h => h.date === headerData.date);
    let newHeaderId;

    if (existingHeaderIndex > -1) {
        newHeaderId = headers[existingHeaderIndex].id;
        // Update header
        headers[existingHeaderIndex] = { ...headers[existingHeaderIndex], ...headerData };
        // Filter out old rows associated with this header
        const updatedRows = rows.filter(r => r.header_id !== newHeaderId);
        set('daily_rows', updatedRows);

    } else {
        newHeaderId = getNextId('daily_header_id_counter');
        const newHeader: DailyHeader = { ...headerData, id: newHeaderId };
        headers.push(newHeader);
    }

    const currentRows = get<DailyRow[]>('daily_rows', []);
    const newRows: DailyRow[] = rowsData.map((rowData, index) => ({
        ...rowData,
        id: getNextId('daily_row_id_counter'),
        header_id: newHeaderId,
        serial_no: index + 1,
    }));
    
    set('daily_headers', headers);
    set('daily_rows', [...currentRows, ...newRows]);

    // Deduct stock based on material usage
    const items = getItems();
    const itemUsage = new Map<string, number>();
    newRows.forEach(row => {
        const totalUsed = row.ss_qty + row.fb_qty + row.waste; // Assuming waste is also from the same material
        itemUsage.set(row.material_sku, (itemUsage.get(row.material_sku) || 0) + totalUsed);
    });
    
    const updatedItems = items.map(item => {
        if(itemUsage.has(item.sku)) {
            return { ...item, stock_qty: item.stock_qty - (itemUsage.get(item.sku) as number) };
        }
        return item;
    });
    set('items', updatedItems);
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
