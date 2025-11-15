import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import TopSoldProductsModal from '../components/TopSoldProductsModal';
import AddSaleModal from '../components/AddSaleModal';
import type { Transaction } from '../types';

type TimePeriod = 'today' | 'week' | 'month' | 'year';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const DashboardScreen: React.FC = () => {
  const { transactions, products } = useAppContext();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [isTopSoldModalOpen, setIsTopSoldModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  const canAddSale = products.length > 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  const dashboardData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timePeriod) {
      case 'week': {
        const firstDayOfWeek = new Date(today);
        const day = firstDayOfWeek.getDay();
        const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);
        startDate = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
        break;
      }
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'today':
      default:
        startDate = today;
        break;
    }

    const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);

    const totalSales = filteredTransactions.reduce((sum: number, t) => sum + t.totalAmount, 0);
    const totalExpenses = 0; // Expenses feature removed
    const profit = totalSales - totalExpenses;
    
    const unitsSold = filteredTransactions.reduce((totalUnits, t) => {
        return totalUnits + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    const salesByPaymentMethod = filteredTransactions.reduce((acc: Record<string, number>, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      totalExpenses,
      profit,
      unitsSold,
      salesByPaymentMethod,
      filteredTransactions,
    };
  }, [transactions, timePeriod]);

  const PAYMENT_METHOD_COLORS: { [key: string]: string } = {
    'Efectivo': '#f59e0b',
    'Crédito': '#22c55e',
    'Transferencia': '#3b82f6',
  };
  const FALLBACK_COLOR = '#6b7280';

  const pieData = useMemo(() => {
    return Object.entries(dashboardData.salesByPaymentMethod).map(([name, value]) => ({ name, value }));
  }, [dashboardData.salesByPaymentMethod]);
  
  const periodTitles: Record<TimePeriod, string> = {
      today: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes',
      year: 'Este Año'
  }

  return (
    <div>
      <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Inicio</h1>
        <p className="text-slate-500 dark:text-slate-400">Un resumen del rendimiento de tu negocio.</p>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex justify-center mb-4 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
          {(['today', 'week', 'month', 'year'] as TimePeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${timePeriod === period ? 'bg-white text-green-600 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              {periodTitles[period]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <StatCard title="Ventas" value={formatCurrency(dashboardData.totalSales)} color="text-green-600" />
            <button onClick={() => setIsTopSoldModalOpen(true)} className="text-left w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl">
                <StatCard title="Unidades Vendidas" value={dashboardData.unitsSold.toString()} color="text-amber-500" />
            </button>
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
        ) : (
             <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                 <p>No hay ventas registradas para este período.</p>
             </div>
        )}
      </div>

      <button
        onClick={() => setIsSaleModalOpen(true)}
        disabled={!canAddSale}
        className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400 disabled:transform-none z-30"
        aria-label={canAddSale ? "Registrar nueva venta" : "Añada productos para poder registrar ventas"}
        title={canAddSale ? "Registrar nueva venta" : "Primero debes añadir productos para poder registrar una venta."}
      >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
      </button>

      {isSaleModalOpen && <AddSaleModal transactionToEdit={null} onClose={() => setIsSaleModalOpen(false)} />}
      {isTopSoldModalOpen && <TopSoldProductsModal onClose={() => setIsTopSoldModalOpen(false)} transactions={dashboardData.filteredTransactions} periodTitle={periodTitles[timePeriod]} />}
    </div>
  );
};

export default DashboardScreen;