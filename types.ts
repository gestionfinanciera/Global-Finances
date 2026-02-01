
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

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string; // Account ID
  creditAccount: string; // Account ID
  amount: number;
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
  reminders: Reminder[];
  language: Language;
  theme: 'light' | 'dark';
  isOnboarded: boolean;
}
