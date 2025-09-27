

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction, TransactionItem, Product } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import InvoiceModal from '../components/InvoiceModal';

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


const SalesScreen: React.FC = () => {
    const { transactions, contacts } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'Efectivo' | 'Crédito' | 'Transferencia'>('all');
    const [contactFilter, setContactFilter] = useState<string>('all');
    
    // Sort states
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const availableYears = useMemo(() => {
        if (transactions.length === 0) return [new Date().getFullYear().toString()];
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear().toString()));
        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    }, [transactions]);

    const [selectedYear, setSelectedYear] = useState<string>(availableYears[0] || new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());

    const monthOptions = [
        { value: 'all', label: 'Todo el Año' }, { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' }, { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];

    useEffect(() => {
        if (selectedYear) {
            if (selectedMonth === 'all') {
                setDateFrom(`${selectedYear}-01-01`);
                setDateTo(`${selectedYear}-12-31`);
            } else {
                const year = parseInt(selectedYear, 10);
                const month = parseInt(selectedMonth, 10);
                const firstDay = new Date(year, month - 1, 1);
                const lastDay = new Date(year, month, 0);

                const pad = (num: number) => num.toString().padStart(2, '0');
                setDateFrom(`${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-${pad(firstDay.getDate())}`);
                setDateTo(`${lastDay.getFullYear()}-${pad(lastDay.getMonth() + 1)}-${pad(lastDay.getDate())}`);
            }
        }
    }, [selectedYear, selectedMonth]);

    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            if (dateFrom && transactionDate < new Date(dateFrom)) return false;
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (transactionDate > toDate) return false;
            }
            if (paymentMethodFilter !== 'all' && t.paymentMethod !== paymentMethodFilter) return false;
            if (contactFilter !== 'all' && t.contactId !== contactFilter) return false;
            return true;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
                return sortOrder === 'desc' ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount;
            }
        });
        
        return filtered;
    }, [transactions, dateFrom, dateTo, paymentMethodFilter, contactFilter, sortBy, sortOrder]);


    const getContactName = (id: string | undefined) => id ? contacts.find(c => c.id === id)?.name || 'Desconocido' : 'Cliente Ocasional';
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const salesSummary = useMemo(() => {
        const totalSales = filteredAndSortedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalTransactions = filteredAndSortedTransactions.length;
        const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;
        const salesByPaymentMethod = filteredAndSortedTransactions.reduce((acc, t) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalSales,
            totalTransactions,
            averageSale,
            salesByPaymentMethod
        };
    }, [filteredAndSortedTransactions]);
    
    const pieData = Object.entries(salesSummary.salesByPaymentMethod).map(([name, value]) => ({ name, value }));
    const COLORS = { 'Efectivo': '#10B981', 'Crédito': '#3B82F6', 'Transferencia': '#F59E0B' };

    const paymentMethodIcons = {
        Efectivo: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.216c-1.356 0-2.46 1.104-2.46 2.46 0 1.355 1.104 2.46 2.46 2.46s2.46-1.105 2.46-2.46v-1.611a1 1 0 011-1 1 1 0 110-2 1 1 0 01-1-1V4a1 1 0 112 0v1.586a1 1 0 011 1v1.611a4.5 4.5 0 01-1.162.216v-1.698c.22.07.41.163.567.267C13.436 7.418 14 8.23 14 9.13v1.543a1 1 0 01-1 1h-1.543a1 1 0 01-1-1v-1.543a1 1 0 011-1h1.543a1 1 0 110 2h-1.543a1 1 0 01-1-1V9.13c0-.9.564-1.712 1.433-2.112zM4.34 8.252A4.5 4.5 0 018.868 6.57v1.698a2.5 2.5 0 00-4.528 0V8.252zM15.66 11.748a4.5 4.5 0 01-4.528 0v1.698a2.5 2.5 0 004.528 0v-1.698z"/></svg>,
        Crédito: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        Transferencia: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5 3-3zM3 4a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1H3z" clipRule="evenodd" /></svg>,
    };

