import { DailyRowInput } from './types';

export enum Screen {
  DailyEntry = 'Daily Entry',
  Clients = 'Clients',
  ItemsStock = 'Items / Stock',
  Reports = 'Reports',
  Accounts = 'Accounts',
  Dashboard = 'Dashboard',
}

export const DAILY_ROW_NUMERIC_FIELDS: (keyof Omit<DailyRowInput, 'material_sku' | 'job_reference' | 'client_id'>)[] = [
    'designing_charges', 'ss_qty', 'fb_qty', 'finishing', 'waste'
];

export const DAILY_ROW_COLUMNS: {key: keyof DailyRowInput, label: string}[] = [
    { key: 'designing_charges', label: 'Designing Charges' },
    { key: 'ss_qty', label: 'SS Qty' },
    { key: 'fb_qty', label: 'F&B Qty' },
    { key: 'finishing', label: 'Finishing' },
    { key: 'waste', label: 'Waste' },
];

export const CLICK_CHARGE = 3.65 * 1.18; // 3.65 + 18% tax
