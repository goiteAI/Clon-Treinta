import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import AddSaleModal from '../components/AddSaleModal';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import TopSoldProductsModal from '../components/TopSoldProductsModal';
import InvoiceModal from '../components/InvoiceModal';
import type { Transaction, Product, Contact } from '../types';

// --- ICONS ---
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 13.5h.008v.008H12v-.008z" />
    </svg>
);
const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21M12 12.75h.008v.008H12v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21a3.375 3.375 0 003.375-3.375V12.188c0-.775.625-1.406 1.406-1.406h4.438c.781 0 1.406.631 1.406 1.406v5.438a3.375 3.375 0 003.375 3.375M9 12.188c1.181.563 2.57.563 3.75 0" /></svg>;
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>;
const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12a8.959 8.959 0 01-2.284 5.253" /></svg>;


type ViewMode = 'day' | 'week' | 'month' | 'year';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

// --- DATE UTILITY FUNCTIONS ---
const getDayKey = (date: Date) => date.toISOString().split('T')[0];
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};

const areDatesSame = (d1: Date, d2: Date, mode: ViewMode) => {
    if (mode === 'day') return getDayKey(d1) === getDayKey(d2);
    if (mode === 'month') return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
    if (mode === 'year') return d1.getFullYear() === d2.getFullYear();
    if (mode === 'week') {
        return d1.getFullYear() === d2.getFullYear() && getWeekNumber(d1) === getWeekNumber(d2);
    }
    return false;
}

const getTransactionDescription = (transaction: Transaction, products: Product[], contacts: Contact[]) => {
    const contactName = transaction.contactId ? contacts.find(c => c.id === transaction.contactId)?.name : null;
    if(contactName) return `Venta a ${contactName}`;
    const productNames = transaction.items.map(item => products.find(p => p.id === item.productId)?.name || 'Ítem').join(', ');
    return productNames.length > 40 ? productNames.substring(0, 40) + '...' : productNames || `Venta #${transaction.invoiceNumber}`;
};

