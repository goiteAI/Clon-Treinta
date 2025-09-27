import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  writeBatch,
  getDoc,
  arrayUnion,
  serverTimestamp,
  DocumentData,
  DocumentSnapshot,
} from 'firebase/firestore';
import { auth, db, DEMO_MODE } from '../firebaseConfig';
import type {
  AppContextType,
  AppProviderProps,
  Product,
  Transaction,
  Expense,
  Contact,
  CompanyInfo,
  User,
} from '../types';

// Initial Data for demonstration
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
  {
    id: 'trans3',
    items: [{ productId: 'prod5', quantity: 1, unitPrice: 1500 }],
    totalAmount: 1500,
    date: new Date().toISOString(),
    paymentMethod: 'Transferencia',
  },
];

const initialExpenses: Expense[] = [
  { id: 'exp1', description: 'Arriendo Local', amount: 500000, category: 'Alquiler', date: new Date(new Date().setDate(1)).toISOString() },
  { id: 'exp2', description: 'Factura de Luz', amount: 120000, category: 'Servicios', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
  { id: 'exp3', description: 'Compra de mercancía', amount: 300000, category: 'Inventario', date: new Date().toISOString() },
];

const initialCompanyInfo: CompanyInfo = {
    name: "Mi Tiendita de Barrio",
    address: "Calle Falsa 123, Bogotá",
    phone: "3000000000",
    logoUrl: ""
};


const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to recursively sanitize Firestore data to avoid circular reference issues.
const sanitizeObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Handle Firestore Timestamps by converting them to ISO strings
    if (obj.hasOwnProperty('seconds') && obj.hasOwnProperty('nanoseconds') && typeof obj.toDate === 'function') {
        return obj.toDate().toISOString();
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = sanitizeObject(obj[key]);
        }
    }
    return newObj;
};


// Helper to convert Firestore docs into plain JS objects
const sanitizeDoc = <T extends { id: string }>(doc: DocumentSnapshot<DocumentData>): T => {
    const data = doc.data();
    if (!data) {
        // This case might happen for documents that exist but have no fields.
        return { id: doc.id } as T;
    }
    const cleanData = sanitizeObject(data);
    return { id: doc.id, ...cleanData } as T;
};


