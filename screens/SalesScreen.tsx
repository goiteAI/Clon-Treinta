import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
// Fix: Import Product and Contact types to be used in the new getTransactionDescription helper function.
import type { Transaction, Product, Contact } from '../types';
import InvoiceModal from '../components/InvoiceModal';
import AddSaleModal from '../components/AddSaleModal';

// --- ICONS ---
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 13.5h.008v.008H12v-.008z" />
    </svg>
);
const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21M12 12.75h.008v.008H12v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21a3.375 3.375 0 003.375-3.375V12.188c0-.775.625-1.406 1.406-1.406h4.438c.781 0 1.406.631 1.406 1.406v5.438a3.375 3.375 0 003.375 3.375M9 12.188c1.181.563 2.57.563 3.75 0" /></svg>;
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>;
const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12a8.959 8.959 0 01-2.284 5.253" /></svg>;
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;

type ViewMode = 'day' | 'week' | 'month' | 'year';

// --- DATE UTILITY FUNCTIONS ---
const getDayKey = (date: Date) => date.toISOString().split('T')[0];
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};

// Fix: Moved getTransactionDescription outside the component to resolve scope issues.
// It is now a pure helper function that receives products and contacts as arguments.
const getTransactionDescription = (transaction: Transaction, products: Product[], contacts: Contact[]) => {
    const contactName = transaction.contactId ? contacts.find(c => c.id === transaction.contactId)?.name : null;
    if(contactName) return `Venta a ${contactName}`;
    const productNames = transaction.items.map(item => products.find(p => p.id === item.productId)?.name || 'Ítem').join(', ');
    return productNames.length > 40 ? productNames.substring(0, 40) + '...' : productNames || `Venta #${transaction.invoiceNumber}`;
};

