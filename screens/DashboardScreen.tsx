
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AIAssistant from '../components/AIAssistant';
import type { Transaction, TransactionItem, Product } from '../types';

const AddSaleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { products, contacts, addTransaction } = useAppContext();
    const [cart, setCart] = useState<TransactionItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Crédito' | 'Transferencia'>('Efectivo');
    const [contactId, setContactId] = useState<string>('');
    const [paymentDays, setPaymentDays] = useState<number>(0);

    const handleAddProduct = (product: Product) => {
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                 setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
        } else {
            if(product.stock > 0) {
                 setCart([...cart, { productId: product.id, quantity: 1, unitPrice: product.price }]);
            }
        }
    };
    
    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const validatedQuantity = Math.max(0, Math.min(product.stock, newQuantity));

        if (validatedQuantity === 0) {
            setCart(cart.filter(item => item.productId !== productId));
        } else {
            setCart(cart.map(item => item.productId === productId ? { ...item, quantity: validatedQuantity } : item));
        }
    };

    const handleRemoveItem = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cart]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        const baseTransaction = {
            items: cart,
            totalAmount,
            date: new Date().toISOString(),
            paymentMethod,
        };

        const dueDate = (paymentMethod === 'Crédito' && paymentDays > 0)
            ? new Date(new Date().setDate(new Date().getDate() + paymentDays)).toISOString()
            : undefined;

        const newTransaction = {
            ...baseTransaction,
            ...(contactId ? { contactId } : {}),
            ...(dueDate ? { dueDate } : {}),
        };

        addTransaction(newTransaction as Omit<Transaction, 'id'>);
        onClose();
    };
    
    const getProduct = (id: string) => products.find(p => p.id === id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                  <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Registrar Venta</h2>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto pr-2 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Productos Disponibles</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                            {products.map(p => (
                                <button key={p.id} onClick={() => handleAddProduct(p)} className={`p-2 border rounded-md text-center text-sm transition-colors ${p.stock <= 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' : 'bg-green-50 hover:bg-green-100 dark:bg-green-900/50 dark:hover:bg-green-900'}`} disabled={p.stock <= 0}>
                                    {p.name} <span className="text-xs block text-slate-500">({p.stock})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 mt-3">Carrito</h3>
                      {cart.length > 0 ? (
                          <ul className="space-y-2 mt-2">
                              {cart.map(item => {
                                  const product = getProduct(item.productId);
                                  if (!product) return null;
                                  return (
                                      <li key={item.productId} className="flex items-center gap-2 text-sm border-b pb-2 dark:border-slate-700">
                                          <div className="flex-grow">
                                              <p className="font-semibold">{product.name}</p>
                                              <p className="text-xs text-slate-500">${item.unitPrice.toLocaleString('es-CO')} c/u</p>
                                          </div>
                                          <div className="flex items-center gap-1">
                                              <button type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-md font-bold transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">-</button>
                                              <input
                                                  type="number"
                                                  value={item.quantity}
                                                  onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value, 10) || 0)}
                                                  className="w-12 text-center border rounded-md p-1 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                  max={product.stock}
                                                  min="0"
                                              />
                                              <button type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-md font-bold transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">+</button>
                                          </div>
                                          <p className="w-24 text-right font-medium">
                                              ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                                          </p>
                                          <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 transition-colors">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                          </button>
                                      </li>
                                  )
                              })}
                          </ul>
                      ) : <p className="text-sm text-center text-slate-500 py-4 bg-slate-50 rounded-md dark:bg-slate-700/50">Añade productos al carrito</p>}
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t dark:bg-slate-800/50 dark:border-slate-700">
                    <div className="font-bold text-xl text-right mb-4">Total: ${totalAmount.toLocaleString('es-CO')}</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Crédito">Crédito</option>
                        </select>
                        <select value={contactId} onChange={e => setContactId(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Cliente Ocasional</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {paymentMethod === 'Crédito' && (
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plazo en días</label>
                            <input
                                type="number"
                                placeholder="Ej: 30"
                                value={paymentDays || ''}
                                onChange={e => setPaymentDays(parseInt(e.target.value, 10))}
                                className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">Guardar Venta</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const DashboardScreen: React.FC = () => {
  const { transactions, expenses } = useAppContext();
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };
  
  const today = new Date().toISOString().split('T')[0];

  const { totalSales, totalExpenses, profit } = useMemo(() => {
    const salesToday = transactions
      .filter(t => t.date.startsWith(today))
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const expensesToday = expenses
      .filter(e => e.date.startsWith(today))
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalSales: salesToday,
      totalExpenses: expensesToday,
      profit: salesToday - expensesToday
    };
  }, [transactions, expenses, today]);

  return (
    <div>
      <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Balance del Día</h1>
        <p className="text-slate-500 dark:text-slate-400">Resumen de tu negocio hoy.</p>
      </header>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Ventas de Hoy" value={formatCurrency(totalSales)} color="text-green-600" />
          <StatCard title="Gastos de Hoy" value={formatCurrency(totalExpenses)} color="text-red-600" />
          <StatCard title="Utilidad" value={formatCurrency(profit)} color={profit >= 0 ? 'text-blue-600' : 'text-red-600'} />
        </div>

        <AIAssistant />
        
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-300" role="alert">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
                </div>
                <div>
                    <p className="font-bold">Versión de Demostración</p>
                    <p className="text-sm">
                        Los datos son de ejemplo. Puedes registrar nuevas ventas, productos y gastos para interactuar con la aplicación.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <button onClick={() => setIsAddSaleModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105" aria-label="Registrar nueva venta">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
      </button>
      {isAddSaleModalOpen && <AddSaleModal onClose={() => setIsAddSaleModalOpen(false)} />}
    </div>
  );
};

export default DashboardScreen;