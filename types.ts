
export enum Language {
  ES = 'es',
  EN = 'en',
  PT = 'pt',
  FR = 'fr'
}

export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

// Added PartnerType to support client/provider classification
export type PartnerType = 'client' | 'provider';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  description: string;
}

export interface JournalEntryPart {
  accountId: string;
  amount: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  debitAccount?: string; 
  creditAccount?: string;
  debitParts?: JournalEntryPart[];
  creditParts?: JournalEntryPart[];
}

export interface CashFlowItem {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
  isRecurring: boolean;
  status: 'pending' | 'realized';
}

export interface MonthlyBudget {
  month: string;
  categories: {
    accountId: string;
    budgeted: number;
  }[];
}

/**
 * Ajustado para coincidir con la tabla 'clients' de Supabase
 * Expandido para soportar los campos requeridos por PartnerForm
 */
export interface Partner {
  id: string;
  type?: PartnerType;
  name: string;
  description?: string | null;
  fantasyName?: string;
  taxId?: string;
  taxCondition?: string;
  email?: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
  creditDays?: number;
  observations?: string;
  active?: boolean;
  created_at?: string;
}

/**
 * Nueva interfaz para coincidir con la tabla 'projects' de Supabase
 */
export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  created_at?: string;
}

export interface PartnerMovement {
  id: string;
  partnerId: string;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note';
  documentNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  observations?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface TaxConfig {
  id: string;
  name: string;
  fullName: string;
  category: 'national' | 'provincial' | 'municipal';
  frequency: 'monthly' | 'bimonthly' | 'annual';
  defaultRate: number;
  dueDateDay: number;
}

export interface TaxObligation {
  id: string;
  taxId: string;
  period: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  receiptUrl?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  imageUrl?: string;
  cost: number;
  price: number;
  stockActual: number;
  stockMin: number;
  stockMax: number;
  reorderPoint: number;
  location?: {
    warehouse: string;
    shelf: string;
    row: string;
  };
  supplierId?: string;
  active: boolean;
  alertOnLowStock: boolean;
}

export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';

export interface StockMovement {
  id: string;
  date: string;
  time: string;
  productId: string;
  type: MovementType;
  qtyIn: number;
  qtyOut: number;
  resultingStock: number;
  unitCost: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
}

export interface AppState {
  entries: JournalEntry[];
  cashFlowItems: CashFlowItem[];
  budgets: MonthlyBudget[];
  partners: Partner[];
  projects: Project[]; // Nueva sección
  partnerMovements: PartnerMovement[];
  taxConfigs: TaxConfig[];
  taxObligations: TaxObligation[];
  products: Product[];
  stockMovements: StockMovement[];
  language: Language;
  theme: 'light' | 'dark';
  isOnboarded: boolean;
}