// The type of 'value' from the recharts Tooltip formatter can be a string, number, or array.
// We handle the expected 'number' type for currency formatting and safely convert others to string.
// FIX: Changed `unknown` to `any` to resolve a potential type conflict with the recharts library's formatter prop.
    const currencyTooltipFormatter = (value: any) => {
        if (typeof value === 'number') {
            return formatCurrency(value);
        }
        return String(value ?? '');
    };

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      if (percent < 0.05) { // Don't render label for very small slices
        return null;
      }

      return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
        <div>
            <header className="p-4 border-b bg-white flex justify-between items-center dark:bg-slate-800 dark:border-slate-700">
               <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ventas</h1>
               <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-green-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nueva Venta</span>
                </button>
            </header>
            
            <div className="p-4">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4 dark:bg-slate-800">
                  <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-3">Resumen de Ventas</h2>
                  
                  <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                          <label htmlFor="year-select" className="block text-sm font-medium text-slate-600 dark:text-slate-400">Año</label>
                          <select id="year-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                          </select>
                      </div>
                      <div className="flex-1">
                          <label htmlFor="month-select" className="block text-sm font-medium text-slate-600 dark:text-slate-400">Mes</label>
                          <select id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                              {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Ventas Totales</p>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(salesSummary.totalSales)}</p>
                      </div>
                       <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Promedio por Venta</p>
                          <p className="text-xl font-bold text-blue-600">{formatCurrency(salesSummary.averageSale)}</p>
                      </div>
                      <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Transacciones</p>
                          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{salesSummary.totalTransactions}</p>
                      </div>
                  </div>
                  {pieData.length > 0 && (
                      <div style={{ width: '100%', height: 200 }}>
                          <ResponsiveContainer>
                              <PieChart>
                                  <Pie 
                                    data={pieData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={80} 
                                    fill="#8884d8" 
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                  >
                                  {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                  ))}
                                  </Pie>
                                  <Tooltip formatter={currencyTooltipFormatter} />
                                  <Legend />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  )}
              </div>
              
              <div className="mb-4">
                   <button onClick={() => setShowFilters(!showFilters)} className="w-full text-left font-semibold text-blue-600 p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors dark:bg-blue-900/50 dark:hover:bg-blue-900">
                      {showFilters ? 'Ocultar Filtros y Orden' : 'Mostrar Filtros y Orden'}
                  </button>
                  {showFilters && (
                      <div className="bg-white p-4 rounded-b-lg shadow-sm dark:bg-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Filtering */}
                              <div>
                                  <label className="block text-sm font-medium">Desde</label>
                                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium">Hasta</label>
                                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium">Método de pago</label>
                                  <select value={paymentMethodFilter} onChange={e => setPaymentMethodFilter(e.target.value as any)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                      <option value="all">Todos</option>
                                      <option value="Efectivo">Efectivo</option>
                                      <option value="Crédito">Crédito</option>
                                      <option value="Transferencia">Transferencia</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium">Cliente</label>
                                  <select value={contactFilter} onChange={e => setContactFilter(e.target.value)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                      <option value="all">Todos</option>
                                      {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                              </div>
                              {/* Sorting */}
                              <div>
                                  <label className="block text-sm font-medium">Ordenar por</label>
                                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                      <option value="date">Fecha</option>
                                      <option value="amount">Monto</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium">Orden</label>
                                  <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                      <option value="desc">Descendente</option>
                                      <option value="asc">Ascendente</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
              
              <div className="space-y-3">
                  {filteredAndSortedTransactions.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm dark:bg-slate-800">
                          <div className="flex justify-between items-start">
                             <div className="flex items-start gap-3">
                                <div className="mt-1">{paymentMethodIcons[t.paymentMethod]}</div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{getContactName(t.contactId)}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric'})} - <span className={`font-medium`}>{t.paymentMethod}</span></p>
                                </div>
                             </div>
                              <div className="text-right">
                                  <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{formatCurrency(t.totalAmount)}</p>
                                   <button onClick={() => setSelectedTransaction(t)} className="text-xs text-blue-500 hover:underline">Factura</button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {isModalOpen && <AddSaleModal onClose={() => setIsModalOpen(false)} />}
              {selectedTransaction && <InvoiceModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
            </div>
        </div>
    );
};

export default SalesScreen;