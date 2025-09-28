

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AddSaleModal from '../components/AddSaleModal';

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