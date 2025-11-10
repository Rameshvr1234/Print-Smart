export interface Client {
  id: number;
  name: string;
  phone?: string;
  billing_name?: string;
  is_active: boolean;
}

export interface Item {
  sku: string;
  name: string;
  uom: string;
  stock_qty: number;
  reorder_level: number;
}

export interface DailyHeader {
  id: number;
  date: string; // YYYY-MM-DD
  day_name: string;
  total_impressions: number;
  machine_start_reading: number;
  machine_end_reading: number;
}

export interface DailyRow {
  id: number;
  header_id: number;
  serial_no: number;
  client_id: number;
  job_reference: string;
  designing_charges: number;
  material_sku: string;
  ss_qty: number; // Single-side quantity
  fb_qty: number; // Front-and-back quantity
  finishing: number;
  waste: number;
}

export type DailyRowInput = Omit<DailyRow, 'id' | 'header_id' | 'serial_no'>;

export interface ReportData {
  rows: (DailyRow & { client_name: string; material_name: string; date: string; })[];
  totalProductionValue: number;
  totalImpressions: number;
  totalWaste: number;
  topClients: { client_name: string, job_count: number }[];
}

export type UserRole = 'Admin' | 'Designer';