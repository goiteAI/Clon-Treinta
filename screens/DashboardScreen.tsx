
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AIAssistant from '../components/AIAssistant';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm">
    <p className="text-sm text-slate-500">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const DashboardScreen: React.FC = () => {
  const { transactions, expenses } = useAppContext();

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
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Balance del Día</h1>
        <p className="text-slate-500">Resumen de tu negocio hoy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Ventas de Hoy" value={formatCurrency(totalSales)} color="text-green-600" />
        <StatCard title="Gastos de Hoy" value={formatCurrency(totalExpenses)} color="text-red-600" />
        <StatCard title="Utilidad" value={formatCurrency(profit)} color={profit >= 0 ? 'text-blue-600' : 'text-red-600'} />
      </div>

      <AIAssistant />
      
       <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Actividad Reciente</h2>
          <p className="text-sm text-slate-600">
              Esta es una versión de demostración de la aplicación Treinta. Los datos son de ejemplo y no se guardan permanentemente.
              Puedes registrar nuevas ventas, productos y gastos para interactuar con la aplicación.
          </p>
       </div>
    </div>
  );
};

export default DashboardScreen;
