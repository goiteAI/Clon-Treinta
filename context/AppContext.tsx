import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AppContextType,
  AppProviderProps,
  Product,
  Transaction,
  Expense,
  Contact,
  CompanyInfo,
  StockInEntry,
} from '../types';

// Initial Data for demonstration (used only if localStorage is empty)
const initialProducts: Product[] = [
  { id: 'prod1', name: 'Coca-Cola 350ml', price: 2500, cost: 1500, stock: 100, imageUrl: 'https://picsum.photos/id/10/200', stockHistory: [{ date: new Date().toISOString(), change: 100, reason: 'initial'}] },
  { id: 'prod2', name: 'Papas Margarita Pollo', price: 2000, cost: 1200, stock: 80, imageUrl: 'https://picsum.photos/id/20/200', stockHistory: [{ date: new Date().toISOString(), change: 80, reason: 'initial'}] },
  { id: 'prod3', name: 'Chocoramo', price: 1800, cost: 1000, stock: 120, imageUrl: 'https://picsum.photos/id/30/200', stockHistory: [{ date: new Date().toISOString(), change: 120, reason: 'initial'}] },
  { id: 'prod4', name: 'Jumbo Jet', price: 3000, cost: 1800, stock: 50, imageUrl: 'https://picsum.photos/id/40/200', stockHistory: [{ date: new Date().toISOString(), change: 50, reason: 'initial'}] },
  { id: 'prod5', name: 'Agua Cristal 600ml', price: 1500, cost: 800, stock: 200, imageUrl: 'https://picsum.photos/id/50/200', stockHistory: [{ date: new Date().toISOString(), change: 200, reason: 'initial'}] },
];

const initialContacts: Contact[] = [
    { id: 'cont1', name: 'Cliente Frecuente 1', phone: '3001234567', nextInvoiceNumber: 2 },
    { id: 'cont2', name: 'Vecino Tienda', phone: '3109876543', nextInvoiceNumber: 1 },
];

const initialTransactions: Transaction[] = [
  { id: 'trans1', invoiceNumber: 1, items: [{ productId: 'prod1', quantity: 2, unitPrice: 2500 }, { productId: 'prod2', quantity: 1, unitPrice: 2000 }], totalAmount: 7000, date: new Date(Date.now() - 86400000).toISOString(), paymentMethod: 'Efectivo', contactId: 'cont1' },
  { id: 'trans2', invoiceNumber: 2, items: [{ productId: 'prod3', quantity: 5, unitPrice: 1800 }], totalAmount: 9000, date: new Date().toISOString(), paymentMethod: 'Crédito', contactId: 'cont2', dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), payments: [{ amount: 4000, date: new Date().toISOString() }] },
];

const initialExpenses: Expense[] = [
  { id: 'exp1', description: 'Arriendo local', amount: 500000, category: 'Alquiler', date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'exp2', description: 'Recibo de la luz', amount: 80000, category: 'Servicios', date: new Date().toISOString() },
];

const initialCompanyInfo: CompanyInfo = {
    name: "Mi Tiendita",
    address: "Calle Falsa 123, Springfield",
    phone: "300-000-0000",
    phone2: "",
    logoUrl: ""
};