const SalesScreen: React.FC = () => {
    const { transactions, products, contacts, companyInfo } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [timelineTitle, setTimelineTitle] = useState('');
    
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    const canAddSale = products.length > 0;

    const timelineItems = useMemo(() => {
        const items = [];
        const centerDate = new Date(currentDate);

        for (let i = -2; i <= 2; i++) {
            const date = new Date(centerDate);
            let key: string;
            let label: string;
            let subLabel: string | undefined;

            switch (viewMode) {
                case 'day':
                    date.setDate(centerDate.getDate() + i);
                    key = getDayKey(date);
                    label = date.getDate().toString();
                    subLabel = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
                    break;
                case 'week':
                    date.setDate(centerDate.getDate() + i * 7);
                    const weekStart = getStartOfWeek(date);
                    key = getDayKey(weekStart);
                    label = `Sem ${getWeekNumber(weekStart)}`;
                    subLabel = undefined;
                    break;
                case 'month':
                    date.setMonth(centerDate.getMonth() + i, 1);
                    key = `${date.getFullYear()}-${date.getMonth()}`;
                    const monthLabel = date.toLocaleDateString('es-ES', { month: 'short' });
                    label = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', '');
                    subLabel = undefined;
                    break;
                case 'year':
                    date.setFullYear(centerDate.getFullYear() + i);
                    key = date.getFullYear().toString();
                    label = date.getFullYear().toString();
                    subLabel = undefined;
                    break;
            }

            items.push({ key, date, label, subLabel });
        }
        return items;
    }, [viewMode, currentDate]);

    useEffect(() => {
        let title = '';
        const date = new Date(currentDate);
        switch (viewMode) {
            case 'day':
                title = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                title = title.charAt(0).toUpperCase() + title.slice(1);
                break;
            case 'week':
            case 'month':
                title = date.getFullYear().toString();
                break;
            case 'year':
                title = 'Selección Anual';
                break;
        }
        setTimelineTitle(title);
    }, [currentDate, viewMode]);

    const { filteredAndGroupedTransactions, periodTotal } = useMemo(() => {
        let startDate: Date, endDate: Date;
        const d = new Date(currentDate);

        switch (viewMode) {
            case 'week':
                startDate = getStartOfWeek(d);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'month':
                startDate = new Date(d.getFullYear(), d.getMonth(), 1);
                endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'year':
                startDate = new Date(d.getFullYear(), 0, 1);
                endDate = new Date(d.getFullYear(), 11, 31);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'day':
            default:
                startDate = new Date(d);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(d);
                endDate.setHours(23, 59, 59, 999);
                break;
        }

        const filtered = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });

        const periodTotal = filtered.reduce((sum, t) => sum + t.totalAmount, 0);

        const groups: { [key: string]: Transaction[] } = {};
        filtered.forEach(t => {
            const dateKey = getDayKey(new Date(t.date));
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(t);
        });

        const filteredAndGroupedTransactions = Object.keys(groups)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map(date => ({
                date,
                transactions: groups[date].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            }));
        
        return { filteredAndGroupedTransactions, periodTotal };

    }, [transactions, currentDate, viewMode]);

    const formatDateGroup = (dateString: string) => {
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    
    const paymentMethodIcons = {
        Efectivo: <BanknotesIcon />,
        Crédito: <CreditCardIcon />,
        Transferencia: <GlobeAltIcon />,
    };

    const handleDateChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        const step = direction === 'prev' ? -1 : 1;

        switch (viewMode) {
            case 'day':
                newDate.setDate(newDate.getDate() + step);
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + (step * 7));
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + step);
                break;
            case 'year':
                newDate.setFullYear(newDate.getFullYear() + step);
                break;
        }
        setCurrentDate(newDate);
    };

    return (
        <div className="pb-20">
            <header className="p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-20 shadow-sm">
               <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{companyInfo.name}</h1>
                        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{timelineTitle}</h2>
                    </div>
                  <div className="flex items-center gap-1">
                      <button onClick={() => handleDateChange('prev')} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Anterior">
                          <ChevronLeftIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      </button>
                      <div className="flex items-center gap-2">
                          {timelineItems.map((item, index) => {
                              const isActive = index === 2;
                              return (
                                 <button 
                                   key={item.key}
                                   onClick={() => setCurrentDate(item.date)}
                                   className={`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg w-16 h-16 transition-colors duration-200 ${
                                      isActive ? 'bg-green-100 text-green-600 dark:bg-slate-700 dark:text-green-400' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                   }`}
                                 >
                                   {item.subLabel && <span className={`text-xs font-semibold uppercase ${isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>{item.subLabel}</span>}
                                   <span className={`text-xl font-bold ${isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'}`}>{item.label}</span>
                                 </button>
                              )
                          })}
                      </div>
                       <button onClick={() => handleDateChange('next')} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Siguiente">
                           <ChevronRightIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                       </button>
                      <div className="relative">
                          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                              <CalendarIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                          </button>
                          {isFilterOpen && (
                              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-30 dark:bg-slate-700">
                                  {(['day', 'week', 'month', 'year'] as ViewMode[]).map(mode => (
                                      <button
                                          key={mode}
                                          onClick={() => { setViewMode(mode); setIsFilterOpen(false); setCurrentDate(new Date())}}
                                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-600"
                                      >
                                          {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : mode === 'month' ? 'Mes' : 'Año'}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
               </div>
            </header>
            
            <div className="p-4 space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Balance</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(periodTotal)}</p>
                </div>

              {filteredAndGroupedTransactions.length > 0 ? filteredAndGroupedTransactions.map(group => (
                <div key={group.date}>
                  <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">{formatDateGroup(group.date)}</h2>
                  <div className="bg-white rounded-lg shadow-sm dark:bg-slate-800 overflow-hidden">
                    <ul className="divide-y dark:divide-slate-700/50">
                      {group.transactions.map(t => (
                        <li key={t.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex-shrink-0">
                              {paymentMethodIcons[t.paymentMethod]}
                            </div>
                            <button 
                              onClick={() => setSelectedTransaction(t)} 
                              className="flex-grow text-left"
                              aria-label={`Ver detalles de la venta #${t.invoiceNumber}`}
                            >
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{getTransactionDescription(t, products, contacts)}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(t.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </button>
                            <div className="text-right">
                              <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(t.totalAmount)}</p>
                            </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )) : (
                 <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                     <p>No hay ventas registradas para este período.</p>
                 </div>
              )}
            </div>

            <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={!canAddSale}
                className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400 disabled:transform-none"
                aria-label={canAddSale ? "Registrar nueva venta" : "Añada productos para poder registrar ventas"}
                title={canAddSale ? "Registrar nueva venta" : "Primero debes añadir productos para poder registrar una venta."}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {isAddModalOpen && <AddSaleModal onClose={() => setIsAddModalOpen(false)} />}
            {selectedTransaction && <InvoiceModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
        </div>
    );
};

export default SalesScreen;