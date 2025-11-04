import type { ReactNode } from 'react';

export interface StockHistoryEntry {
  date: string; // ISO string
  change: number; // Positivo para entradas, negativo para salidas
  reason: 'initial' | 'adjustment' | 'sale' | 'sale_update' | 'sale_delete' | 'restock' | 'restock_update' | 'restock_delete';
  transactionId?: string;
  stockInId?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl: string;
  stockHistory: StockHistoryEntry[];
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  amount: number;
  date: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: number;
  items: TransactionItem[];
  totalAmount: number;
  date: string; // ISO string
  paymentMethod: 'Efectivo' | 'Crédito' | 'Transferencia';
  contactId?: string;
  dueDate?: string; // ISO string
  payments?: Payment[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string
}

export interface Contact {
  id:string;
  name: string;
  phone: string;
  nextInvoiceNumber: number;
}

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    phone2: string;
    logoUrl: string;
}

export interface StockInEntryItem {
  productId: string;
  quantity: number;
}

export interface StockInEntry {
  id: string;
  date: string; // ISO string
  reference?: string;
  items: StockInEntryItem[];
}

export type Page = 'dashboard' | 'sales' | 'inventory' | 'expenses' | 'clients' | 'settings' | 'debts';

export interface AppContextType {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  contacts: Contact[];
  companyInfo: CompanyInfo;
  stockInEntries: StockInEntry[];
  resetData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'stockHistory'>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'invoiceNumber'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'nextInvoiceNumber'>) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  updateCompanyInfo: (info: CompanyInfo) => Promise<void>;
  addPayment: (transactionId: string, amount: number) => Promise<void>;
  updatePayment: (transactionId: string, paymentIndex: number, newAmount: number) => Promise<void>;
  deletePayment: (transactionId: string, paymentIndex: number) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  addStockInEntry: (entry: Omit<StockInEntry, 'id'>) => Promise<void>;
  updateStockInEntry: (entry: StockInEntry) => Promise<void>;
  deleteStockInEntry: (entryId: string) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: (newTheme?: 'light' | 'dark') => void;
  salesUnitCorrection: number;
  updateSalesUnitCorrection: (newCorrection: number) => Promise<void>;
  importData: (data: any) => Promise<void>;
}

export interface AppProviderProps {
  children: ReactNode;
}