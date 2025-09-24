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

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // In a real app, this would be a secure hash. Here it's plain text for simulation.
}

export type Page = 'dashboard' | 'sales' | 'inventory' | 'expenses' | 'contacts' | 'settings' | 'debts';

export interface AppContextType {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  contacts: Contact[];
  companyInfo: CompanyInfo;
  currentUser: User | null | undefined; // undefined means we are checking session
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
  addPayment: (transactionId: string, amount: number) => void;
  updateProductStock: (productId: string, newStock: number) => void;
}

export interface AppProviderProps {
  children: ReactNode;
}