const showDbError = (operation: string) => {
    alert(`Error en la operación: ${operation}. No se pudieron guardar los datos. Verifica tu conexión a internet e inténtalo de nuevo.`);
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
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

  useEffect(() => {
    if (DEMO_MODE) {
        setCurrentUser({ uid: 'demo_user', email: 'demo@example.com', displayName: 'Demo User' });
        setLoading(false);
        return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const appUser: User = { uid: user.uid, email: user.email, displayName: user.displayName };
        setCurrentUser(appUser);
        await fetchData(appUser);
      } else {
        setCurrentUser(null);
        // Reset to demo data on logout
        setProducts(initialProducts);
        setTransactions(initialTransactions);
        setExpenses(initialExpenses);
        setContacts(initialContacts);
        setCompanyInfo(initialCompanyInfo);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const seedData = async (uid: string) => {
      try {
          const batch = writeBatch(db);
          initialProducts.forEach(p => {
              const {id, ...data} = p;
              batch.set(doc(db, 'users', uid, 'products', id), data);
          });
          initialContacts.forEach(c => {
              const {id, ...data} = c;
              batch.set(doc(db, 'users', uid, 'contacts', id), data);
          });
          initialTransactions.forEach(t => {
              const {id, ...data} = t;
              batch.set(doc(db, 'users', uid, 'transactions', id), data);
          });
          initialExpenses.forEach(e => {
              const {id, ...data} = e;
              batch.set(doc(db, 'users', uid, 'expenses', id), data);
          });
          batch.set(doc(db, 'users', uid, 'info', 'company'), initialCompanyInfo);
          
          const userDocRef = doc(db, 'users', uid);
          batch.update(userDocRef, { hasData: true });
          
          await batch.commit();
      } catch (error) {
          console.error("Error seeding data: ", error);
          showDbError("Inicializar datos de demostración");
      }
  }
  
  const fetchData = async (user: User) => {
      try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().hasData) {
              const [productsSnap, transactionsSnap, expensesSnap, contactsSnap, companyInfoDoc] = await Promise.all([
                getDocs(collection(db, 'users', user.uid, 'products')),
                getDocs(collection(db, 'users', user.uid, 'transactions')),
                getDocs(collection(db, 'users', user.uid, 'expenses')),
                getDocs(collection(db, 'users', user.uid, 'contacts')),
                getDoc(doc(db, 'users', user.uid, 'info', 'company'))
              ]);
              setProducts(productsSnap.docs.map(doc => sanitizeDoc<Product>(doc)));
              setTransactions(transactionsSnap.docs.map(doc => sanitizeDoc<Transaction>(doc)));
              setExpenses(expensesSnap.docs.map(doc => sanitizeDoc<Expense>(doc)));
              setContacts(contactsSnap.docs.map(doc => sanitizeDoc<Contact>(doc)));
              if (companyInfoDoc.exists()) {
                 const data = companyInfoDoc.data();
                 const cleanCompanyInfo: CompanyInfo = {
                     name: data.name,
                     address: data.address,
                     phone: data.phone,
                     logoUrl: data.logoUrl,
                 };
                 setCompanyInfo(cleanCompanyInfo);
              }
          } else {
              await seedData(user.uid);
              setProducts(initialProducts);
              setTransactions(initialTransactions);
              setExpenses(initialExpenses);
              setContacts(initialContacts);
              setCompanyInfo(initialCompanyInfo);
          }
      } catch(error) {
          console.error("Error fetching data: ", error);
          alert("No se pudieron cargar los datos de tu negocio. Revisa tu conexión a internet.");
      }
  };

  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password).then(() => {});
  
  const signup = async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      try {
        await setDoc(doc(db, 'users', cred.user.uid), { email, name, createdAt: serverTimestamp(), hasData: false });
      } catch (error) {
        console.error("Error creating user document: ", error);
        showDbError("Crear perfil de usuario");
      }
  };
  
  const logout = () => {
    if (DEMO_MODE) {
        alert("En modo demo, 'Cerrar Sesión' reinicia los datos de ejemplo.");
        window.location.reload();
        return Promise.resolve();
    }
    return signOut(auth);
  }

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (DEMO_MODE) {
        const newProduct = { ...product, id: `prod_${Date.now()}` };
        setProducts(prev => [...prev, newProduct]);
        return;
    }
    if (!currentUser) throw new Error("Not authenticated");
    try {
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'products'), product);
        setProducts(prev => [...prev, { id: docRef.id, ...product }]);
    } catch (error) {
        console.error("Error adding product: ", error);
        showDbError("Añadir producto");
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (DEMO_MODE) {
        const newTransaction = { ...transaction, id: `trans_${Date.now()}` };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        const updatedProducts = products.map(p => {
            const item = transaction.items.find(i => i.productId === p.id);
            if (item) return { ...p, stock: p.stock - item.quantity };
            return p;
        });
        setProducts(updatedProducts);
        return;
    }
    if (!currentUser) throw new Error("Not authenticated");
    try {
        const batch = writeBatch(db);
        const transactionRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
        batch.set(transactionRef, transaction);
        
        transaction.items.forEach(item => {
            const productRef = doc(db, 'users', currentUser.uid, 'products', item.productId);
            const product = products.find(p => p.id === item.productId);
            if (product) {
                batch.update(productRef, { stock: product.stock - item.quantity });
            }
        });

        await batch.commit();

        const newTransaction = { ...transaction, id: transactionRef.id };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        const updatedProducts = products.map(p => {
            const item = transaction.items.find(i => i.productId === p.id);
            if (item) {
                return { ...p, stock: p.stock - item.quantity };
            }
            return p;
        });
        setProducts(updatedProducts);
    } catch (error) {
        console.error("Error adding transaction: ", error);
        showDbError("Registrar venta");
    }
  };
  
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (DEMO_MODE) {
        const newExpense = { ...expense, id: `exp_${Date.now()}` };
        setExpenses(prev => [...prev, newExpense].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        return;
    }
    if (!currentUser) throw new Error("Not authenticated");
    try {
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'expenses'), expense);
        setExpenses(prev => [...prev, { id: docRef.id, ...expense }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        console.error("Error adding expense: ", error);
        showDbError("Registrar gasto");
    }
  };

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    if (DEMO_MODE) {
        const newContact = { ...contact, id: `cont_${Date.now()}` };
        setContacts(prev => [...prev, newContact]);
        return;
    }
    if (!currentUser) throw new Error("Not authenticated");
    try {
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'contacts'), contact);
        setContacts(prev => [...prev, { id: docRef.id, ...contact }]);
    } catch (error) {
        console.error("Error adding contact: ", error);
        showDbError("Añadir contacto");
    }
  };
  
  const updateCompanyInfo = async (info: CompanyInfo) => {
    if (DEMO_MODE) {
        setCompanyInfo(info);
        return;
    }
    if (!currentUser) throw new Error("Not authenticated");
    try {
        await setDoc(doc(db, 'users', currentUser.uid, 'info', 'company'), info);
        setCompanyInfo(info);
    } catch (error) {
        console.error("Error updating company info: ", error);
        showDbError("Actualizar información del negocio");
    }
  };
  
  const addPayment = async (transactionId: string, amount: number) => {
    const newPayment = { amount, date: new Date().toISOString() };
    if (DEMO_MODE) {
        setTransactions(prev => prev.map(t => 
            t.id === transactionId ? { ...t, payments: [...(t.payments || []), newPayment] } : t
        ));
        return;
    }
    if (!currentUser) throw new Error("Not authenticated");
    try {
        const transactionRef = doc(db, 'users', currentUser.uid, 'transactions', transactionId);
        await updateDoc(transactionRef, {
            payments: arrayUnion(newPayment)
        });
        setTransactions(prev => prev.map(t => 
            t.id === transactionId ? { ...t, payments: [...(t.payments || []), newPayment] } : t
        ));
    } catch (error) {
        console.error("Error adding payment: ", error);
        showDbError("Registrar abono");
    }
  };
  
  const updateProductStock = async (productId: string, newStock: number) => {
    if (DEMO_MODE) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
        return;
    }
    if (!currentUser) throw new Error("Not authenticated");
    try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'products', productId), { stock: newStock });
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    } catch (error) {
        console.error("Error updating product stock: ", error);
        showDbError("Actualizar stock");
    }
  };

  const value = {
    products,
    transactions,
    expenses,
    contacts,
    companyInfo,
    currentUser: loading ? undefined : currentUser,
    login,
    signup,
    logout,
    addProduct,
    addTransaction,
    addExpense,
    addContact,
    updateCompanyInfo,
    addPayment,
    updateProductStock,
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