const DashboardScreen: React.FC = () => {
  const { transactions, expenses, products, contacts, companyInfo } = useAppContext();
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [isTopSoldModalOpen, setIsTopSoldModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [timelineTitle, setTimelineTitle] = useState('');
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const canAddSale = products.length > 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };
  
   const timelineItems = useMemo(() => {
        const items = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        switch (viewMode) {
            case 'day':
                for (let i = -30; i <= 30; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    items.push({
                        key: getDayKey(date),
                        date: date,
                        label: date.getDate().toString(),
                        subLabel: date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
                    });
                }
                break;
            case 'week':
                const currentWeekStart = getStartOfWeek(today);
                for (let i = -12; i <= 12; i++) {
                    const weekStart = new Date(currentWeekStart);
                    weekStart.setDate(currentWeekStart.getDate() + i * 7);
                    items.push({
                        key: getDayKey(weekStart),
                        date: weekStart,
                        label: getWeekNumber(weekStart).toString(),
                        subLabel: 'Semana',
                    });
                }
                break;
            case 'month':
                for (let i = -12; i <= 12; i++) {
                    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
                    const monthLabel = date.toLocaleDateString('es-ES', { month: 'short' });
                    items.push({
                        key: `${date.getFullYear()}-${date.getMonth()}`,
                        date: date,
                        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', ''),
                        subLabel: date.getFullYear().toString(),
                    });
                }
                break;
            case 'year':
                for (let i = -5; i <= 5; i++) {
                    const date = new Date(today.getFullYear() + i, 0, 1);
                    items.push({
                        key: date.getFullYear().toString(),
                        date: date,
                        label: date.getFullYear().toString(),
                        subLabel: 'Año',
                    });
                }
                break;
        }
        return items;
    }, [viewMode]);

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

    useEffect(() => {
        if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }, [currentDate, viewMode, timelineItems]);

  const dashboardData = useMemo(() => {
    let startDate: Date, endDate: Date;
    const d = new Date(currentDate);

    switch (viewMode) {
        case 'week':
            startDate = getStartOfWeek(d);
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

    const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
    });

    const totalSales = filteredTransactions.reduce((sum: number, t) => sum + t.totalAmount, 0);

    const costs = expenses
      .filter(e => {
          const eDate = new Date(e.date);
          return eDate >= startDate && eDate <= endDate;
      })
      .reduce((sum: number, e) => sum + e.amount, 0);
      
    const unitsSold = filteredTransactions.reduce((totalUnits, t) => {
        return totalUnits + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const salesByPaymentMethod = filteredTransactions.reduce((acc: Record<string, number>, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totalAmount;
        return acc;
    }, {} as Record<string, number>);
    
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach(t => {
        const dateKey = getDayKey(new Date(t.date));
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(t);
    });

    const groupedTransactions = Object.keys(groups)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map(date => ({
            date,
            transactions: groups[date].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        }));

    return {
      totalSales,
      totalExpenses: costs,
      profit: totalSales - costs,
      unitsSold,
      salesByPaymentMethod,
      filteredTransactions,
      groupedTransactions
    };
  }, [transactions, expenses, currentDate, viewMode]);

  const PAYMENT_METHOD_COLORS: { [key: string]: string } = {
    'Efectivo': '#f59e0b',
    'Crédito': '#22c55e',
    'Transferencia': '#3b82f6',
  };
  const FALLBACK_COLOR = '#6b7280';

  const pieData = useMemo(() => {
    return Object.entries(dashboardData.salesByPaymentMethod).map(([name, value]) => ({ name, value }));
  }, [dashboardData.salesByPaymentMethod]);
  
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

  return (
    <div>
      <header className="p-4 bg-yellow-400 dark:bg-yellow-600 sticky top-0 z-20 shadow-md">
         <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-yellow-900 dark:text-white">{companyInfo.name}</h1>
            <div className="relative">
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 rounded-full hover:bg-yellow-500/50 transition-colors">
                    <CalendarIcon className="w-6 h-6 text-yellow-900 dark:text-white" />
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
          <div className="text-center mt-3 mb-2">
              <h2 className="text-sm font-bold text-yellow-800 dark:text-yellow-100 uppercase tracking-wide">{timelineTitle}</h2>
          </div>
         <div ref={timelineRef} className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {timelineItems.map(item => {
                  const isActive = areDatesSame(item.date, currentDate, viewMode);
                  return (
                     <button 
                       key={item.key}
                       ref={isActive ? activeItemRef : null}
                       onClick={() => setCurrentDate(item.date)}
                       className={`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg w-16 h-16 transition-colors duration-200 ${
                          isActive ? 'bg-white shadow-md dark:bg-slate-800' : 'bg-transparent'
                       }`}
                     >
                       <span className={`text-xs font-semibold uppercase ${isActive ? 'text-yellow-600 dark:text-yellow-400' : 'text-yellow-800 dark:text-yellow-200'}`}>{item.subLabel}</span>
                       <span className={`text-xl font-bold ${isActive ? 'text-yellow-800 dark:text-white' : 'text-white'}`}>{item.label}</span>
                     </button>
                  )
              })}
         </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <StatCard title="Ventas" value={formatCurrency(dashboardData.totalSales)} color="text-green-600" />
            <button onClick={() => setIsTopSoldModalOpen(true)} className="text-left w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl">
                <StatCard title="Unidades Vendidas" value={dashboardData.unitsSold.toString()} color="text-amber-500" />
            </button>
            <StatCard title="Gastos" value={formatCurrency(dashboardData.totalExpenses)} color="text-red-600" />
            <StatCard title="Utilidad" value={formatCurrency(dashboardData.profit)} color={dashboardData.profit >= 0 ? 'text-blue-600' : 'text-red-600'} />
        </div>
        
        {pieData.length > 0 ? (
          <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Ventas por Método de Pago</h3>
            <div className="relative w-full max-w-[350px] h-56 mx-auto">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" fill="#8884d8" paddingAngle={5} cornerRadius={5}>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PAYMENT_METHOD_COLORS[entry.name] || FALLBACK_COLOR} className="focus:outline-none" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(dashboardData.totalSales)}</p>
                </div>
            </div>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-4">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_METHOD_COLORS[entry.name] || FALLBACK_COLOR }}></span>
                  <span className="text-slate-600 dark:text-slate-300">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Transacciones del Período</h2>
            {dashboardData.groupedTransactions.length > 0 ? dashboardData.groupedTransactions.map(group => (
            <div key={group.date} className="mb-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">{formatDateGroup(group.date)}</h3>
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
      </div>

      <button onClick={() => setIsAddSaleModalOpen(true)} disabled={!canAddSale} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed" aria-label={canAddSale ? "Registrar nueva venta" : "Añada productos para poder registrar ventas"} title={canAddSale ? "Registrar nueva venta" : "Añada productos para poder registrar ventas"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
      </button>

      {isAddSaleModalOpen && <AddSaleModal onClose={() => setIsAddSaleModalOpen(false)} />}
      {isTopSoldModalOpen && <TopSoldProductsModal onClose={() => setIsTopSoldModalOpen(false)} transactions={dashboardData.filteredTransactions} periodTitle={timelineTitle} />}
      {selectedTransaction && <InvoiceModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
    </div>
  );
};

export default DashboardScreen;