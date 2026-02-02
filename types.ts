
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

export interface BudgetCategory {
  accountId: string;
  budgeted: number;
}

export interface MonthlyBudget {
  month: string;
  categories: BudgetCategory[];
}

// --- Nuevos Tipos para Clientes y Proveedores ---
export type PartnerType = 'client' | 'supplier';

export interface Partner {
  id: string;
  type: PartnerType;
  name: string;
  fantasyName?: string;
  taxId: string; // CUIT/CUIL
  taxCondition: string;
  address?: string;
  city?: string;
  phone?: string;
  email: string;
  contactPerson?: string;
  creditLimit: number;
  creditDays: number;
  observations?: string;
  active: boolean;
}

export interface PartnerMovement {
  id: string;
  partnerId: string;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note';
  documentNumber: string;
  date: string;
  dueDate: string;
  amount: number; // Monto absoluto
  observations?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  amount: number;
  isPaid: boolean;
}

export interface AppState {
  entries: JournalEntry[];
  cashFlowItems: CashFlowItem[];
  budgets: MonthlyBudget[];
  partners: Partner[];
  partnerMovements: PartnerMovement[];
  reminders: Reminder[];
  language: Language;
  theme: 'light' | 'dark';
  isOnboarded: boolean;
}
