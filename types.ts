
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
  amount: number; // Total amount (Sum of debits)
  
  // Simple entry fields (kept for backward compatibility and simple forms)
  debitAccount?: string; 
  creditAccount?: string;
  
  // Multi-line support
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
  accountId: string; // Map budget to an account (usually Expense)
  budgeted: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  categories: BudgetCategory[];
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
  reminders: Reminder[];
  language: Language;
  theme: 'light' | 'dark';
  isOnboarded: boolean;
}
