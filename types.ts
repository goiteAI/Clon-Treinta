import type { ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl: string;
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
  id: string;
  name: string;
  phone: string;
}

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    logoUrl: string;
}

export type Page = 'dashboard' | 'sales' | 'inventory' | 'expenses' | 'contacts' | 'settings' | 'debts';

export interface AppContextType {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  contacts: Contact[];
  companyInfo: CompanyInfo;
  resetData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  updateCompanyInfo: (info: CompanyInfo) => Promise<void>;
  addPayment: (transactionId: string, amount: number) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface AppProviderProps {
  children: ReactNode;
}