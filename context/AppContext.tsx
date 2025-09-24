import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppContextType, AppProviderProps, Product, Transaction, Expense, Contact, CompanyInfo, Payment, User } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generic function to get initial state from localStorage
const getStoredState = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
    }
    return defaultValue;
};

// --- DEFAULT DATA FOR NEW USERS ---
const initialProducts: Product[] = [
  { id: '1', name: 'Coca-Cola 600ml', price: 3500, cost: 2000, stock: 50, imageUrl: 'https://picsum.photos/id/30/200' },
  { id: '2', name: 'Papas Margarita Pollo', price: 2000, cost: 1200, stock: 100, imageUrl: 'https://picsum.photos/id/40/200' },
  { id: '3', name: 'Chocolatina Jet', price: 500, cost: 300, stock: 200, imageUrl: 'https://picsum.photos/id/50/200' },
];
const initialTransactions: Transaction[] = [];
const initialExpenses: Expense[] = [];
const initialContacts: Contact[] = [];
const initialCompanyInfo: CompanyInfo = {
    name: 'Mi Negocio',
    address: 'Calle Falsa 123, Bogotá',
    phone: '300-555-5555',
    logoUrl: '',
};

// --- USER DATABASE SIMULATION ---
const getUsers = (): User[] => getStoredState<User[]>('users', []);
const setUsers = (users: User[]) => localStorage.setItem('users', JSON.stringify(users));


export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // undefined means we are checking, null means not logged in
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);

  // Check for a logged-in user in session storage on initial load
  useEffect(() => {
    try {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        } else {
            setCurrentUser(null); // No user found
        }
    } catch {
        setCurrentUser(null);
    }
  }, []);
  
  // Load user data when currentUser changes (on login)
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.id;
      setProducts(getStoredState(`products_${userId}`, initialProducts));
      setTransactions(getStoredState(`transactions_${userId}`, initialTransactions));
      setExpenses(getStoredState(`expenses_${userId}`, initialExpenses));
      setContacts(getStoredState(`contacts_${userId}`, initialContacts));
      const userCompanyInfo = getStoredState(`companyInfo_${userId}`, { ...initialCompanyInfo, name: `${currentUser.name}'s Store`});
      setCompanyInfo(userCompanyInfo);

      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else if (currentUser === null) { // On logout
      setProducts([]);
      setTransactions([]);
      setExpenses([]);
      setContacts([]);
      setCompanyInfo(initialCompanyInfo);
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Persist data to localStorage whenever it changes for the logged-in user
  useEffect(() => { if (currentUser) localStorage.setItem(`products_${currentUser.id}`, JSON.stringify(products)); }, [products, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(transactions)); }, [transactions, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(expenses)); }, [expenses, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`contacts_${currentUser.id}`, JSON.stringify(contacts)); }, [contacts, currentUser]);
  useEffect(() => { if (currentUser) localStorage.setItem(`companyInfo_${currentUser.id}`, JSON.stringify(companyInfo)); }, [companyInfo, currentUser]);

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false; // User already exists
    }
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      passwordHash: password, // In a real app, hash and salt the password
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...transaction, id: Date.now().toString() }, ...prev]);
    // Update stock
    transaction.items.forEach(item => {
        setProducts(prev => prev.map(p => 
            p.id === item.productId ? {...p, stock: p.stock - item.quantity} : p
        ))
    })
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [{ ...expense, id: Date.now().toString() }, ...prev]);
  };
    
  const addContact = (contact: Omit<Contact, 'id'>) => {
    setContacts(prev => [...prev, { ...contact, id: Date.now().toString() }]);
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
  };

  const addPayment = (transactionId: string, amount: number) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        const newPayment: Payment = { amount, date: new Date().toISOString() };
        const existingPayments = t.payments || [];
        return { ...t, payments: [...existingPayments, newPayment] };
      }
      return t;
    }));
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    ));
  };

  return (
    <AppContext.Provider value={{ currentUser, login, signup, logout, products, transactions, expenses, contacts, companyInfo, addProduct, addTransaction, addExpense, addContact, updateCompanyInfo, addPayment, updateProductStock }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
