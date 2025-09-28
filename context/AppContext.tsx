import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AppContextType,
  AppProviderProps,
  Product,
  Transaction,
  Expense,
  Contact,
  CompanyInfo,
} from '../types';

// Initial Data for demonstration (used only if localStorage is empty)
const initialProducts: Product[] = [
  { id: 'prod1', name: 'Coca-Cola 350ml', price: 2500, cost: 1500, stock: 100, imageUrl: 'https://picsum.photos/id/10/200' },
  { id: 'prod2', name: 'Papas Margarita Pollo', price: 2000, cost: 1200, stock: 80, imageUrl: 'https://picsum.photos/id/20/200' },
  { id: 'prod3', name: 'Chocoramo', price: 1800, cost: 1000, stock: 120, imageUrl: 'https://picsum.photos/id/30/200' },
  { id: 'prod4', name: 'Jumbo Jet', price: 3000, cost: 1800, stock: 50, imageUrl: 'https://picsum.photos/id/40/200' },
  { id: 'prod5', name: 'Agua Cristal 600ml', price: 1500, cost: 800, stock: 200, imageUrl: 'https://picsum.photos/id/50/200' },
];

const initialContacts: Contact[] = [
    { id: 'cont1', name: 'Cliente Frecuente 1', phone: '3001234567' },
    { id: 'cont2', name: 'Vecino Tienda', phone: '3109876543' },
];

const initialTransactions: Transaction[] = [
  {
    id: 'trans1',
    items: [{ productId: 'prod1', quantity: 2, unitPrice: 2500 }, { productId: 'prod2', quantity: 1, unitPrice: 2000 }],
    totalAmount: 7000,
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    paymentMethod: 'Efectivo',
    contactId: 'cont1'
  },
  {
    id: 'trans2',
    items: [{ productId: 'prod3', quantity: 5, unitPrice: 1800 }],
    totalAmount: 9000,
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    paymentMethod: 'Crédito',
    contactId: 'cont2',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    payments: [{ amount: 4000, date: new Date().toISOString()}]
  },
];

const initialExpenses: Expense[] = [
  { id: 'exp1', description: 'Arriendo Local', amount: 500000, category: 'Alquiler', date: new Date(new Date().setDate(1)).toISOString() },
  { id: 'exp2', description: 'Factura de Luz', amount: 120000, category: 'Servicios', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
];

const initialCompanyInfo: CompanyInfo = {
    name: "Mi Tiendita de Barrio",
    address: "Calle Falsa 123, Bogotá",
    phone: "3000000000",
    logoUrl: ""
};


// Custom hook to manage state with localStorage persistence
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = usePersistentState<Product[]>('treinta-products', initialProducts);
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('treinta-transactions', initialTransactions);
  const [expenses, setExpenses] = usePersistentState<Expense[]>('treinta-expenses', initialExpenses);
  const [contacts, setContacts] = usePersistentState<Contact[]>('treinta-contacts', initialContacts);
  const [companyInfo, setCompanyInfo] = usePersistentState<CompanyInfo>('treinta-companyInfo', initialCompanyInfo);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const resetData = async () => {
    if (window.confirm("¿Estás seguro de que quieres borrar todos tus datos y empezar de nuevo? Esta acción no se puede deshacer.")) {
        localStorage.removeItem('treinta-products');
        localStorage.removeItem('treinta-transactions');
        localStorage.removeItem('treinta-expenses');
        localStorage.removeItem('treinta-contacts');
        localStorage.removeItem('treinta-companyInfo');
        window.location.reload();
    }
  }

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: `prod_${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: `trans_${Date.now()}` };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    const updatedProducts = products.map(p => {
        const item = transaction.items.find(i => i.productId === p.id);
        if (item) return { ...p, stock: p.stock - item.quantity };
        return p;
    });
    setProducts(updatedProducts);
  };
  
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: `exp_${Date.now()}` };
    setExpenses(prev => [...prev, newExpense].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: `cont_${Date.now()}` };
    setContacts(prev => [...prev, newContact]);
  };
  
  const updateCompanyInfo = async (info: CompanyInfo) => {
    setCompanyInfo(info);
  };
  
  const addPayment = async (transactionId: string, amount: number) => {
    const newPayment = { amount, date: new Date().toISOString() };
    setTransactions(prev => prev.map(t => 
        t.id === transactionId ? { ...t, payments: [...(t.payments || []), newPayment] } : t
    ));
  };
  
  const updateProductStock = async (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const updateProduct = async (product: Product) => {
    const { id } = product;
    setProducts(prev => prev.map(p => p.id === id ? product : p));
  };

  const deleteProduct = async (productId: string) => {
      setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const value = {
    products,
    transactions,
    expenses,
    contacts,
    companyInfo,
    resetData,
    addProduct,
    addTransaction,
    addExpense,
    addContact,
    updateCompanyInfo,
    addPayment,
    updateProductStock,
    updateProduct,
    deleteProduct,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};