const initialStockInEntries: StockInEntry[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
    const [stockInEntries, setStockInEntries] = useState<StockInEntry[]>([]);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [salesUnitCorrection, setSalesUnitCorrection] = useState(0);

  useEffect(() => {
    const loadData = () => {
        try {
            const storedProducts = localStorage.getItem('products');
            setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts);

            const storedTransactions = localStorage.getItem('transactions');
            setTransactions(storedTransactions ? JSON.parse(storedTransactions) : initialTransactions);

            const storedExpenses = localStorage.getItem('expenses');
            setExpenses(storedExpenses ? JSON.parse(storedExpenses) : initialExpenses);
            
            const storedContacts = localStorage.getItem('contacts');
            setContacts(storedContacts ? JSON.parse(storedContacts) : initialContacts);
            
            const storedCompanyInfo = localStorage.getItem('companyInfo');
            setCompanyInfo(storedCompanyInfo ? JSON.parse(storedCompanyInfo) : initialCompanyInfo);
            
            const storedStockInEntries = localStorage.getItem('stockInEntries');
            setStockInEntries(storedStockInEntries ? JSON.parse(storedStockInEntries) : []);
            
            const storedTheme = localStorage.getItem('theme');
            const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
            setTheme(initialTheme);

            const storedCorrection = localStorage.getItem('salesUnitCorrection');
            setSalesUnitCorrection(storedCorrection ? JSON.parse(storedCorrection) : 0);
        } catch (error) {
            console.error("Error loading data from localStorage:", error);
            // Fallback to initial data if localStorage is corrupted
            setProducts(initialProducts);
            setTransactions(initialTransactions);
            setExpenses(initialExpenses);
            setContacts(initialContacts);
            setCompanyInfo(initialCompanyInfo);
            setStockInEntries(initialStockInEntries);
            setTheme('light');
            setSalesUnitCorrection(0);
        }
    };
    loadData();
  }, []);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const saveData = <T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
      localStorage.setItem(key, JSON.stringify(data));
      setter(data);
  };
  
  const resetData = async () => {
      saveData('products', initialProducts, setProducts);
      saveData('transactions', initialTransactions, setTransactions);
      saveData('expenses', initialExpenses, setExpenses);
      saveData('contacts', initialContacts, setContacts);
      saveData('companyInfo', initialCompanyInfo, setCompanyInfo);
      saveData('stockInEntries', initialStockInEntries, setStockInEntries);
      saveData('salesUnitCorrection', 0, setSalesUnitCorrection);
      toggleTheme('light');
  };

  const importData = async (data: any) => {
    // Basic validation
    if (!data.products || !data.transactions || !data.companyInfo) {
      throw new Error("El archivo de importación es inválido o está corrupto.");
    }
    saveData('products', data.products, setProducts);
    saveData('transactions', data.transactions, setTransactions);
    saveData('expenses', data.expenses || [], setExpenses);
    saveData('contacts', data.contacts || [], setContacts);
    saveData('companyInfo', data.companyInfo, setCompanyInfo);
    saveData('stockInEntries', data.stockInEntries || [], setStockInEntries);
    saveData('salesUnitCorrection', data.salesUnitCorrection || 0, setSalesUnitCorrection);
    toggleTheme(data.theme || 'light');
  };

  const toggleTheme = (newTheme?: 'light' | 'dark') => {
    setTheme(prevTheme => newTheme || (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  // --- Products ---
  const addProduct = async (product: Omit<Product, 'id' | 'stockHistory'>) => {
    const newProduct: Product = { 
        ...product, 
        id: `prod${Date.now()}`,
        stockHistory: [{ date: new Date().toISOString(), change: product.stock, reason: 'initial' }]
    };
    saveData('products', [...products, newProduct], setProducts);
  };
  
  const updateProduct = async (product: Product) => {
    saveData('products', products.map(p => p.id === product.id ? product : p), setProducts);
  };

  const deleteProduct = async (productId: string) => {
    saveData('products', products.filter(p => p.id !== productId), setProducts);
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const change = newStock - product.stock;
    
    const newHistoryEntry = { date: new Date().toISOString(), change, reason: 'adjustment' as const };

    const updatedProduct = {
        ...product,
        stock: newStock,
        stockHistory: [...product.stockHistory, newHistoryEntry]
    };
    saveData('products', products.map(p => p.id === productId ? updatedProduct : p), setProducts);
  };

  // --- Transactions ---
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'invoiceNumber'>) => {
      const nextInvoiceNumber = (Math.max(0, ...transactions.map(t => t.invoiceNumber)) || 0) + 1;
      const newTransaction: Transaction = { ...transaction, id: `trans${Date.now()}`, invoiceNumber: nextInvoiceNumber };

      // Update stock
      const updatedProducts = products.map(p => {
          const itemInTransaction = transaction.items.find(item => item.productId === p.id);
          if (itemInTransaction) {
              const change = -itemInTransaction.quantity;
              const newHistoryEntry = {
                  date: newTransaction.date,
                  change: change,
                  reason: 'sale' as const,
                  transactionId: newTransaction.id
              };
              return {
                  ...p,
                  stock: p.stock + change,
                  stockHistory: [...p.stockHistory, newHistoryEntry]
              };
          }
          return p;
      });

      saveData('products', updatedProducts, setProducts);
      saveData('transactions', [...transactions, newTransaction], setTransactions);
  };
  
  const updateTransaction = async (transaction: Transaction) => {
    const originalTransaction = transactions.find(t => t.id === transaction.id);
    if (!originalTransaction) return;

    // Calculate stock changes
    const stockChanges = new Map<string, number>();

    // Revert original transaction quantities
    originalTransaction.items.forEach(item => {
        stockChanges.set(item.productId, (stockChanges.get(item.productId) || 0) + item.quantity);
    });
    // Apply new transaction quantities
    transaction.items.forEach(item => {
        stockChanges.set(item.productId, (stockChanges.get(item.productId) || 0) - item.quantity);
    });

    // Update products
    const updatedProducts = products.map(p => {
        if (stockChanges.has(p.id)) {
            const change = stockChanges.get(p.id)!;
            if (change !== 0) {
                 const newHistoryEntry = {
                    date: transaction.date,
                    change: change,
                    reason: 'sale_update' as const,
                    transactionId: transaction.id
                };
                return {
                    ...p,
                    stock: p.stock + change,
                    stockHistory: [...p.stockHistory, newHistoryEntry]
                };
            }
        }
        return p;
    });

    saveData('products', updatedProducts, setProducts);
    saveData('transactions', transactions.map(t => t.id === transaction.id ? transaction : t), setTransactions);
  };

  const deleteTransaction = async (transactionId: string) => {
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;

    // Restore stock
    const updatedProducts = products.map(p => {
        const itemInTransaction = transactionToDelete.items.find(item => item.productId === p.id);
        if (itemInTransaction) {
            const change = itemInTransaction.quantity;
             const newHistoryEntry = {
                date: new Date().toISOString(),
                change: change,
                reason: 'sale_delete' as const,
                transactionId: transactionToDelete.id
            };
            return {
                ...p,
                stock: p.stock + change,
                stockHistory: [...p.stockHistory, newHistoryEntry]
            };
        }
        return p;
    });

    saveData('products', updatedProducts, setProducts);
    saveData('transactions', transactions.filter(t => t.id !== transactionId), setTransactions);
  };

  // --- Expenses ---
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: `exp${Date.now()}`};
    saveData('expenses', [...expenses, newExpense], setExpenses);
  };

  const updateExpense = async (expense: Expense) => {
    saveData('expenses', expenses.map(e => e.id === expense.id ? expense : e), setExpenses);
  };

  const deleteExpense = async (expenseId: string) => {
    saveData('expenses', expenses.filter(e => e.id !== expenseId), setExpenses);
  };
  
  // --- Contacts ---
  const addContact = async (contact: Omit<Contact, 'id' | 'nextInvoiceNumber'>) => {
      const newContact: Contact = { ...contact, id: `cont${Date.now()}`, nextInvoiceNumber: 1 };
      saveData('contacts', [...contacts, newContact], setContacts);
  };

  const updateContact = async (contact: Contact) => {
      saveData('contacts', contacts.map(c => c.id === contact.id ? contact : c), setContacts);
  };

  const deleteContact = async (contactId: string) => {
      saveData('contacts', contacts.filter(c => c.id !== contactId), setContacts);
      // Optional: Decide how to handle transactions associated with the deleted contact
      const updatedTransactions = transactions.map(t => {
          if (t.contactId === contactId) {
              return { ...t, contactId: undefined };
          }
          return t;
      });
      saveData('transactions', updatedTransactions, setTransactions);
  };

  // Fix: Add dummy login/signup functions to satisfy AuthScreen component, which is not fully integrated.
  const login = async (email: string, password: string) => {
    console.warn("Login functionality is not implemented in demo mode.", { email });
    // This is a placeholder. The app doesn't have a user system in demo mode.
    return Promise.resolve();
  };

  const signup = async (name: string, email: string, password: string) => {
    console.warn("Signup functionality is not implemented in demo mode.", { name, email });
    // This is a placeholder.
    return Promise.resolve();
  };

  // --- Company Info ---
  const updateCompanyInfo = async (info: CompanyInfo) => {
      saveData('companyInfo', info, setCompanyInfo);
  };

  // --- Payments ---
  const addPayment = async (transactionId: string, amount: number) => {
    const newPayment = { amount, date: new Date().toISOString() };
    const updatedTransactions = transactions.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          payments: [...(t.payments || []), newPayment]
        };
      }
      return t;
    });
    saveData('transactions', updatedTransactions, setTransactions);
  };
  
  const updatePayment = async (transactionId: string, paymentIndex: number, newAmount: number) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === transactionId && t.payments && t.payments[paymentIndex]) {
        const updatedPayments = [...t.payments];
        updatedPayments[paymentIndex] = { ...updatedPayments[paymentIndex], amount: newAmount };
        return { ...t, payments: updatedPayments };
      }
      return t;
    });
    saveData('transactions', updatedTransactions, setTransactions);
  };
  
  const deletePayment = async (transactionId: string, paymentIndex: number) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === transactionId && t.payments) {
        const updatedPayments = t.payments.filter((_, index) => index !== paymentIndex);
        return { ...t, payments: updatedPayments };
      }
      return t;
    });
    saveData('transactions', updatedTransactions, setTransactions);
  };
  
  // --- Stock In ---
  const addStockInEntry = async (entry: Omit<StockInEntry, 'id'>) => {
      const newEntry: StockInEntry = { ...entry, id: `stockin${Date.now()}` };
      
      const updatedProducts = products.map(p => {
          const itemInEntry = entry.items.find(item => item.productId === p.id);
          if (itemInEntry) {
              const change = itemInEntry.quantity;
              const newHistoryEntry = {
                  date: newEntry.date,
                  change: change,
                  reason: 'restock' as const,
                  stockInId: newEntry.id
              };
              return { ...p, stock: p.stock + change, stockHistory: [...p.stockHistory, newHistoryEntry] };
          }
          return p;
      });

      saveData('products', updatedProducts, setProducts);
      saveData('stockInEntries', [...stockInEntries, newEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), setStockInEntries);
  };
  
  const updateStockInEntry = async (entry: StockInEntry) => {
    const originalEntry = stockInEntries.find(e => e.id === entry.id);
    if (!originalEntry) return;

    const stockChanges = new Map<string, number>();
    originalEntry.items.forEach(item => {
        stockChanges.set(item.productId, (stockChanges.get(item.productId) || 0) - item.quantity);
    });
    entry.items.forEach(item => {
        stockChanges.set(item.productId, (stockChanges.get(item.productId) || 0) + item.quantity);
    });

    const updatedProducts = products.map(p => {
        if (stockChanges.has(p.id)) {
            const change = stockChanges.get(p.id)!;
            if(change !== 0){
                const newHistoryEntry = {
                    date: entry.date,
                    change: change,
                    reason: 'restock_update' as const,
                    stockInId: entry.id
                };
                return { ...p, stock: p.stock + change, stockHistory: [...p.stockHistory, newHistoryEntry] };
            }
        }
        return p;
    });

    saveData('products', updatedProducts, setProducts);
    saveData('stockInEntries', stockInEntries.map(e => e.id === entry.id ? entry : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), setStockInEntries);
  };
  
  const deleteStockInEntry = async (entryId: string) => {
    const entryToDelete = stockInEntries.find(e => e.id === entryId);
    if (!entryToDelete) return;

    const updatedProducts = products.map(p => {
        const itemInEntry = entryToDelete.items.find(item => item.productId === p.id);
        if (itemInEntry) {
            const change = -itemInEntry.quantity;
             const newHistoryEntry = {
                date: new Date().toISOString(),
                change: change,
                reason: 'restock_delete' as const,
                stockInId: entryToDelete.id
            };
            return { ...p, stock: p.stock + change, stockHistory: [...p.stockHistory, newHistoryEntry] };
        }
        return p;
    });

    saveData('products', updatedProducts, setProducts);
    saveData('stockInEntries', stockInEntries.filter(e => e.id !== entryId), setStockInEntries);
  };

  const updateSalesUnitCorrection = async (newCorrection: number) => {
      saveData('salesUnitCorrection', newCorrection, setSalesUnitCorrection);
  }

  const value: AppContextType = {
    products,
    transactions,
    expenses,
    contacts,
    companyInfo,
    stockInEntries,
    resetData,
    addProduct,
    addTransaction,
    addExpense,
    updateExpense,
    deleteExpense,
    addContact,
    updateContact,
    deleteContact,
    // Fix: Add login and signup to the context value.
    login,
    signup,
    updateCompanyInfo,
    addPayment,
    updatePayment,
    deletePayment,
    updateProductStock,
    updateProduct,
    deleteProduct,
    updateTransaction,
    deleteTransaction,
    addStockInEntry,
    updateStockInEntry,
    deleteStockInEntry,
    theme,
    toggleTheme,
    salesUnitCorrection,
    updateSalesUnitCorrection,
    importData,
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