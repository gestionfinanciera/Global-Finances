
import { Account, AccountType } from './types';

export const CHART_OF_ACCOUNTS: Account[] = [
  { id: 'acc_cash', name: 'Cash', type: AccountType.ASSET, description: 'Physical currency and petty cash.' },
  { id: 'acc_bank', name: 'Bank Account', type: AccountType.ASSET, description: 'Funds held in commercial banks.' },
  { id: 'acc_inventory', name: 'Inventory', type: AccountType.ASSET, description: 'Goods ready for sale.' },
  { id: 'acc_receivable', name: 'Accounts Receivable', type: AccountType.ASSET, description: 'Money owed by customers.' },
  { id: 'acc_payable', name: 'Accounts Payable', type: AccountType.LIABILITY, description: 'Money owed to suppliers.' },
  { id: 'acc_loans', name: 'Loans', type: AccountType.LIABILITY, description: 'Bank loans and debts.' },
  { id: 'acc_equity', name: 'Owner Capital', type: AccountType.EQUITY, description: 'Initial investment and retained earnings.' },
  { id: 'acc_sales', name: 'Sales Revenue', type: AccountType.INCOME, description: 'Earnings from product sales.' },
  { id: 'acc_services', name: 'Service Income', type: AccountType.INCOME, description: 'Earnings from consulting or labor.' },
  { id: 'acc_rent', name: 'Rent Expense', type: AccountType.EXPENSE, description: 'Cost of workspace or housing.' },
  { id: 'acc_utilities', name: 'Utilities', type: AccountType.EXPENSE, description: 'Water, electricity, internet.' },
  { id: 'acc_supplies', name: 'Office Supplies', type: AccountType.EXPENSE, description: 'Paper, ink, consumables.' },
  { id: 'acc_salaries', name: 'Salaries', type: AccountType.EXPENSE, description: 'Employee or self-pay.' },
  { id: 'acc_other_exp', name: 'Miscellaneous Expenses', type: AccountType.EXPENSE, description: 'Other business or personal costs.' },
];
